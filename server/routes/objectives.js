const express = require('express');
const db = require('../../db/database');
const r = express.Router();

r.get('/', (req, res) => {
  const { domain } = req.query;
  let rows;
  if (domain) {
    rows = db.prepare(`
      SELECT o.*, COUNT(q.id) as question_count
      FROM objectives o
      LEFT JOIN questions q ON q.objective_id = o.id
      WHERE o.domain_id = (SELECT id FROM domains WHERE code = ?)
      GROUP BY o.id
      ORDER BY o.number
    `).all(domain.toUpperCase());
  } else {
    rows = db.prepare(`
      SELECT o.*, COUNT(q.id) as question_count
      FROM objectives o
      LEFT JOIN questions q ON q.objective_id = o.id
      GROUP BY o.id
      ORDER BY o.full_code
    `).all();
  }
  res.json(rows);
});

r.get('/:code', (req, res) => {
  const row = db.prepare(`SELECT * FROM objectives WHERE full_code = ?`).get(req.params.code.toUpperCase());
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

module.exports = r;