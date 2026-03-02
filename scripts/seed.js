const seedCompetencies = require('./parse-competencies');
const seedQuestions = require('./parse-questions');

console.log('Seeding competencies...');
seedCompetencies();

console.log('Seeding questions...');
seedQuestions();

console.log('Done.');