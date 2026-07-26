import axios from 'axios';

// Exemplo usando a Evolution API para WhatsApp
export async function sendWhatsAppMessage({ phone, message, instance, apiKey }: any) {
  try {
    const url = `${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`;
    const response = await axios.post(
      url,
      {
        number: phone,
        textMessage: { text: message },
      },
      {
        headers: {
          apikey: apiKey || process.env.EVOLUTION_API_KEY,
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Erro ao enviar WhatsApp para ${phone}:`, error?.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Exemplo usando a Bot API oficial do Telegram
export async function sendTelegramMessage({ chatId, message, botToken }: any) {
  try {
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Erro ao enviar Telegram para ${chatId}:`, error?.response?.data || error.message);
    return { success: false, error: error.message };
  }
}