// TODO: Implement routing for messages

import express from 'express';
import { createMessage, getMessagesByChatId, getChatPreviews } from '../controllers/messageController';

const router = express.Router();

// Route to create a new message
router.post('/', createMessage);

// Route to get messages for a specific chat by chatId
router.get('/previews', getChatPreviews);

router.get('/:chatId', getMessagesByChatId);

export default router;