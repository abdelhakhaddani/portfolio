'use strict';

require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const logger        = require('./utils/logger');
const tg            = require('./services/telegram-api');
const telegramRoute = require('./routes/telegram');
const contactRoute  = require('./routes/contact');
const { webhookLimiter } = require('./middleware/rateLimiter');

// ── Validate required env vars ───────────────────────────────
const REQUIRED = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY', 'WEBHOOK_SECRET'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow Telegram servers (no origin) and configured frontend origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST'],
}));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'abdelhak-portfolio-bot', ts: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────
// Telegram webhook — all paths under /api/telegram/
app.use('/api/telegram', webhookLimiter, telegramRoute);

// Contact form
app.use('/api/contact', contactRoute);

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  // Auto-register Telegram webhook on startup
  const backendUrl = process.env.BACKEND_URL;
  const secret     = process.env.WEBHOOK_SECRET;
  if (backendUrl && secret) {
    const webhookUrl = `${backendUrl}/api/telegram/${secret}`;
    try {
      const result = await tg.setWebhook(webhookUrl, secret);
      if (result.ok) {
        logger.info('Telegram webhook registered', { url: webhookUrl });
      } else {
        logger.warn('Telegram webhook registration failed', { result });
      }
    } catch (e) {
      logger.error('Could not register Telegram webhook', e);
    }
  } else {
    logger.warn('BACKEND_URL or WEBHOOK_SECRET not set — webhook not auto-registered.');
  }
});

// ── Graceful shutdown ─────────────────────────────────────────
process.on('SIGTERM', () => { logger.info('SIGTERM received, shutting down'); process.exit(0); });
process.on('SIGINT',  () => { logger.info('SIGINT received, shutting down');  process.exit(0); });
