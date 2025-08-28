import { Item } from '../schema/objectqueryschema.js';
import Result from '../schema/resultschema.js'; 
import { processItemFeatures, findMatches } from '../services/ai_service.js';

// Consolidated controller for both lost and found items
export const reportItem = async (req, res) => {
    try {
        // --- 1. Extract and Validate New Data Structure ---
        const {
            itemType, // 'lost' or 'found'
            objectName, brand, material, size, markings, colors,
            location, date
        } = req.body;
        const userId = req.id;

        // Basic validation
        if (!itemType || !objectName || !location || !date) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (itemType === 'found' && (!req.files || req.files.length < 3)) {
             return res.status(400).json({ message: 'A minimum of 3 images are required for found items.' });
        }

        // Handle multiple image URLs from middleware
        const imageUrls = req.files ? req.files.map(file => file.path) : [];

        // --- 2. Call AI Service with the Unified Payload ---
        const featuresPayload = {
            objectName, brand, material, size, markings, colors,
            images: imageUrls
        };
        
        const features = await processItemFeatures(featuresPayload);
        if (!features) {
            return res.status(500).json({ message: 'Could not process item features via AI service.' });
        }

        // --- 3. Create and Save the New Item Document ---
        const newItem = new Item({
            userId,
            itemType,
            objectName,
            brand,
            material,
            size,
            markings,
            colors,
            location,
            date: new Date(date),
            images: imageUrls,
            // Populate AI features from the response
            canonicalLabel: features.canonicalLabel,
            brand_embedding: features.brand_embedding,
            material_embedding: features.material_embedding,
            markings_embedding: features.markings_embedding,
            visual_features: features.visual_features
        });
        
        await newItem.save();
        console.log(`Saved new ${itemType} item with ID: ${newItem._id}`);

        // --- 4. Perform Matching Logic ---
        const isLostItemQuery = newItem.itemType === 'lost';
        const searchItemType = isLostItemQuery ? 'found' : 'lost';
        
        // Define date and location search parameters based on the new item
        const dateFilter = isLostItemQuery 
            ? { date: { $gte: new Date(new Date(newItem.date).setDate(newItem.date.getDate() - 3)) } } // Found within 3 days prior
            : { date: { $lte: new Date(new Date(newItem.date).setDate(newItem.date.getDate() + 3)) } }; // Lost within 3 days after
        
        const locationFilter = {
            location: { $in: [newItem.location, "Campus"] }
        };

        const searchFilter = {
            itemType: searchItemType,
            status: 'not_resolved',
            canonicalLabel: newItem.canonicalLabel,
            ...dateFilter,
            ...locationFilter
        };

        const itemsToSearch = await Item.find(searchFilter).lean();
        
        if (itemsToSearch.length > 0) {
            const matchResult = await findMatches(newItem.toObject(), itemsToSearch);
            if (matchResult && matchResult.matches.length > 0) {
                // (The logic to create and save Result documents remains largely the same)
                const resultsToSave = matchResult.matches
                    .filter(match => {
                        const matchedItem = itemsToSearch.find(item => item._id.toString() === match._id);
                        return newItem.userId.toString() !== matchedItem.userId.toString();
                    })
                    .map(match => {
                        const matchedItem = itemsToSearch.find(item => item._id.toString() === match._id);
                        return {
                            lostQuery: isLostItemQuery ? newItem._id : matchedItem._id,
                            foundQuery: isLostItemQuery ? matchedItem._id : newItem._id,
                            lostItemOwner: isLostItemQuery ? newItem.userId : matchedItem.userId,
                            foundItemHolder: isLostItemQuery ? matchedItem.userId : newItem.userId,
                            matchConfidence: match.score
                        };
                    });
                
                if (resultsToSave.length > 0) {
                    await Result.insertMany(resultsToSave, { ordered: false }).catch(err => {
                        if (err.code !== 11000) console.error("Error saving match results:", err);
                    });
                    console.log(`Saved ${resultsToSave.length} new match results.`);
                }
            }
        }
        
        res.status(201).json({ 
            message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} item reported successfully.`, 
            item: newItem
        });

    } catch (err) {
        console.error(`Error reporting ${req.body.itemType || 'item'}:`, err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};