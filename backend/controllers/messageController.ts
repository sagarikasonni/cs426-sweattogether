import { Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/ChatModel";

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

    // Check if the chat already exists in the chats table
    const existingChat = await Chat.findOne({ chatId });
    if (!existingChat) {
      // If the chat doesn't exist, create it
      await Chat.create({
        chatId,
        lastMessage: {
          text: newMessage.text,
          timestamp: newMessage.timestamp,
          senderId: newMessage.senderId,
        },
      });
    } else {
      // If the chat exists, update its lastMessage field
      await Chat.findOneAndUpdate(
        { chatId },
        {
          lastMessage: {
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            senderId: newMessage.senderId,
          },
        },
        { new: true } // Return the updated document
      );
    }

    // Respond with the created message
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

    // Validate chatId
    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId parameter" });
    }

    // Fetch messages for the given chatId, sorted by timestamp
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });

    // Respond with the messages
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPreviews = async (req: Request, res: Response): Promise<any> => {
  try {
    // Fetch all chats with their last message
    const chats = await Chat.aggregate([
      {
        $lookup: {
          from: 'messages', // Name of the messages collection
          localField: 'chatId',
          foreignField: 'chatId',
          as: 'messages',
        },
      },
      {
        $project: {
          chatId: 1,
          lastMessage: { $arrayElemAt: ['$messages', -1] }, // Get the last message
        },
      },
      {
        $project: {
          chatId: 1,
          senderId: '$lastMessage.senderId',
          text: '$lastMessage.text',
          timestamp: '$lastMessage.timestamp',
        },
      },
    ]);

    return res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chat previews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

