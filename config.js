export const config = {
    // Goethe Institute appointment URL
    appointmentUrl: 'https://www.goethe.de/ins/eg/ar/sta/kai/prf/gzb2.cfm',
    
    // Check interval in minutes (default: 30 minutes)
    checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES) || 30,
    
    // Telegram configuration
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    
    // Selectors for appointment elements (may need adjustment based on actual website structure)
    selectors: {
      appointmentTable: 'table',
      appointmentRows: 'tr',
      availableSlots: '.available, .free, [class*="available"], [class*="free"]'
    }
  };