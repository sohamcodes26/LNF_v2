import { LostItem, FoundItem } from '../schema/objectqueryschema.js';
import Result from '../schema/resultschema.js'; 
import { processItemFeatures, findMatches } from '../services/ai_service.js';
import { uploadCareImage } from '../middlewares/uploadcareUpload.js';

export const reportLostItem = async (req, res) => {
    try {
        const { objectName, objectDescription, locationLost, dateLost } = req.body;
        const userId = req.id;

        if (!objectName || !objectDescription || !locationLost || !dateLost) {
            return res.status(400).json({ message: 'Missing required fields for lost item.' });
        }

        const objectImageURL = req.file ? req.file.path : null; 
        let newLostItem = new LostItem({
            userId, 
            objectName,
            objectDescription,
            objectImage: objectImageURL,
            locationLost,
            dateLost: new Date(dateLost)
        });

        const featuresPayload = {
            objectName,
            objectDescription,
            objectImage: objectImageURL
        };
        
        const features = await processItemFeatures(featuresPayload);

        if (features) {
            newLostItem.canonicalLabel = features.canonicalLabel;
            newLostItem.text_embedding = features.text_embedding;
            if (features.shape_features) {
                newLostItem.shape_features = features.shape_features;
                newLostItem.color_features = features.color_features;
                newLostItem.texture_features = features.texture_features;
            }
        } else {
            return res.status(500).json({ message: 'Could not process item features via AI service.' });
        }
        
        await newLostItem.save();
        console.log(`Saved new lost item with ID: ${newLostItem._id}`);

        const threeDaysBeforeLost = new Date(newLostItem.dateLost);
        threeDaysBeforeLost.setDate(threeDaysBeforeLost.getDate() - 3);

        const searchFilter = {
            status: 'not_resolved',
            canonicalLabel: newLostItem.canonicalLabel,
            dateFound: { $gte: threeDaysBeforeLost }, 
            $or: [
                { locationFound: newLostItem.locationLost },
                { locationFound: "Campus" },
            ]
        };
        if (newLostItem.locationLost === "Campus") {
            delete searchFilter.$or;
        }

        const itemsToSearch = await FoundItem.find(searchFilter).lean();
        
        let matches = [];
        if (itemsToSearch.length > 0 && newLostItem.canonicalLabel && newLostItem.shape_features) {
            const matchResult = await findMatches(newLostItem.toObject(), itemsToSearch);
            if (matchResult) {
                matches = matchResult.matches;

                if (matches.length > 0) {
                    const resultsToSave = matches
                        .filter(match => {
                            const foundItem = itemsToSearch.find(item => item._id.toString() === match._id);
                            return newLostItem.userId.toString() !== foundItem.userId.toString();
                        })
                        .map(match => {
                            const foundItem = itemsToSearch.find(item => item._id.toString() === match._id);
                            return {
                                lostQuery: newLostItem._id,
                                foundQuery: match._id,
                                lostItemOwner: newLostItem.userId,
                                foundItemHolder: foundItem.userId,
                                matchConfidence: match.score
                            };
                        });
                    
                    if (resultsToSave.length > 0) {
                        await Result.insertMany(resultsToSave, { ordered: false }).catch(err => {
                            if (err.code !== 11000) {
                                console.error("Error saving match results:", err);
                            }
                        });
                        console.log(`Saved ${resultsToSave.length} new match results.`);
                    }
                }
            }
        }
        
        res.status(201).json({ 
            message: 'Lost item reported successfully and search initiated.', 
            item: newLostItem,
            matches: matches
        });

    } catch (err) {
        console.error('Error reporting lost item:', err);
        res.status(500).json({ message: 'Internal Server Error while reporting lost item.' });
    }
};

export const reportFoundItem = async (req, res) => {
    try {
        const { objectName, objectDescription, locationFound, dateFound } = req.body;
        const userId = req.id;

        if (!objectName || !objectDescription || !locationFound || !dateFound) {
            return res.status(400).json({ message: 'Missing required fields for found item.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image is compulsory for found items.' });
        }

        const objectImageURL = req.file ? req.file.path : null;

        let newFoundItem = new FoundItem({
            userId,
            objectName,
            objectDescription,
            objectImage: objectImageURL,
            locationFound,
            dateFound: new Date(dateFound)
        });

        const features = await processItemFeatures({ 
            objectName, 
            objectDescription, 
            objectImage: objectImageURL
        });

        if (features) {
            newFoundItem.canonicalLabel = features.canonicalLabel;
            newFoundItem.text_embedding = features.text_embedding;
            newFoundItem.shape_features = features.shape_features;
            newFoundItem.color_features = features.color_features;
            newFoundItem.texture_features = features.texture_features;
        } else {
            return res.status(500).json({ message: 'Could not process item features via AI service.' });
        }

        await newFoundItem.save();
        console.log(`Saved new found item with ID: ${newFoundItem._id}`);

        const threeDaysAfterFound = new Date(newFoundItem.dateFound);
        threeDaysAfterFound.setDate(threeDaysAfterFound.getDate() + 3);

        const searchFilter = {
            status: 'not_resolved',
            canonicalLabel: newFoundItem.canonicalLabel,
            dateLost: { $lte: threeDaysAfterFound }, 
            $or: [
                { locationLost: newFoundItem.locationFound },
                { locationLost: "Campus" },
            ]
        };
        
        const itemsToSearch = await LostItem.find(searchFilter).lean();
        
        if (itemsToSearch.length > 0) {
            const matchResult = await findMatches(newFoundItem.toObject(), itemsToSearch);
            if (matchResult && matchResult.matches.length > 0) {
                const matches = matchResult.matches;
                console.log(`Found ${matches.length} potential matches for the newly found item.`);

                const resultsToSave = matches
                    .filter(match => {
                        const lostItem = itemsToSearch.find(item => item._id.toString() === match._id);
                        return newFoundItem.userId.toString() !== lostItem.userId.toString();
                    })
                    .map(match => {
                        const lostItem = itemsToSearch.find(item => item._id.toString() === match._id);
                        return {
                            lostQuery: match._id,
                            foundQuery: newFoundItem._id,
                            lostItemOwner: lostItem.userId,
                            foundItemHolder: newFoundItem.userId,
                            matchConfidence: match.score
                        };
                    });

                if (resultsToSave.length > 0) {
                    await Result.insertMany(resultsToSave, { ordered: false }).catch(err => {
                        if (err.code !== 11000) {
                            console.error("Error saving match results:", err);
                        }
                    });
                    console.log(`Saved ${resultsToSave.length} new match results.`);
                }
            }
        }

        res.status(201).json({ 
            message: 'Found item reported successfully. We will notify owners of any matching lost items.', 
            item: newFoundItem 
        });

    } catch (err) {
        console.error('Error reporting found item:', err);
        res.status(500).json({ message: 'Internal Server Error while reporting found item.' });
    }
};