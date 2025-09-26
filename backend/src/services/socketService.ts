import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { addMessageToCache } from './redisService';

// Feature toggle for WebSocket
const WEBSOCKET_ENABLED = process.env.WEBSOCKET_ENABLED !== 'false'; // Default to true

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
    if (!WEBSOCKET_ENABLED) {
        console.log('WebSocket disabled via WEBSOCKET_ENABLED=false');
        return null;
    }

    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a chat room
        socket.on('joinChat', (chatId: string) => {
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat ${chatId}`);
        });

        // Leave a chat room
        socket.on('leaveChat', (chatId: string) => {
            socket.leave(chatId);
            console.log(`User ${socket.id} left chat ${chatId}`);
        });

        // Handle new messages
        socket.on('sendMessage', async (data: { chatId: string; message: any }) => {
            const { chatId, message } = data;
            
            // Add message to Redis cache
            await addMessageToCache(chatId, message);
            
            // Broadcast the message to all users in the chat room
            io!.to(chatId).emit('newMessage', message);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!WEBSOCKET_ENABLED || !io) {
        return null; // Return null instead of throwing error when disabled
    }
    return io;
};

// Get WebSocket status for monitoring
export const getWebSocketStatus = () => ({
    enabled: WEBSOCKET_ENABLED,
    initialized: io !== null
}); 