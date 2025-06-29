# SprachRadar
script that checks Goethe B-2 exam every 30 min and if found available appointment it will alert u through telegram.

## Features

- 🔍 Automatically checks for appointment availability
- 📱 Sends instant Telegram notifications
- ⏰ Configurable check intervals
- 🛡️ Built-in cooldown to prevent spam notifications
- 🤖 Headless browser automation with Puppeteer


## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the instructions
3. Save the bot token you receive

### 3. Get Your Chat ID

1. Message your bot on Telegram
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for your chat ID in the response

### 4. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   CHECK_INTERVAL_MINUTES=30
   ```

## Usage

### Run the Monitor

```bash
npm start
```

### Test Run (Single Check)

Modify `index.js` to run a single check by calling `monitor.checkOnce()` instead of `monitor.start()`.

## Configuration

- **CHECK_INTERVAL_MINUTES**: How often to check for appointments (default: 30 minutes)
- **TELEGRAM_BOT_TOKEN**: Your Telegram bot token
- **TELEGRAM_CHAT_ID**: Your Telegram chat ID for notifications

## How It Works

1. **Web Scraping**: Uses Puppeteer to visit the Goethe Institute appointment page
2. **Appointment Detection**: Looks for availability indicators in multiple languages
3. **Smart Notifications**: Sends alerts only when appointments are found, with cooldown protection
4. **Continuous Monitoring**: Runs checks at specified intervals

## Troubleshooting

### No Notifications Received
- Verify your bot token and chat ID are correct
- Make sure you've started a conversation with your bot
- Check the console for error messages

### Scraping Issues
- The website structure may have changed
- Check if the URL is still valid
- Review browser console logs for errors

### Performance Issues
- Adjust the check interval to reduce server load
- Consider running on a VPS for 24/7 monitoring

## Important Notes

- Consider running this on a server for continuous monitoring

