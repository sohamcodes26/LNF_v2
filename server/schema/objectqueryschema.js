import mongoose from 'mongoose';

// --- Shared AI Feature Fields ---
const aiFeatureFields = {
    canonicalLabel: {
        type: String,
        trim: true,
        index: true // Add an index for faster searching
    },
    text_embedding: {
        type: [Number] // Array of numbers
    },
    shape_features: {
        type: [Number] // Array of numbers
    },
    color_features: {
        type: [Number] // Array of numbers
    },
    texture_features: {
        type: [Number] // Array of numbers
    }
};

const lostItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true
    },
    objectName: {
        type: String,
        required: true,
        trim: true
    },
    objectDescription: {
        type: String,
        required: true,
        trim: true
    },
    objectImage: {
        type: String,
        required: false // Image is optional for lost items
    },
    locationLost: {
        type: String,
        required: true,
        trim: true
    },
    dateLost: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['not_resolved', 'resolved'],
        default: 'not_resolved'
    },
    ...aiFeatureFields // Add all the AI feature fields here
},
{
    timestamps: true,
    collection: 'lost_items'
});

const foundItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true
    },
    objectName: {
        type: String,
        required: true,
        trim: true
    },
    objectDescription: {
        type: String,
        required: true,
        trim: true
    },
    objectImage: {
        type: String,
        required: true
    },
    locationFound: {
        type: String,
        required: true,
        trim: true
    },
    dateFound: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['not_resolved', 'resolved'],
        default: 'not_resolved'
    },
    ...aiFeatureFields // Add all the AI feature fields here
},
{
    timestamps: true,
    collection: 'found_items'
});

export const LostItem = mongoose.model('LostItem', lostItemSchema);
export const FoundItem = mongoose.model('FoundItem', foundItemSchema);
