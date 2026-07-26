import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

console.log('[Worker] Iniciando o processador de campanhas...');

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

// Inicialização correta para o Prisma 7 com driver adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

// Configuração da conexão com o Redis
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

// Funções de envio integradas
async function sendWhatsAppMessage({ phone, message }: any) {
  try {
    const url = `${process.env.EVOLUTION_API_URL || 'http://localhost:8080'}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME || 'default'}`;
    const response = await axios.post(
      url,
      {
        number: phone,
        textMessage: { text: message },
      },
      {
        headers: {
          apikey: process.env.EVOLUTION_API_KEY || '',
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Erro ao enviar WhatsApp para ${phone}:`, error?.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// 🚀 NOVA FUNÇÃO: Envio Real para o Telegram
async function sendTelegramMessage({ chatId, message }: any) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error('[Telegram] TELEGRAM_BOT_TOKEN não configurado no .env!');
      return { success: false, error: 'Token não configurado' };
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });

    console.log(`[Telegram] Mensagem enviada com sucesso para ${chatId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`[Telegram] Erro ao enviar para ${chatId}:`, error?.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Criando o Worker que escuta a fila 'campaign-queue'
export const campaignWorker = new Worker(
  'campaign-queue',
  async (job) => {
    const { campaignId, selectedProduct, caption, selectedGroups, channel } = job.data;
    
    console.log(`[Worker] Processando campanha ID: ${campaignId}`);

    try {
      for (const group of selectedGroups) {
        const messageText = `🔥 <b>${selectedProduct?.name || 'Campanha'}</b>\n\n${caption || ''}`;
        const targetContact = group.phone || group.chatId || group.id || group;

        console.log(`[Worker] Destino do disparo: ${targetContact} | Canal: ${channel || 'Não especificado'}`);

        // Verificação de Canal (Telegram ou WhatsApp)
        if (channel === 'telegram' || (typeof targetContact === 'string' && targetContact.startsWith('-100'))) {
          // Se o ID começar com -100 ou for selecionado telegram, envia via Telegram
          await sendTelegramMessage({
            chatId: targetContact,
            message: messageText,
          });
        } else if (process.env.EVOLUTION_API_URL) {
          // Envia via WhatsApp (Evolution API)
          await sendWhatsAppMessage({
            phone: targetContact,
            message: messageText,
          });
        } else {
          console.log(`[Simulação] Mensagem não enviada (sem URL de API): ${messageText}`);
        }

        // Delay de segurança entre os disparos para evitar bloqueio
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Atualiza o status da campanha no banco de dados para COMPLETED
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED' },
      });

      console.log(`[Worker] Campanha ${campaignId} concluída com sucesso!`);
    } catch (error) {
      console.error(`[Worker] Erro ao processar campanha ${campaignId}:`, error);
      
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED' },
      });
      
      throw error;
    }
  },
  { connection: redisConnection }
);

campaignWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} finalizado.`);
});

campaignWorker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job?.id} falhou com o erro: ${err.message}`);
});