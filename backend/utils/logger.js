'use strict';

// Safe logger — never logs secrets
const REDACTED_KEYS = ['token', 'key', 'secret', 'password', 'credential', 'auth', 'api_key'];

function redact(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_KEYS.some(bad => k.toLowerCase().includes(bad))) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = typeof v === 'object' ? redact(v) : v;
    }
  }
  return out;
}

function ts() {
  return new Date().toISOString();
}

const logger = {
  info:  (msg, data) => console.log (`[${ts()}] INFO  ${msg}`, data ? redact(data) : ''),
  warn:  (msg, data) => console.warn(`[${ts()}] WARN  ${msg}`, data ? redact(data) : ''),
  error: (msg, err)  => console.error(`[${ts()}] ERROR ${msg}`, err?.message || err || ''),
};

module.exports = logger;
