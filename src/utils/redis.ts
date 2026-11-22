import { createClient } from 'redis';
import { config } from 'dotenv';
import { logger } from './logger';

config();

const url = process.env.REDIS_URL || 'redis://localhost:6379';

logger.info(`Redis configuration: ${url}`);

export const redis = createClient({
  url,
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

redis.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`, { stack: err.stack });
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

export default redis;