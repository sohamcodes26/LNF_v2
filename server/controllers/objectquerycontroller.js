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

        let newLostItem = new LostItem({
            userId, objectName, brand, material, size, markings, colors,
            images: imageUrls,
            locationLost,
            dateLost: new Date(dateLost),
            ...features
        });
        
        await newLostItem.save();
        console.log(`Saved new lost item with ID: ${newLostItem._id}`);

        const searchFilter = {
            status: 'not_resolved',
            canonicalLabel: newLostItem.canonicalLabel,
            dateFound: { $gte: new Date(new Date(newLostItem.dateLost).setDate(newLostItem.dateLost.getDate() - 3)) }, 
            locationFound: { $in: [newLostItem.locationLost, "Campus"] }
        };

        const itemsToSearch = await FoundItem.find(searchFilter).lean();
        
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

        let newFoundItem = new FoundItem({
            userId, objectName, brand, material, size, markings, colors,
            images: imageUrls,
            locationFound,
            dateFound: new Date(dateFound),
            ...features
        });

        await newFoundItem.save();
        console.log(`Saved new found item with ID: ${newFoundItem._id}`);

        const searchFilter = {
            status: 'not_resolved',
            canonicalLabel: newFoundItem.canonicalLabel,
            dateLost: { $lte: new Date(new Date(newFoundItem.dateFound).setDate(newFoundItem.dateFound.getDate() + 3)) },
            locationLost: { $in: [newFoundItem.locationFound, "Campus"] }
        };
        
        const itemsToSearch = await LostItem.find(searchFilter).lean();
        
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
