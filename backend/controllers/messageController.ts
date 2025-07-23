import { Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/ChatModel";
import { getIO } from "../src/services/socketService";
import { cacheMessages, getCachedMessages, addMessageToCache } from "../src/services/redisService";

// Create a new message
export const createMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { senderId, chatId, text } = req.body;

    // Validate required fields
    if (senderId === undefined || chatId === undefined || text === undefined || text === '') {
      return res.status(400).json({ error: "Missing required fields: senderId, chatId, or text" });
    }

    // Create a new message
    const newMessage = await Message.create({
      senderId,
      chatId,
      text,
      timestamp: new Date(),
    });

    // Update chat with last message
    const existingChat = await Chat.findOne({ chatId });
    if (!existingChat) {
      await Chat.create({
        chatId,
        lastMessage: {
          text: newMessage.text,
          timestamp: newMessage.timestamp,
          senderId: newMessage.senderId,
        },
      });
    } else {
      await Chat.findOneAndUpdate(
        { chatId },
        {
          lastMessage: {
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            senderId: newMessage.senderId,
          },
        },
        { new: true }
      );
    }

    // Try to add message to Redis cache (will be skipped if Redis is not available)
    await addMessageToCache(chatId.toString(), newMessage);

    // Emit the new message through WebSocket
    try {
      const io = getIO();
      io.to(chatId.toString()).emit('newMessage', newMessage);
    } catch (error) {
      console.error('WebSocket error:', error);
      // Continue even if WebSocket fails
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all messages for a specific chat
export const getMessagesByChatId = async (req: Request, res: Response): Promise<any> => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId parameter" });
    }

    // Try to get messages from Redis cache first
    let messages = await getCachedMessages(chatId.toString());

    // If no cached messages, fetch from MongoDB
    if (messages.length === 0) {
      messages = await Message.find({ chatId }).sort({ timestamp: 1 });
      // Try to cache the messages (will be skipped if Redis is not available)
      await cacheMessages(chatId.toString(), messages);
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPreviews = async (req: Request, res: Response): Promise<any> => {
  try {
    // Fetch all chats
    const chats = await Chat.find({});

    // For each chat, try to get the last message from Redis first
    const chatPreviews = await Promise.all(chats.map(async (chat) => {
      const cachedMessages = await getCachedMessages(chat.chatId.toString());
      const lastMessage = cachedMessages[0] || chat.lastMessage;

      return {
        chatId: chat.chatId,
        senderId: lastMessage.senderId,
        text: lastMessage.text,
        timestamp: lastMessage.timestamp,
      };
    }));

    return res.status(200).json(chatPreviews);
  } catch (error) {
    console.error('Error fetching chat previews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

