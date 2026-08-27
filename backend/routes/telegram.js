'use strict';

const express = require('express');
const router  = express.Router();
const logger  = require('../utils/logger');
const tg      = require('../services/telegram-api');
const ai      = require('../services/ai');
const db      = require('../db/database');
const { telegramUserRateLimit } = require('../middleware/rateLimiter');

// ── Commands ─────────────────────────────────────────────────
const COMMANDS = {
  '/start': async (chatId, from) => {
    const name = from.first_name || 'there';
    await tg.sendMessage(chatId,
      `👋 Hi ${name}! I'm Abdelhak's AI portfolio assistant.\n\n` +
      `I can tell you about his:\n` +
      `• 🛠 Skills & software\n` +
      `• 💼 Work experience\n` +
      `• 🏗 Projects & portfolio\n` +
      `• 🎓 Education & certifications\n` +
      `• 📞 How to hire or contact him\n\n` +
      `What would you like to know?`
    );
  },
  '/help': async (chatId) => {
    await tg.sendMessage(chatId,
      `*Abdelhak's Portfolio Assistant*\n\n` +
      `You can ask me anything about Abdelhak, for example:\n\n` +
      `• "What skills does Abdelhak have?"\n` +
      `• "Tell me about his projects"\n` +
      `• "What software does he use?"\n` +
      `• "Is he available for freelance?"\n` +
      `• "How can I hire him?"\n\n` +
      `Type /contact to get his direct contact information.`
    );
  },
  '/contact': async (chatId) => {
    await tg.sendMessage(chatId,
      `📞 *Contact Abdelhak Haddani*\n\n` +
      `• *Email:* abdelhak.haddani@gmail.com\n` +
      `• *Phone / WhatsApp:* +1 (332) 260-4690\n` +
      `• *Portfolio:* https://abdelhakhaddani.github.io/portfolio\n` +
      `• *Behance:* https://www.behance.net/abdelhakhaddani\n\n` +
      `He typically responds within 24 hours. 🙌`
    );
  },
  '/clear': async (chatId) => {
    db.clearHistory(chatId);
    await tg.sendMessage(chatId,
      '🗑 Conversation cleared. Let\'s start fresh! What would you like to know about Abdelhak?'
    );
  },
};

// ── Lead detection keywords ───────────────────────────────────
const LEAD_KEYWORDS = [
  /\b(hire|hiring|job offer|job opportunity|recruit|employment|work with|collaborate|collaboration|partnership|freelance|contract|project|budget|timeline)\b/i,
  /\b(interested in|looking for|need a|need someone|want to|would like to)\b/i,
];

function isHighValueLead(text) {
  return LEAD_KEYWORDS.some(p => p.test(text));
}

// ── Admin notification ────────────────────────────────────────
async function notifyAdmin(from, message, type = 'LEAD') {
  const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminId) return;

  const username = from.username ? `@${from.username}` : 'No username';
  const name     = [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Unknown';
  const now      = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const text =
    `🚨 *NEW PORTFOLIO ${type}*\n\n` +
    `*Name:* ${name}\n` +
    `*Telegram:* ${username}\n` +
    `*User ID:* ${from.id}\n` +
    `*Language:* ${from.language_code || '—'}\n\n` +
    `*Message:*\n${message}\n\n` +
    `*Date/Time (NY):* ${now}`;

  try {
    await tg.sendMessage(adminId, text);
  } catch (e) {
    logger.error('Failed to send admin notification', e);
  }
}

// ── Handle incoming Telegram update ──────────────────────────
async function handleUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;  // ignore non-text messages

  const chatId = String(message.chat.id);
  const from   = message.from;
  const text   = message.text.trim();

  // Upsert user record
  db.upsertUser(from);

  // Check rate limit
  if (telegramUserRateLimit(chatId)) {
    await tg.sendMessage(chatId,
      "You're sending messages quite fast! Please wait a moment before continuing. 😊"
    );
    return;
  }

  logger.info(`Telegram message from ${chatId}`, { text: text.slice(0, 60) });

  // Handle commands
  const cmd = text.split(' ')[0].toLowerCase();
  if (COMMANDS[cmd]) {
    await COMMANDS[cmd](chatId, from);
    return;
  }

  // Show typing indicator
  await tg.sendTyping(chatId);

  // Load conversation history (last 20 messages)
  const history = db.getHistory(chatId, 20);

  let reply;
  try {
    reply = await ai.generateReply(text, history);
  } catch (err) {
    logger.error('AI generation failed', err);
    reply =
      "Sorry, I'm having a bit of trouble right now. Please try again in a moment, " +
      "or reach Abdelhak directly at abdelhak.haddani@gmail.com 🙏";
  }

  // Save to conversation history
  db.saveMessage(chatId, 'user',      text);
  db.saveMessage(chatId, 'assistant', reply);

  // Send response
  await tg.sendMessage(chatId, reply);

  // Notify admin if high-value lead
  if (isHighValueLead(text)) {
    await notifyAdmin(from, text, 'LEAD');
  }
}

// ── Webhook endpoint ─────────────────────────────────────────
router.post(`/${process.env.WEBHOOK_SECRET || 'webhook'}`, async (req, res) => {
  // Verify Telegram secret header
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    logger.warn('Webhook: invalid secret token received');
    return res.sendStatus(403);
  }

  // Acknowledge immediately (Telegram expects < 5s response)
  res.sendStatus(200);

  // Process asynchronously so we don't block
  handleUpdate(req.body).catch(err => logger.error('handleUpdate error', err));
});

module.exports = router;
module.exports.notifyAdmin = notifyAdmin;
