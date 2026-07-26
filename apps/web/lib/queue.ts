import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Conexão centralizada com o Redis
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Obrigatório para o BullMQ
});

// Fila de disparos de campanhas
export const campaignQueue = new Queue('campaign-queue', { connection });