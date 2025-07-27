import { LostItem, FoundItem } from '../schema/objectqueryschema.js';

export const getMyLostItems = async (req, res) => {
    try {
        const userId = req.id;

        // Fetch the items directly from the database.
        // The 'objectImage' field already contains the full public URL.
        const lostItems = await LostItem.find({ userId: userId });

        // No need to modify the URL, just send the items as they are.
        res.status(200).json({ lostItems: lostItems });

    } catch (err) {
        console.error('Error fetching lost items:', err);
        res.status(500).json({ message: 'Internal Server Error while fetching lost items.' });
    }
};

export const getMyFoundItems = async (req, res) => {
    try {
        const userId = req.id;

        // Fetch the items directly from the database.
        const foundItems = await FoundItem.find({ userId: userId });

        // No need to modify the URL, just send the items as they are.
        res.status(200).json({ foundItems: foundItems });
        
    } catch (err) {
        console.error('Error fetching found items:', err);
        res.status(500).json({ message: 'Internal Server Error while fetching found items.' });
    }
};
