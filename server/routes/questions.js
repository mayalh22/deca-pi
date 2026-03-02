const express = require('express');
const db = require('../../db/database');
const r = express.Router();

r.get('/', (req, res) => {
  const { domain, code, limit = 100 } = req.query;
  let rows;

  if (code) {
    rows = db.prepare(`
      SELECT q.* FROM questions q
      JOIN objectives o ON o.id = q.objective_id
      WHERE o.full_code = ?
      ORDER BY RANDOM()
    `).all(code.toUpperCase());
  } else if (domain) {
    rows = db.prepare(`
      SELECT q.* FROM questions q
      JOIN objectives o ON o.id = q.objective_id
      JOIN domains d ON d.id = o.domain_id
      WHERE d.code = ?
      ORDER BY RANDOM()
      LIMIT ?
    `).all(domain.toUpperCase(), parseInt(limit, 10));
  } else {
    rows = db.prepare(`SELECT * FROM questions ORDER BY RANDOM() LIMIT ?`).all(parseInt(limit, 10));
  }

  res.json(rows);
});

module.exports = r;