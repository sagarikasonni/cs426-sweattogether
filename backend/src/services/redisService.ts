import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

let isConnected = false;

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        isConnected = true;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        isConnected = false;
    }
})();

// Cache the last 10 messages for a chat
export const cacheMessages = async (chatId: string, messages: any[]) => {
    if (!isConnected) return;
    
    try {
        // Store messages in a Redis list, keeping only the last 10
        await redisClient.lPush(`chat:${chatId}:messages`, JSON.stringify(messages));
        await redisClient.lTrim(`chat:${chatId}:messages`, 0, 9);
    } catch (error) {
        console.error('Error caching messages:', error);
    }
};

// Get cached messages for a chat
export const getCachedMessages = async (chatId: string) => {
    if (!isConnected) return [];
    
    try {
        const messages = await redisClient.lRange(`chat:${chatId}:messages`, 0, -1);
        return messages.map(msg => JSON.parse(msg));
    } catch (error) {
        console.error('Error getting cached messages:', error);
        return [];
    }
};

// Add a new message to cache
export const addMessageToCache = async (chatId: string, message: any) => {
    if (!isConnected) return;
    
    try {
        await redisClient.lPush(`chat:${chatId}:messages`, JSON.stringify(message));
        await redisClient.lTrim(`chat:${chatId}:messages`, 0, 9);
    } catch (error) {
        console.error('Error adding message to cache:', error);
    }
};

export default redisClient; 