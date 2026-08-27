'use strict';

const fs   = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '..', 'data', 'knowledge-base.md');

// Load and chunk the knowledge base once at startup
let _chunks = null;

function loadChunks() {
  if (_chunks) return _chunks;
  const raw  = fs.readFileSync(KB_PATH, 'utf8');
  // Split on h2 headers (## SECTION)
  const sections = raw.split(/^##\s+/m).filter(Boolean);
  _chunks = sections.map(s => {
    const lines = s.trim().split('\n');
    const title = lines[0].trim().toUpperCase();
    const body  = lines.slice(1).join('\n').trim();
    return { title, body, full: `## ${s.trim()}` };
  });
  return _chunks;
}

// Simple keyword relevance score
function score(chunk, query) {
  const q    = query.toLowerCase();
  const text = (chunk.title + ' ' + chunk.body).toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  return words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
}

// Topic → section title keywords
const TOPIC_MAP = {
  skills:      ['SKILLS', 'TOOLS'],
  experience:  ['EXPERIENCE'],
  education:   ['EDUCATION', 'CERTIFICATIONS'],
  contact:     ['CONTACT'],
  services:    ['SERVICES'],
  portfolio:   ['PORTFOLIO', 'PROJECTS'],
  about:       ['IDENTITY', 'SUMMARY', 'STATISTICS'],
  availability:['AVAILABILITY', 'HIRING'],
  faq:         ['FAQ'],
};

/**
 * Returns the most relevant sections for the query.
 * Always includes IDENTITY + CONTACT so the AI always knows who Abdelhak is.
 */
function retrieveContext(query, maxChunks = 4) {
  const chunks = loadChunks();

  // Always include identity & contact
  const pinned = chunks.filter(c =>
    c.title.includes('IDENTITY') || c.title.includes('CONTACT')
  );

  // Score remaining chunks
  const rest = chunks
    .filter(c => !c.title.includes('IDENTITY') && !c.title.includes('CONTACT'))
    .map(c => ({ chunk: c, s: score(c, query) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, maxChunks - pinned.length)
    .map(x => x.chunk);

  const selected = [...pinned, ...rest];

  // If nothing scored, add SUMMARY + SERVICES as fallback
  if (rest.length === 0) {
    const fallback = chunks.filter(c =>
      c.title.includes('SUMMARY') || c.title.includes('AVAILABILITY')
    );
    selected.push(...fallback);
  }

  return selected.map(c => c.full).join('\n\n---\n\n');
}

/**
 * Returns the FULL knowledge base (used for system prompt only).
 */
function getFullKnowledge() {
  return fs.readFileSync(KB_PATH, 'utf8');
}

module.exports = { retrieveContext, getFullKnowledge };
