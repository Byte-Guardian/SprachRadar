import puppeteer from 'puppeteer';
import { config } from './config.js';

class AppointmentScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    try {
      console.log('🚀 Launching browser...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set user agent to avoid bot detection
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error.message);
      return false;
    }
  }

  async checkAppointments() {
    try {
      console.log(`🔍 Checking appointments on ${config.appointmentUrl}`);
      
      await this.page.goto(config.appointmentUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for page to load completely
      await this.page.waitForTimeout(3000);

      // Take a screenshot for debugging (optional)
      // await this.page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

      // Look for appointment availability indicators
      const appointments = await this.page.evaluate((selectors) => {
        const availableAppointments = [];
        
        // Check for common appointment availability indicators
        const availabilityKeywords = [
          'verfügbar', 'available', 'frei', 'free', 'buchbar', 'bookable',
          'anmelden', 'register', 'buchen', 'book'
        ];

        // Look for tables or appointment containers
        const tables = document.querySelectorAll('table, .appointment-table, .booking-table');
        
        tables.forEach(table => {
          const rows = table.querySelectorAll('tr, .appointment-row');
          
          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const hasAvailability = availabilityKeywords.some(keyword => 
              text.includes(keyword.toLowerCase())
            );
            
            if (hasAvailability) {
              // Extract date/time information if available
              const dateRegex = /\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{2,4}/g;
              const timeRegex = /\d{1,2}:\d{2}/g;
              
              const dates = row.textContent.match(dateRegex) || [];
              const times = row.textContent.match(timeRegex) || [];
              
              let appointmentInfo = row.textContent.trim().replace(/\s+/g, ' ');
              if (appointmentInfo.length > 100) {
                appointmentInfo = appointmentInfo.substring(0, 100) + '...';
              }
              
              availableAppointments.push(appointmentInfo);
            }
          });
        });

        // Alternative approach: look for specific elements that might indicate availability
        const availableSlots = document.querySelectorAll(selectors.availableSlots);
        availableSlots.forEach(slot => {
          if (slot.textContent.trim()) {
            availableAppointments.push(slot.textContent.trim());
          }
        });

        // Check page content for general availability indicators
        const pageText = document.body.textContent.toLowerCase();
        const hasGeneralAvailability = availabilityKeywords.some(keyword => 
          pageText.includes(keyword.toLowerCase())
        );

        return {
          appointments: [...new Set(availableAppointments)], // Remove duplicates
          hasAvailability: availableAppointments.length > 0 || hasGeneralAvailability,
          pageTitle: document.title,
          lastChecked: new Date().toISOString()
        };
      }, config.selectors);

      console.log(`📊 Scan complete. Found ${appointments.appointments.length} potential appointments`);
      console.log(`📋 Page title: ${appointments.pageTitle}`);

      return appointments;
    } catch (error) {
      console.error('❌ Error checking appointments:', error.message);
      return {
        appointments: [],
        hasAvailability: false,
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

export default AppointmentScraper;