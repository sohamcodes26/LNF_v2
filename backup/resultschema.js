import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Represents a potential match between a LostItem and a FoundItem.
 * This schema acts as a linking table to manage the many-to-many
 * relationship between lost and found items.
 */
const resultSchema = new Schema({
    // Reference to the Lost Item Query
    lostQuery: {
        type: Schema.Types.ObjectId,
        ref: 'LostItem', // Correctly references your LostItem model
        required: true
    },

    // Reference to the Found Item Query
    foundQuery: {
        type: Schema.Types.ObjectId,
        ref: 'FoundItem', // Correctly references your FoundItem model
        required: true
    },

    // The user who created the LostQuery.
    // This is stored here for quick access without extra lookups,
    // simplifying the process of initiating a chat.
    lostItemOwner: {
        type: Schema.Types.ObjectId,
        ref: 'userlogin', // Correctly references your userlogin model
        required: true
    },

    // The user who created the FoundQuery.
    foundItemHolder: {
        type: Schema.Types.ObjectId,
        ref: 'userlogin', // Correctly references your userlogin model
        required: true
    },
    
    // Status of the match, tracking the process from initial match to resolution.
    status: {
        type: String,
        // 'pending': System-generated match. No user action yet.
        // 'confirmed': Both users agree it's a correct match.
        // 'transfer_complete': The item has been successfully returned.
        // 'rejected': One or both users have denied the match.
        enum: ['pending', 'confirmed', 'transfer_complete', 'rejected'],
        default: 'pending'
    },
    
    // Optional: You could store a confidence score from your matching algorithm
    matchConfidence: {
        type: Number,
        min: 0,
        max: 1
    }

}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create a compound unique index to prevent duplicate matches
// between the exact same lost and found queries.
resultSchema.index({ lostQuery: 1, foundQuery: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);

export default Result;
