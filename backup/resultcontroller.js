import Result from '../schema/resultschema.js'; // Adjust path as needed
import mongoose from 'mongoose';

/**
 * Retrieves all match results relevant to the authenticated user.
 * A result is relevant if the user is either the owner of the lost item
 * or the holder of the found item.
 */
export const getMyMatches = async (req, res) => {
    const userId = req.id; // From validate_token middleware

    try {
        const matches = await Result.find({
            $or: [{ lostItemOwner: userId }, { foundItemHolder: userId }]
        })
        .populate('lostQuery', 'objectName objectDescription objectImage dateLost locationLost')
        .populate('foundQuery', 'objectName objectDescription objectImage dateFound locationFound')
        .populate('lostItemOwner', 'name email') // Adjust fields as needed for your user model
        .populate('foundItemHolder', 'name email') // Adjust fields as needed for your user model
        .sort({ createdAt: -1 });

        // ✅ FIX: Always return the data inside a "matches" object for consistency.
        res.status(200).json({ matches: matches });

    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ message: 'Server error while fetching matches.' });
    }
};
