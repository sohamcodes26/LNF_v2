import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatRoomSchema = new Schema({
    users: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'userlogin' // ✅ FIX: Changed ref to 'userlogin' for consistency
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

chatRoomSchema.index({ users: 1 }, { unique: true });

const chatMessageSchema = new Schema({
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'userlogin', // ✅ FIX: Changed ref to 'userlogin' for consistency
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'userlogin', // ✅ FIX: Changed ref to 'userlogin' for consistency
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
