// TODO: Implement routing for messages

import express from 'express';
import { createMessage, getMessagesByChatId, getChatPreviews, deleteMessage } from '../controllers/messageController';
import { getCacheStatus } from '../src/services/redisService';
import { getWebSocketStatus } from '../src/services/socketService';

const router = express.Router();

// Route to create a new message
router.post('/', createMessage);

// Route to delete a message
router.delete('/:messageId', deleteMessage);

// Route to get chat previews (must come before dynamic routes)
router.get('/previews', getChatPreviews);

// Status endpoint for monitoring feature toggles (must come before '/:chatId')
router.get('/status', (req, res) => {
  const start = Date.now();
  const cache = getCacheStatus();
  const websocket = getWebSocketStatus();

  // Optional performance-style headers to align with tests
  res.set({
    'X-Cache-Enabled': cache.enabled ? 'true' : 'false',
    'X-WebSocket-Enabled': websocket.enabled ? 'true' : 'false',
    'X-Response-Time': `${Date.now() - start}ms`,
  });

  res.json({
    cache,
    websocket,
    timestamp: new Date().toISOString(),
  });
});

// Route to get messages for a specific chat by chatId
router.get('/:chatId', getMessagesByChatId);

export default router;