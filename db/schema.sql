CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS objectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER NOT NULL,
  number INTEGER NOT NULL,
  full_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objective_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_choice TEXT NOT NULL,
  explanation TEXT,
  source_reference TEXT,
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);

CREATE INDEX IF NOT EXISTS idx_objectives_full_code ON objectives(full_code);
CREATE INDEX IF NOT EXISTS idx_objectives_domain_id ON objectives(domain_id);
CREATE INDEX IF NOT EXISTS idx_questions_objective_id ON questions(objective_id);