import mongoose from 'mongoose';
const aiFeatureFields = {
    canonicalLabel: {
        type: String,
        trim: true,
        index: true 
    },
    text_embedding: {
        type: [Number] 
    },
    shape_features: {
        type: [Number] 
    },
    color_features: {
        type: [Number] 
    },
    texture_features: {
        type: [Number] 
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
        required: false 
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
    ...aiFeatureFields 
},
{
    timestamps: true,
    collection: 'found_items'
});

export const LostItem = mongoose.model('LostItem', lostItemSchema);
export const FoundItem = mongoose.model('FoundItem', foundItemSchema);
