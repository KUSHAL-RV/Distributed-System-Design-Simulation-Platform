import 'dotenv/config';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    if (times > 5) {
      console.warn('[Redis] Max retries reached, stopping reconnection attempts');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 500, 5000);
    console.log(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  lazyConnect: true, // Don't connect immediately
  enableOfflineQueue: true, // Queue commands when disconnected
};

export const redis = new Redis(REDIS_URL, redisOptions);

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

redis.on('error', (err: Error) => {
  // Only log once, not spam
  if (!(redis as any).__errorLogged) {
    console.warn('[Redis] Connection unavailable — auth sessions will use in-memory fallback');
    (redis as any).__errorLogged = true;
  }
});

// Separate pub/sub clients (Redis requires dedicated connections for subscriptions)
export const redisSub = new Redis(REDIS_URL, { ...redisOptions });
export const redisPub = new Redis(REDIS_URL, { ...redisOptions });

// Graceful connect — attempt to connect, but don't crash if Redis is down
export async function connectRedis() {
  try {
    await redis.connect();
    await redisSub.connect();
    await redisPub.connect();
  } catch (err) {
    console.warn('[Redis] Could not connect — continuing without Redis');
  }
}

// In-memory session fallback when Redis is unavailable
const memoryStore = new Map<string, Set<string>>();

export const sessionStore = {
  async sadd(key: string, value: string): Promise<void> {
    try {
      if (redis.status === 'ready') {
        await redis.sadd(key, value);
        return;
      }
    } catch {}
    // Fallback to memory
    if (!memoryStore.has(key)) memoryStore.set(key, new Set());
    memoryStore.get(key)!.add(value);
  },

  async sismember(key: string, value: string): Promise<boolean> {
    try {
      if (redis.status === 'ready') {
        return (await redis.sismember(key, value)) === 1;
      }
    } catch {}
    return memoryStore.get(key)?.has(value) ?? false;
  },

  async srem(key: string, value: string): Promise<void> {
    try {
      if (redis.status === 'ready') {
        await redis.srem(key, value);
        return;
      }
    } catch {}
    memoryStore.get(key)?.delete(value);
  },

  async del(key: string): Promise<void> {
    try {
      if (redis.status === 'ready') {
        await redis.del(key);
        return;
      }
    } catch {}
    memoryStore.delete(key);
  },

  async expire(key: string, seconds: number): Promise<void> {
    try {
      if (redis.status === 'ready') {
        await redis.expire(key, seconds);
      }
    } catch {}
    // Memory store doesn't support TTL — acceptable for dev
  },
};

export default redis;
