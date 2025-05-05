import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  participants: [Number],
  lastMessage: {
    text: String,
    timestamp: Date,
    senderId: Number
  }
});

export default mongoose.model('Chat', chatSchema, 'chats');