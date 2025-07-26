import mongoose from 'mongoose';

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
},
{
    timestamps: true,
    collection: 'found_items'
});

export const LostItem = mongoose.model('LostItem', lostItemSchema);
export const FoundItem = mongoose.model('FoundItem', foundItemSchema);
