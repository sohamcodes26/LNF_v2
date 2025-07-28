import { ChatRoom, ChatMessage } from '../schema/chatschema.js';
import mongoose from 'mongoose';

export const getOrCreateChatRoom = async (req, res) => {
    const currentUserId = req.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
        return res.status(400).json({ message: 'otherUserId is required.' });
    }

    if (currentUserId === otherUserId) {
        return res.status(400).json({ message: 'Cannot create a chat room with yourself.' });
    }

    const sortedUsers = [currentUserId, otherUserId]
        .map(id => new mongoose.Types.ObjectId(id))
        .sort((a, b) => a.toString().localeCompare(b.toString()));

    try {
        let room = await ChatRoom.findOne({ users: sortedUsers });

        if (!room) {
            room = new ChatRoom({ users: sortedUsers });
            await room.save();
        }

        res.status(200).json({ roomId: room._id });

    } catch (error) {
        console.error('Error in getOrCreateChatRoom:', error);
        res.status(500).json({ message: 'Server error while getting or creating chat room.' });
    }
};

export const sendMessage = async (req, res) => {
    const senderId = req.id;
    const { roomId, message } = req.body;

    if (!roomId || !message) {
        return res.status(400).json({ message: 'roomId and message are required.' });
    }

    try {
        const room = await ChatRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Chat room not found.' });
        }

        if (!room.users.map(id => id.toString()).includes(senderId)) {
            return res.status(403).json({ message: 'Sender is not a member of this chat room.' });
        }

        const receiverId = room.users.find(id => id.toString() !== senderId);

        // ✅ FIX: Added a check to ensure a receiver was found.
        if (!receiverId) {
            console.error(`Could not find a receiver in room ${roomId} for sender ${senderId}`);
            return res.status(500).json({ message: 'Internal server error: Chat room is invalid.' });
        }

        const chatMessage = new ChatMessage({
            chatRoom: roomId,
            sender: senderId,
            receiver: receiverId,
            message: message
        });
        await chatMessage.save();
        
        const populatedMessage = await chatMessage.populate('sender', 'email name'); // Assuming 'name' field exists

        const io = req.app.get('socketio');
        io.to(roomId).emit('newMessage', populatedMessage);

        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: 'Server error while sending message.' });
    }
};

export const getChatHistory = async (req, res) => {
    const userId = req.id;
    const { roomId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
             return res.status(400).json({ message: 'Invalid roomId format.' });
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Chat room not found.' });
        }
        if (!room.users.map(id => id.toString()).includes(userId)) {
            return res.status(403).json({ message: 'You are not a member of this chat room.' });
        }

        const messages = await ChatMessage.find({ chatRoom: roomId })
            .sort({ createdAt: 1 })
            .populate('sender'); // Assuming 'name' field exists

        ChatMessage.updateMany(
            { chatRoom: roomId, receiver: userId, read: false },
            { $set: { read: true } }
        ).catch(err => console.error("Failed to mark messages as read:", err));

        res.status(200).json(messages);

    } catch (error) {
        console.error('Error in getChatHistory:', error);
        res.status(500).json({ message: 'Server error while fetching chat history.' });
    }
};
