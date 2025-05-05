import mongoose from 'mongoose';
import Message from '../models/Message'; 
import Chat from '../models/ChatModel'; 

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mfoley:1234@sweattogether.izltv7y.mongodb.net/?retryWrites=true&w=majority&appName=SweatTogether';

const mockChats: Record<number, { senderId: number; chatId: number; text: string; timestamp: Date }[]> = {
    1: [
      { senderId: 1, chatId: 1, text: 'Hey there!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { senderId: 0, chatId: 1, text: 'How are you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23) },
      { senderId: 1, chatId: 1, text: 'Pretty good!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22.5) },
      { senderId: 1, chatId: 1, text: 'How about you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20) },
    ],
    2: [
      { senderId: 0, chatId: 2, text: 'Hi John!', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { senderId: 2, chatId: 2, text: 'Long time no see.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    ],
    3: [
      { senderId: 0, chatId: 3, text: 'Hello Bob! I saw you like hiking!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { senderId: 3, chatId: 3, text: 'I do! What about you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    ],
    // Profile 6 (Julie) has no messages yet
  };

const seedMockChats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Message.deleteMany({});
    await Chat.deleteMany({});
    console.log('Cleared existing messages and chats');

    // Insert mockChats into the database
    const messages: any[] = [];
    const chats: any[] = []; // Declare the chats array
    for (const chatId in mockChats) {
      const chatMessages = mockChats[chatId];
      chatMessages.forEach((msg) => {
        messages.push({
          senderId: msg.senderId,
          chatId: parseInt(chatId, 10),
          text: msg.text,
          timestamp: msg.timestamp,
        });
      });
      chats.push({
        chatId: parseInt(chatId, 10),
        lastMessage: chatMessages[chatMessages.length - 1], // Use the last message as the lastMessage
      });
    }

    await Message.insertMany(messages);
    console.log('Mock messages inserted into the database');

    await Chat.insertMany(chats);
    console.log('Mock chats inserted into the database');
  } catch (error) {
    console.error('Error seeding mock chats:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedMockChats();