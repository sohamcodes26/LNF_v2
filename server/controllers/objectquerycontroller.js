import { LostItem, FoundItem } from '../schema/objectqueryschema.js';

export const reportLostItem = async (req, res) => {
    try {
        const { objectName, objectDescription, locationLost, dateLost } = req.body;
        const userId = req.id;

        if (!objectName || !objectDescription || !locationLost || !dateLost) {
            return res.status(400).json({ message: 'Missing required fields for lost item.' });
        }

        const objectImage = req.file ? req.file.path : null;

        const newLostItem = await LostItem.create({
            userId, 
            objectName,
            objectDescription,
            objectImage: objectImage,
            locationLost,
            dateLost: new Date(dateLost)
        });

        res.status(201).json({ message: 'Lost item reported successfully', item: newLostItem });
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

        const objectImage = req.file ? req.file.path : null;

        if (!objectImage) {
            return res.status(400).json({ message: 'Image is compulsory for found items.' });
        }

        const newFoundItem = await FoundItem.create({
            userId,
            objectName,
            objectDescription,
            objectImage,
            locationFound,
            dateFound: new Date(dateFound)
        });

        res.status(201).json({ message: 'Found item reported successfully', item: newFoundItem });
    } catch (err) {
        console.error('Error reporting found item:', err);
        res.status(500).json({ message: 'Internal Server Error while reporting found item.' });
    }
};
