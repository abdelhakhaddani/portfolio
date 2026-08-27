'use strict';

const fetch  = require('node-fetch');
const logger = require('../utils/logger');

const BASE = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function callTelegram(method, body) {
  const res = await fetch(`${BASE()}/${method}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    logger.warn(`Telegram API error [${method}]`, { description: data.description });
  }
  return data;
}

async function sendMessage(chatId, text, extra = {}) {
  // Telegram max message length is 4096 chars — split if needed
  const MAX = 4000;
  const parts = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= MAX) { parts.push(remaining); break; }
    // Try to cut at a paragraph break
    let cut = remaining.lastIndexOf('\n\n', MAX);
    if (cut < 1000) cut = remaining.lastIndexOf('\n', MAX);
    if (cut < 1000) cut = MAX;
    parts.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  for (const part of parts) {
    await callTelegram('sendMessage', {
      chat_id:    chatId,
      text:       part,
      parse_mode: 'Markdown',
      ...extra,
    });
  }
}

async function sendTyping(chatId) {
  await callTelegram('sendChatAction', { chat_id: chatId, action: 'typing' });
}

async function setWebhook(url, secret) {
  return callTelegram('setWebhook', {
    url,
    secret_token:    secret,
    allowed_updates: ['message'],
  });
}

async function getWebhookInfo() {
  return callTelegram('getWebhookInfo', {});
}

module.exports = { sendMessage, sendTyping, setWebhook, getWebhookInfo };
