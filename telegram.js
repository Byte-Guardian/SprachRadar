import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';

class TelegramNotifier {
  constructor() {
    if (!config.telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required in environment variables');
    }
    
    this.bot = new TelegramBot(config.telegramBotToken, { polling: false });
    this.chatId = config.telegramChatId;
  }

  async sendMessage(message) {
    try {
      if (!this.chatId) {
        console.log('No chat ID provided. Message would be:', message);
        return;
      }

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      
      console.log('✅ Telegram notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error.message);
    }
  }

  async sendAppointmentAlert(appointments) {
    const message = this.formatAppointmentMessage(appointments);
    await this.sendMessage(message);
  }

  formatAppointmentMessage(appointments) {
    let message = '🚨 <b>German B2 Test Appointments Available!</b>\n\n';
    
    if (appointments.length === 0) {
      message += 'No specific appointment details found, but the website indicates availability.\n\n';
    } else {
      message += `Found ${appointments.length} available appointment(s):\n\n`;
      appointments.forEach((appointment, index) => {
        message += `${index + 1}. ${appointment}\n`;
      });
      message += '\n';
    }
    
    message += `🔗 <a href="${config.appointmentUrl}">Book your appointment here</a>\n\n`;
    message += `⏰ Checked at: ${new Date().toLocaleString()}`;
    
    return message;
  }

  async testConnection() {
    try {
      const me = await this.bot.getMe();
      console.log(`✅ Telegram bot connected: ${me.first_name} (@${me.username})`);
      
      if (this.chatId) {
        await this.sendMessage('🤖 Goethe B2 Appointment Checker is now active!');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Telegram bot connection failed:', error.message);
      return false;
    }
  }
}

export default TelegramNotifier;