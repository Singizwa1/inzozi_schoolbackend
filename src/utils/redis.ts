import { createClient } from 'redis';
import { config } from 'dotenv';
import { logger } from './logger';

config();

const host = process.env.REDIS_HOST || 'localhost';
const portStr = process.env.REDIS_PORT || '6379';
const password = process.env.REDIS_PASSWORD || '';
const dbStr = process.env.REDIS_DB || '0';

const port = Number.isNaN(parseInt(portStr)) ? 6379 : parseInt(portStr);
const database = Number.isNaN(parseInt(dbStr)) ? 0 : parseInt(dbStr);


logger.info(`Redis configuration: ${host}:${port}, DB:${database}`);

export const redis = createClient({
  socket: {
    host,
    port,
  },
  password: password ||'',
  database,
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