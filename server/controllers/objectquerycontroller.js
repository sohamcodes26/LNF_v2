import { LostItem, FoundItem } from '../schema/objectqueryschema.js';
import Result from '../schema/resultschema.js'; 
import { processItemFeatures, findMatches } from '../services/ai_service.js';

export const reportLostItem = async (req, res) => {
    try {
        const { objectName, brand, material, size, markings, colors, locationLost, dateLost } = req.body;
        const userId = req.id;

        if (!objectName || !locationLost || !dateLost) {
            return res.status(400).json({ message: 'Missing required fields for lost item.' });
        }

        const imageUrls = req.files ? req.files.map(file => file.path) : [];

        const featuresPayload = { objectName, brand, material, size, markings, colors, images: imageUrls };
        const features = await processItemFeatures(featuresPayload);
        if (!features) {
            return res.status(500).json({ message: 'Could not process item features via AI service.' });
        }

        // --- CORRECTED: Create new item with DINOv2 features ---
        let newLostItem = new LostItem({
            userId, objectName, brand, material, size, markings, colors,
            images: imageUrls,
            locationLost,
            dateLost: new Date(dateLost),
            // Save the new features from the AI service
            canonicalLabel: features.canonicalLabel,
            brand_embedding: features.brand_embedding,
            material_embedding: features.material_embedding,
            size_embedding: features.size_embedding,
            colors_embedding: features.colors_embedding,
            image_embeddings: features.image_embeddings
        });
        
        await newLostItem.save();
        console.log(`[Node.js] Saved new lost item with ID: ${newLostItem._id}`);

        // Fetch all unresolved found items to be filtered by the AI
        const itemsToSearch = await FoundItem.find({ status: 'not_resolved' }).lean();
        
        console.log(`[Node.js] Found ${itemsToSearch.length} total candidates to send to AI.`);

        if (itemsToSearch.length > 0) {
            const matchResult = await findMatches(newLostItem.toObject(), itemsToSearch);
            if (matchResult && matchResult.matches.length > 0) {
                const resultsToSave = matchResult.matches
                    .filter(match => newLostItem.userId.toString() !== itemsToSearch.find(item => item._id.toString() === match._id).userId.toString())
                    .map(match => {
                        const foundItem = itemsToSearch.find(item => item._id.toString() === match._id);
                        return {
                            lostQuery: newLostItem._id,
                            foundQuery: foundItem._id,
                            lostItemOwner: newLostItem.userId,
                            foundItemHolder: foundItem.userId,
                            matchConfidence: match.score
                        };
                    });
                if (resultsToSave.length > 0) {
                    await Result.insertMany(resultsToSave, { ordered: false }).catch(err => { if (err.code !== 11000) console.error("Error saving match results:", err); });
                }
            }
        }
        
        res.status(201).json({ message: 'Lost item reported successfully and search initiated.' });

    } catch (err) {
        console.error('Error reporting lost item:', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

export const reportFoundItem = async (req, res) => {
    try {
        const { objectName, brand, material, size, markings, colors, locationFound, dateFound } = req.body;
        const userId = req.id;

        if (!objectName || !locationFound || !dateFound) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (!req.files || req.files.length < 3) {
            return res.status(400).json({ message: 'A minimum of 3 images are required for found items.' });
        }

        const imageUrls = req.files.map(file => file.path);

        const featuresPayload = { objectName, brand, material, size, markings, colors, images: imageUrls };
        const features = await processItemFeatures(featuresPayload);
        if (!features) {
            return res.status(500).json({ message: 'Could not process item features via AI service.' });
        }

        // --- CORRECTED: Create new item with DINOv2 features ---
        let newFoundItem = new FoundItem({
            userId, objectName, brand, material, size, markings, colors,
            images: imageUrls,
            locationFound,
            dateFound: new Date(dateFound),
            // Save the new features from the AI service
            canonicalLabel: features.canonicalLabel,
            brand_embedding: features.brand_embedding,
            material_embedding: features.material_embedding,
            size_embedding: features.size_embedding,
            colors_embedding: features.colors_embedding,
            image_embeddings: features.image_embeddings
        });

        await newFoundItem.save();
        console.log(`[Node.js] Saved new found item with ID: ${newFoundItem._id}`);

        // Fetch all unresolved lost items to be filtered by the AI
        const itemsToSearch = await LostItem.find({ status: 'not_resolved' }).lean();

        console.log(`[Node.js] Found ${itemsToSearch.length} total candidates to send to AI.`);
        
        if (itemsToSearch.length > 0) {
            const matchResult = await findMatches(newFoundItem.toObject(), itemsToSearch);
            if (matchResult && matchResult.matches.length > 0) {
                const resultsToSave = matchResult.matches
                    .filter(match => newFoundItem.userId.toString() !== itemsToSearch.find(item => item._id.toString() === match._id).userId.toString())
                    .map(match => {
                        const lostItem = itemsToSearch.find(item => item._id.toString() === match._id);
                        return {
                            lostQuery: lostItem._id,
                            foundQuery: newFoundItem._id,
                            lostItemOwner: lostItem.userId,
                            foundItemHolder: newFoundItem.userId,
                            matchConfidence: match.score
                        };
                    });
                if (resultsToSave.length > 0) {
                    await Result.insertMany(resultsToSave, { ordered: false }).catch(err => { if (err.code !== 11000) console.error("Error saving match results:", err); });
                }
            }
        }

        res.status(201).json({ message: 'Found item reported successfully.' });

    } catch (err) {
        console.error('Error reporting found item:', err);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};
