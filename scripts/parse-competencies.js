const fs = require('fs');
const path = require('path');
const db = require('../db/database');

const COMP_DIR = path.join(__dirname, '../data/competencies');

const CODE_RE = /\(([A-Z]{2}):(\d{3})\)/;

function parseFile(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const lines = raw.split('\n');
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(CODE_RE);
    if (match) {
      const domainCode = match[1];
      const numStr = match[2];
      const number = parseInt(numStr, 10);
      const fullCode = domainCode + numStr;
      const title = line.replace(CODE_RE, '').replace(/\s+$/, '').trim();
      const descLines = [];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        if (next.match(CODE_RE) || next === '') {
          if (descLines.length > 0) break;
          if (next === '') { i++; continue; }
          break;
        }
        descLines.push(next);
        i++;
      }
      entries.push({ domainCode, number, fullCode, title, description: descLines.join(' ').trim() });
    } else {
      i++;
    }
  }
  return entries;
}

const insertDomain = db.prepare(`INSERT OR IGNORE INTO domains (code) VALUES (?)`);
const getDomain = db.prepare(`SELECT id FROM domains WHERE code = ?`);
const insertObjective = db.prepare(`
  INSERT OR REPLACE INTO objectives (domain_id, number, full_code, title, description)
  VALUES (?, ?, ?, ?, ?)
`);

function seed() {
  if (!fs.existsSync(COMP_DIR)) {
    console.log('No competencies directory found, skipping.');
    return;
  }
  const files = fs.readdirSync(COMP_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
  let total = 0;

  const run = db.transaction(() => {
    for (const file of files) {
      const entries = parseFile(path.join(COMP_DIR, file));
      for (const e of entries) {
        insertDomain.run(e.domainCode);
        const row = getDomain.get(e.domainCode);
        insertObjective.run(row.id, e.number, e.fullCode, e.title, e.description);
        total++;
      }
    }
  });

  run();
  console.log(`Competencies seeded: ${total}`);
}

module.exports = seed;