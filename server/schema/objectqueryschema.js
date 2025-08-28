import mongoose from 'mongoose';

// A single, unified schema for both lost and found items
const itemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true,
        index: true
    },
    itemType: {
        type: String,
        enum: ['lost', 'found'],
        required: true,
        index: true
    },
    // --- Core Fields from Frontend ---
    objectName: { // Reinstated
        type: String,
        required: true,
        trim: true
    },
    brand: { // New
        type: String,
        trim: true
    },
    material: { // New
        type: String,
        trim: true
    },
    size: { // New
        type: String,
        trim: true
    },
    markings: { // New
        type: String,
        trim: true
    },
    colors: { // New
        type: [String]
    },
    images: { // Updated for multiple images
        type: [String],
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['not_resolved', 'resolved'],
        default: 'not_resolved',
        index: true
    },

    // --- AI-Generated Feature Fields ---
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
},
{
    timestamps: true,
    collection: 'items' // A single collection for all items
});

export const Item = mongoose.model('Item', itemSchema);