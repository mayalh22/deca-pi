const express = require('express');
const db = require('../../db/database');
const r = express.Router();

r.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT d.id, d.code, d.description,
      COUNT(DISTINCT o.id) as objective_count,
      COUNT(q.id) as question_count
    FROM domains d
    LEFT JOIN objectives o ON o.domain_id = d.id
    LEFT JOIN questions q ON q.objective_id = o.id
    GROUP BY d.id
    ORDER BY d.code
  `).all();
  res.json(rows);
});

module.exports = r;