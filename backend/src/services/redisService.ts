import { createClient } from 'redis';

// Feature toggle for Redis caching
const CACHE_ENABLED = process.env.CACHE_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: any = null;
let isConnected = false;

// Initialize Redis client only if caching is enabled
if (CACHE_ENABLED) {
    redisClient = createClient({
        url: REDIS_URL
    });

    redisClient.on('error', (err: any) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('Connected to Redis'));

    // Connect to Redis
    (async () => {
        try {
            await redisClient.connect();
            isConnected = true;
            console.log('Redis caching enabled');
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            isConnected = false;
        }
    })();
} else {
    console.log('Redis caching disabled via CACHE_ENABLED=false');
}

// Cache the last 10 messages for a chat
export const cacheMessages = async (chatId: string, messages: any[]) => {
    if (!CACHE_ENABLED || !isConnected) return;
    
    try {
        // Clear existing messages for this chat
        await redisClient.del(`chat:${chatId}:messages`);
        
        // Store individual messages in a Redis list, keeping only the last 10
        for (const message of messages.slice(-10)) {
            await redisClient.lPush(`chat:${chatId}:messages`, JSON.stringify(message));
        }
    } catch (error) {
        console.error('Error caching messages:', error);
    }
};

// Get cached messages for a chat
export const getCachedMessages = async (chatId: string) => {
    if (!CACHE_ENABLED || !isConnected) return { messages: [], cacheHit: false };
    
    try {
        const messages = await redisClient.lRange(`chat:${chatId}:messages`, 0, -1);
        // Reverse the order to get chronological order (oldest first)
        const parsedMessages = messages.reverse().map((msg: string) => JSON.parse(msg));
        return { messages: parsedMessages, cacheHit: messages.length > 0 };
    } catch (error) {
        console.error('Error getting cached messages:', error);
        return { messages: [], cacheHit: false };
    }
};

// Add a new message to cache
export const addMessageToCache = async (chatId: string, message: any) => {
    if (!CACHE_ENABLED || !isConnected) return;
    
    try {
        await redisClient.lPush(`chat:${chatId}:messages`, JSON.stringify(message));
        await redisClient.lTrim(`chat:${chatId}:messages`, 0, 9);
    } catch (error) {
        console.error('Error adding message to cache:', error);
    }
};

// Get cache status for monitoring
export const getCacheStatus = () => ({
    enabled: CACHE_ENABLED,
    connected: isConnected
});

export default redisClient; 