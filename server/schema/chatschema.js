// src/chatschema.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatRoomSchema = new Schema({
    users: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'userlogin'
        }],
        required: true,
        validate: [
            (val) => val.length === 2,
            'A chat room must have exactly two users.'
        ]
    }
}, {
    timestamps: true
});

// ------------------ THE FIX IS HERE ------------------
// Create a compound unique index on the 'users' array.
// This ensures the combination of users is unique.
chatRoomSchema.index({ users: 1 }, { unique: true });
// ----------------------------------------------------

const chatMessageSchema = new Schema({
    // ... your chatMessageSchema remains unchanged
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'userlogin',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export {
    ChatRoom,
    ChatMessage
};