'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const logger   = require('../utils/logger');

const DB_PATH = path.join(__dirname, '..', 'data', 'portfolio.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    logger.info('SQLite database ready', { path: DB_PATH });
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id     TEXT    NOT NULL,
      role        TEXT    NOT NULL CHECK(role IN ('user','assistant','system')),
      content     TEXT    NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_conv_chat ON conversations(chat_id, created_at);

    CREATE TABLE IF NOT EXISTS users (
      chat_id       TEXT PRIMARY KEY,
      username      TEXT,
      first_name    TEXT,
      last_name     TEXT,
      language_code TEXT,
      first_seen    DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen     DATETIME DEFAULT CURRENT_TIMESTAMP,
      message_count INTEGER  DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leads (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id      TEXT,
      username     TEXT,
      name         TEXT,
      email        TEXT,
      phone        TEXT,
      company      TEXT,
      request_type TEXT,
      notes        TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT,
      email      TEXT,
      subject    TEXT,
      message    TEXT,
      ip         TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key        TEXT PRIMARY KEY,
      count      INTEGER DEFAULT 0,
      window_end DATETIME
    );
  `);
}

// ── Conversations ────────────────────────────────────────────
function getHistory(chatId, limit = 20) {
  const db = getDb();
  return db.prepare(`
    SELECT role, content FROM conversations
    WHERE chat_id = ?
    ORDER BY created_at ASC
    LIMIT ?
  `).all(chatId, limit);
}

function saveMessage(chatId, role, content) {
  const db = getDb();
  db.prepare(`
    INSERT INTO conversations (chat_id, role, content) VALUES (?, ?, ?)
  `).run(chatId, role, content);

  // Keep only the last 40 messages per user to avoid runaway growth
  db.prepare(`
    DELETE FROM conversations
    WHERE chat_id = ? AND id NOT IN (
      SELECT id FROM conversations WHERE chat_id = ? ORDER BY created_at DESC LIMIT 40
    )
  `).run(chatId, chatId);
}

function clearHistory(chatId) {
  getDb().prepare(`DELETE FROM conversations WHERE chat_id = ?`).run(chatId);
}

// ── Users ────────────────────────────────────────────────────
function upsertUser(from) {
  getDb().prepare(`
    INSERT INTO users (chat_id, username, first_name, last_name, language_code, message_count)
    VALUES (@chat_id, @username, @first_name, @last_name, @language_code, 1)
    ON CONFLICT(chat_id) DO UPDATE SET
      username      = excluded.username,
      first_name    = excluded.first_name,
      last_name     = excluded.last_name,
      last_seen     = CURRENT_TIMESTAMP,
      message_count = message_count + 1
  `).run({
    chat_id:       String(from.id),
    username:      from.username      || null,
    first_name:    from.first_name    || null,
    last_name:     from.last_name     || null,
    language_code: from.language_code || null,
  });
}

// ── Leads ────────────────────────────────────────────────────
function saveLead(data) {
  getDb().prepare(`
    INSERT INTO leads (chat_id, username, name, email, phone, company, request_type, notes)
    VALUES (@chat_id, @username, @name, @email, @phone, @company, @request_type, @notes)
  `).run(data);
}

// ── Contact form ─────────────────────────────────────────────
function saveContactSubmission(data) {
  getDb().prepare(`
    INSERT INTO contact_submissions (name, email, subject, message, ip)
    VALUES (@name, @email, @subject, @message, @ip)
  `).run(data);
}

module.exports = {
  getDb,
  getHistory,
  saveMessage,
  clearHistory,
  upsertUser,
  saveLead,
  saveContactSubmission,
};
