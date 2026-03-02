const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/domains', require('./routes/domains'));
app.use('/api/objectives', require('./routes/objectives'));
app.use('/api/questions', require('./routes/questions'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));