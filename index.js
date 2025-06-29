import dotenv from 'dotenv';
import AppointmentScraper from './scraper.js';
import TelegramNotifier from './telegram.js';
import { config } from './config.js';

// Load environment variables
dotenv.config();

class AppointmentMonitor {
  constructor() {
    this.scraper = new AppointmentScraper();
    this.telegram = new TelegramNotifier();
    this.isRunning = false;
    this.lastNotificationTime = null;
    
    // Prevent duplicate notifications within 1 hour
    this.notificationCooldown = 60 * 60 * 1000; // 1 hour in milliseconds
  }

  async initialize() {
    console.log('🎯 Initializing Goethe B2 Appointment Monitor...');
    console.log(`📅 Check interval: ${config.checkIntervalMinutes} minutes`);
    console.log(`🌐 Target URL: ${config.appointmentUrl}`);
    
    // Test Telegram connection
    const telegramConnected = await this.telegram.testConnection();
    if (!telegramConnected) {
      console.log('⚠️  Telegram notifications disabled - check your bot token and chat ID');
    }

    // Initialize scraper
    const scraperInitialized = await this.scraper.initialize();
    if (!scraperInitialized) {
      throw new Error('Failed to initialize web scraper');
    }

    return true;
  }

  async checkOnce() {
    try {
      console.log('\n' + '='.repeat(50));
      console.log(`🕐 Starting appointment check at ${new Date().toLocaleString()}`);
      
      const result = await this.scraper.checkAppointments();
      
      if (result.error) {
        console.log(`❌ Check failed: ${result.error}`);
        return false;
      }

      if (result.hasAvailability && result.appointments.length > 0) {
        console.log('🎉 APPOINTMENTS FOUND!');
        result.appointments.forEach((appointment, index) => {
          console.log(`   ${index + 1}. ${appointment}`);
        });

        // Check if we should send notification (respect cooldown)
        const now = Date.now();
        if (!this.lastNotificationTime || (now - this.lastNotificationTime) > this.notificationCooldown) {
          await this.telegram.sendAppointmentAlert(result.appointments);
          this.lastNotificationTime = now;
          console.log('📱 Telegram notification sent');
        } else {
          const remainingCooldown = Math.ceil((this.notificationCooldown - (now - this.lastNotificationTime)) / (60 * 1000));
          console.log(`⏳ Notification cooldown active (${remainingCooldown} minutes remaining)`);
        }
      } else {
        console.log('😴 No appointments available at this time');
      }

      return true;
    } catch (error) {
      console.error('💥 Unexpected error during check:', error.message);
      return false;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('▶️  Monitor started');

    // Initial check
    await this.checkOnce();

    // Set up periodic checking
    const intervalMs = config.checkIntervalMinutes * 60 * 1000;
    this.interval = setInterval(async () => {
      if (this.isRunning) {
        await this.checkOnce();
      }
    }, intervalMs);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('\n🛑 Stopping monitor...');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
    }

    await this.scraper.close();
    console.log('✅ Monitor stopped gracefully');
    process.exit(0);
  }
}

// Main execution
async function main() {
  try {
    const monitor = new AppointmentMonitor();
    await monitor.initialize();
    await monitor.start();
  } catch (error) {
    console.error('💥 Failed to start monitor:', error.message);
    process.exit(1);
  }
}

// Start the application
main();