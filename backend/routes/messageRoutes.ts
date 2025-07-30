// TODO: Implement routing for messages

import express from 'express';
import { createMessage, getMessagesByChatId, getChatPreviews, deleteMessage } from '../controllers/messageController';

const router = express.Router();

// Route to create a new message
router.post('/', createMessage);

// Route to delete a message
router.delete('/:messageId', deleteMessage);

// Route to get messages for a specific chat by chatId
router.get('/previews', getChatPreviews);

router.get('/:chatId', getMessagesByChatId);

export default router;