const fs = require('fs');
const path = require('path');
const db = require('../db/database');

const Q_DIR = path.join(__dirname, '../data/questions');

const CHOICE_RE = /^([A-D])[.)]\s+(.+)/i;
const ANSWER_RE = /^answer[:\s]+([A-D1-4])/i;
const SOURCE_RE = /SOURCE[:\s]+([A-Z]{2}):(\d{3})/i;
const EXPLANATION_RE = /^explanation[:\s]*(.*)/i;

function numToLetter(n) {
  return ['A','B','C','D'][parseInt(n,10)-1] || n.toUpperCase();
}

function parseFile(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  const flagged = [];

  let i = 0;
  while (i < lines.length) {
    const choices = {};
    let stem = '';
    let correct = '';
    let explanation = '';
    let sourceCode = '';
    let domainCode = '';

    const stemLines = [];
    while (i < lines.length) {
      const l = lines[i];
      if (CHOICE_RE.test(l)) break;
      if (ANSWER_RE.test(l)) break;
      stemLines.push(l);
      i++;
    }
    stem = stemLines.join(' ').trim();
    if (!stem) { i++; continue; }

    while (i < lines.length) {
      const l = lines[i];
      const cm = l.match(CHOICE_RE);
      if (cm) {
        choices[cm[1].toUpperCase()] = cm[2].trim();
        i++;
        continue;
      }
      const am = l.match(ANSWER_RE);
      if (am) {
        const raw = am[1];
        correct = raw.match(/[1-4]/) ? numToLetter(raw) : raw.toUpperCase();
        i++;
        continue;
      }
      const em = l.match(EXPLANATION_RE);
      if (em) {
        const expLines = [em[1]];
        i++;
        while (i < lines.length && !SOURCE_RE.test(lines[i]) && !ANSWER_RE.test(lines[i]) && !CHOICE_RE.test(lines[i])) {
          if (/^[A-D][.)]\s/.test(lines[i])) break;
          if (/^SOURCE/i.test(lines[i])) break;
          expLines.push(lines[i]);
          i++;
        }
        explanation = expLines.join(' ').trim();
        continue;
      }
      const sm = l.match(SOURCE_RE);
      if (sm) {
        domainCode = sm[1];
        const numStr = sm[2];
        sourceCode = domainCode + numStr;
        i++;
        continue;
      }
      break;
    }

    if (!choices.A || !choices.B || !choices.C || !choices.D || !correct) continue;

    if (!sourceCode) {
      flagged.push({ stem, reason: 'missing SOURCE' });
      continue;
    }

    questions.push({ stem, choices, correct, explanation, sourceCode, domainCode });
  }

  return { questions, flagged };
}

const getObjective = db.prepare(`SELECT id FROM objectives WHERE full_code = ?`);
const insertDomain = db.prepare(`INSERT OR IGNORE INTO domains (code) VALUES (?)`);
const insertObjectivePlaceholder = db.prepare(`
  INSERT OR IGNORE INTO objectives (domain_id, number, full_code, title, description)
  VALUES ((SELECT id FROM domains WHERE code = ?), ?, ?, ?, '')
`);
const insertQuestion = db.prepare(`
  INSERT INTO questions (objective_id, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation, source_reference)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function seed() {
  if (!fs.existsSync(Q_DIR)) {
    console.log('No questions directory found, skipping.');
    return;
  }
  const files = fs.readdirSync(Q_DIR).filter(f => f.endsWith('.txt'));
  let total = 0;
  let skipped = 0;
  const allFlagged = [];

  const run = db.transaction(() => {
    for (const file of files) {
      const { questions, flagged } = parseFile(path.join(Q_DIR, file));
      allFlagged.push(...flagged.map(f => ({ file, ...f })));

      for (const q of questions) {
        let obj = getObjective.get(q.sourceCode);
        if (!obj) {
          insertDomain.run(q.domainCode);
          const num = parseInt(q.sourceCode.slice(2), 10);
          insertObjectivePlaceholder.run(q.domainCode, num, q.sourceCode, q.sourceCode + ' (auto)');
          obj = getObjective.get(q.sourceCode);
        }
        if (!obj) { skipped++; continue; }
        insertQuestion.run(obj.id, q.stem, q.choices.A, q.choices.B, q.choices.C, q.choices.D, q.correct, q.explanation, q.sourceCode);
        total++;
      }
    }
  });

  run();
  console.log(`Questions seeded: ${total} | Skipped: ${skipped} | Flagged: ${allFlagged.length}`);
  if (allFlagged.length) {
    console.log('Flagged items:');
    allFlagged.forEach(f => console.log(`  [${f.file}] ${f.reason}: ${f.stem?.slice(0,60)}...`));
  }
}

module.exports = seed;