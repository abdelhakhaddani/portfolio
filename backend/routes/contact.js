'use strict';

const express = require('express');
const router  = express.Router();
const logger  = require('../utils/logger');
const tg      = require('../services/telegram-api');
const db      = require('../db/database');
const { contactLimiter } = require('../middleware/rateLimiter');

// Simple email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, 2000);
}

// POST /api/contact
router.post('/', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  // Validation
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const sName    = sanitize(name);
  const sEmail   = sanitize(email   || '');
  const sSubject = sanitize(subject || 'Portfolio Inquiry');
  const sMessage = sanitize(message);
  const ip       = req.ip || 'unknown';
  const now      = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  // Save to DB
  try {
    db.saveContactSubmission({ name: sName, email: sEmail, subject: sSubject, message: sMessage, ip });
  } catch (e) {
    logger.error('DB save contact submission failed', e);
  }

  // Notify admin via Telegram
  const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminId) {
    const tgText =
      `📩 *NEW WEBSITE CONTACT*\n\n` +
      `*Name:* ${sName}\n` +
      `*Email:* ${sEmail || '—'}\n` +
      `*Subject:* ${sSubject}\n\n` +
      `*Message:*\n${sMessage}\n\n` +
      `*Submitted:* ${now} (NY)\n` +
      `*Website:* https://abdelhakhaddani.github.io/portfolio`;

    tg.sendMessage(adminId, tgText).catch(e =>
      logger.error('Failed to send contact Telegram notification', e)
    );
  }

  logger.info('Contact form submitted', { name: sName, email: sEmail });
  return res.json({ success: true, message: 'Message received! Abdelhak will get back to you soon.' });
});

module.exports = router;
