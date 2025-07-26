const { Redis } = require('ioredis');
const redisClient = new Redis({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => console.error('Redis error:', err));

redisClient.on("reconnecting", (delay) => {
    console.log(`🔄 Redis reconnecting in ${delay}ms...`);
});

module.exports = redisClient;
