import mongoose from 'mongoose';

// --- Shared AI Feature Fields ---
const aiFeatureFields = {
    canonicalLabel: {
        type: String,
        trim: true,
        index: true 
    },
    // New field-specific text embeddings
    brand_embedding: { type: [Number] },
    material_embedding: { type: [Number] },
    markings_embedding: { type: [Number] },
    
    // New structure for visual features, one per image
    visual_features: [{
        shape_features: [Number],
        color_features: [Number],
        texture_features: [Number]
    }]
};

// --- Corrected Lost Item Schema ---
const lostItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true
    },
    objectName: { // Kept
        type: String,
        required: true,
        trim: true
    },
    // New structured fields
    brand: { type: String, trim: true },
    material: { type: String, trim: true },
    size: { type: String, trim: true },
    markings: { type: String, trim: true },
    colors: { type: [String] },
    images: { // Changed to array for multiple images
        type: [String],
        required: false // Optional for lost items
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
    ...aiFeatureFields 
},
{
    timestamps: true,
    collection: 'lost_items'
});

// --- Corrected Found Item Schema ---
const foundItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true
    },
    objectName: { // Kept
        type: String,
        required: true,
        trim: true
    },
    // New structured fields
    brand: { type: String, trim: true },
    material: { type: String, trim: true },
    size: { type: String, trim: true },
    markings: { type: String, trim: true },
    colors: { type: [String] },
    images: { // Changed to array for multiple images
        type: [String],
        required: true // Required for found items
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
    ...aiFeatureFields 
},
{
    timestamps: true,
    collection: 'found_items'
});

export const LostItem = mongoose.model('LostItem', lostItemSchema);
export const FoundItem = mongoose.model('FoundItem', foundItemSchema);
