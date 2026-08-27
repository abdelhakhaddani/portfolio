'use strict';

const rateLimit = require('express-rate-limit');

// Per-IP rate limit for the contact form endpoint
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:       5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    error: 'Too many requests. Please wait a few minutes before trying again.'
  },
});

// Per-IP rate limit for the Telegram webhook (Telegram servers have fixed IPs, but still)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max:      120,          // 2 messages/sec average — generous for real usage
  standardHeaders: true,
  legacyHeaders:   false,
});

// In-memory per-Telegram-user message rate limit (prevents bot spam)
const userWindows = new Map();

function telegramUserRateLimit(chatId) {
  const now     = Date.now();
  const WINDOW  = 60_000;   // 1 minute
  const MAX_MSG = 20;        // max 20 messages per minute per user

  const entry = userWindows.get(chatId) || { count: 0, start: now };
  if (now - entry.start > WINDOW) { entry.count = 0; entry.start = now; }
  entry.count++;
  userWindows.set(chatId, entry);

  return entry.count > MAX_MSG;   // true = rate limited
}

module.exports = { contactLimiter, webhookLimiter, telegramUserRateLimit };
