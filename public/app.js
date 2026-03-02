const $ = id => document.getElementById(id);
const show = id => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); $(id).classList.add('active'); };

let session = { questions: [], idx: 0, correct: 0, filter: '', filterType: '' };

async function api(path) {
  const r = await fetch(path);
  return r.json();
}

async function loadHome() {
  const domains = await api('/api/domains');
  const list = $('domain-list');
  list.innerHTML = '';
  domains.forEach(d => {
    const el = document.createElement('div');
    el.className = 'domain-card';
    el.innerHTML = `<span class="code">${d.code}</span><span class="meta">${d.question_count} questions · ${d.objective_count} objectives</span>`;
    el.addEventListener('click', () => loadObjectives(d.code));
    list.appendChild(el);
  });
  show('screen-home');
}

async function loadObjectives(domainCode) {
  const objs = await api(`/api/objectives?domain=${domainCode}`);
  $('obj-domain-title').textContent = `Domain: ${domainCode}`;
  $('btn-practice-domain').onclick = () => startSession('domain', domainCode);
  const list = $('objective-list');
  list.innerHTML = '';
  objs.forEach(o => {
    const el = document.createElement('div');
    el.className = 'obj-row';
    el.innerHTML = `<span class="obj-code">${o.full_code}</span><span class="obj-title">${o.title}</span><span class="obj-count">${o.question_count}q</span>`;
    el.addEventListener('click', () => startSession('code', o.full_code));
    list.appendChild(el);
  });
  show('screen-objectives');
}

async function startSession(type, value) {
  let url = type === 'domain' ? `/api/questions?domain=${value}&limit=200` : `/api/questions?code=${value}`;
  const questions = await api(url);
  if (!questions.length) { alert('No questions found.'); return; }
  session = { questions, idx: 0, correct: 0, filter: value, filterType: type };
  showQuestion();
  show('screen-quiz');
}

function showQuestion() {
  const q = session.questions[session.idx];
  $('quiz-filter-label').textContent = `Practicing ${session.filter}`;
  $('quiz-progress').textContent = `${session.idx + 1} of ${session.questions.length}`;
  $('quiz-question').textContent = q.question_text;

  const choicesEl = $('quiz-choices');
  choicesEl.innerHTML = '';
  ['A','B','C','D'].forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = `${l}.  ${q['choice_' + l.toLowerCase()]}`;
    btn.dataset.letter = l;
    btn.addEventListener('click', () => handleAnswer(l, q));
    choicesEl.appendChild(btn);
  });

  $('quiz-feedback').classList.add('hidden');
}

function handleAnswer(chosen, q) {
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  const correct = q.correct_choice.toUpperCase();
  const isCorrect = chosen === correct;
  if (isCorrect) session.correct++;

  document.querySelectorAll('.choice-btn').forEach(b => {
    if (b.dataset.letter === correct) b.classList.add('correct');
    else if (b.dataset.letter === chosen && !isCorrect) b.classList.add('wrong');
  });

  const res = $('feedback-result');
  res.textContent = isCorrect ? 'Correct' : 'Incorrect';
  res.className = isCorrect ? 'correct' : 'wrong';
  $('feedback-correct').textContent = isCorrect ? '' : `Correct answer: ${correct}`;
  $('feedback-explanation').textContent = q.explanation || '';
  $('feedback-source').textContent = q.source_reference ? `Source: ${q.source_reference}` : '';
  $('quiz-feedback').classList.remove('hidden');
}

$('btn-next').addEventListener('click', () => {
  session.idx++;
  if (session.idx >= session.questions.length) {
    $('done-score').textContent = `${session.correct} / ${session.questions.length} correct (${Math.round(session.correct/session.questions.length*100)}%)`;
    show('screen-done');
  } else {
    showQuestion();
  }
});

$('back-home').addEventListener('click', loadHome);
$('btn-home').addEventListener('click', loadHome);
$('btn-restart').addEventListener('click', () => {
  session.questions = session.questions.sort(() => Math.random() - .5);
  session.idx = 0;
  session.correct = 0;
  showQuestion();
  show('screen-quiz');
});

loadHome();