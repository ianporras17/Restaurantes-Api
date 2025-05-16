// src/utils/cache.js
import { createClient } from 'redis';

const USE_REDIS = process.env.NODE_ENV !== 'test';

let redisClient;

async function getRedis() {
  if (!USE_REDIS) return null;
  if (redisClient?.isOpen) return redisClient;

  redisClient ??= createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });

  redisClient.on('error', err => {
    console.error('❌ Redis Client Error:', err.message);
  });

  try {
    await redisClient.connect();
    console.log('🟢 Redis conectado');
  } catch (err) {
    console.warn('⚠️ Redis no disponible (test env or not running)');
  }

  return redisClient;
}

export const getFromCache = async key => {
  if (!USE_REDIS) return null;
  const client = await getRedis();
  if (!client?.isOpen) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    console.error('❌ Error obteniendo cache:', e.message);
    return null;
  }
};

export const setToCache = async (key, value, ttl = 60) => {
  if (!USE_REDIS) return;
  const client = await getRedis();
  if (!client?.isOpen) return;
  client.setEx(key, ttl, JSON.stringify(value))
        .catch(e => console.error('❌ Error guardando cache:', e.message));
};
