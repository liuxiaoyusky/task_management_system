// src/middlewares/cache.middleware.js

const redis = require('redis');

// Create a Redis client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('Redis error: ', err);
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('ready', () => {
    console.log('Redis client is ready');
});

redisClient.connect(); // Connect to the Redis server

// Function to check Redis connection
const checkRedisConnection = async () => {
    try {
        await redisClient.set('test-key', 'test-value');
        const value = await redisClient.get('test-key');
        if (value === 'test-value') {
            console.log('Redis connection successful');
        } else {
            console.log('Redis connection failed');
        }
    } catch (error) {
        console.error('Error testing Redis connection:', error);
    }
};


const disconnectRedis = async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
};

checkRedisConnection(); // Call the function to test Redis connection

module.exports = redisClient;
