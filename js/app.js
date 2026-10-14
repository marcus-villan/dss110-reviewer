/* DSS110 Reviewer: home, quiz, flashcards, leaderboard. Plain JS, no build step. */
(function () {
  'use strict';

  const { esc, rich, shuffle, fmtTime } = RV;
  const app = document.getElementById('app');

  const TOPICS = [
    { id: 'co1', n: '01', short: 'CO1 · SA1', title: 'Lifecycle, collection & preprocessing', desc: 'Lifecycle phases, primary data, scalers, encoders, imputation and plots.' },
    { id: 'co2', n: '02', short: 'CO2 · SA2', title: 'EDA & feature selection', desc: 'pandas EDA methods, outliers, correlation, SelectKBest, chi2, f_regression.' },
    { id: 'co3-sup', n: '03', short: 'CO3 · Sup & Unsup', title: 'Supervised vs unsupervised', desc: 'Labels, classification, regression, features and metrics.' },
    { id: 'co3-app', n: '04', short: 'CO3 · Application', title: 'Worked applications', desc: 'Euclidean distance, tree rules, regression, logistic threshold, elbow.' },
    { id: 'co3-tree', n: '05', short: 'CO3 · Decision Trees', title: 'Decision tree analysis', desc: 'Root, leaves, Gini, pruning and advantages.' },
    { id: 'co3-kmeans', n: '06', short: 'CO3 · K-Means', title: 'K-Means clustering', desc: 'K, centroids, objective, distance and the elbow method.' },
    { id: 'case', n: '07', short: 'Case study', title: 'ML credit scoring', desc: 'Group 9 deck on Ayari, Guetari & Kraïem (2026).' },
  ];
  const topicById = (id) => TOPICS.find((t) => t.id === id);
  const topicLabel = (id) => (id === 'mixed' ? 'Mixed topics' : topicById(id) ? topicById(id).short : id);
  const ALL_IDS = TOPICS.map((t) => t.id);

  /* ---------- state ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  const clean = (arr) => (Array.isArray(arr) ? arr.filter((t) => ALL_IDS.includes(t)) : ALL_IDS.slice());

  const S = {
    all: [],
    source: '',
    mode: '',
    quiz: null,
    deck: null,
    timer: null,
    cfg: Object.assign({ topics: ALL_IDS.slice(), count: '20', shuffleQ: true, shuffleO: true, code: false }, store.get('rv.quizcfg', {})),
    dcfg: Object.assign({ topics: ALL_IDS.slice(), shuffle: true, code: false }, store.get('rv.deckcfg', {})),
    name: store.get('rv.name', ''),
  };
  S.cfg.topics = clean(S.cfg.topics);
  S.dcfg.topics = clean(S.dcfg.topics);

  const quizPool = (cfg) => S.all.filter((q) => q.kind !== 'card' && cfg.topics.includes(q.topic) && (cfg.code || !q.is_code));
  const deckPool = (cfg) => S.all.filter((q) => cfg.topics.includes(q.topic) && (cfg.code || !q.is_code));
  const countBy = (fn, id) => S.all.filter((q) => q.topic === id && fn(q)).length;

  function toast(msg, isErr) {
    const el = document.createElement('div');
    el.className = 'toast' + (isErr ? ' err' : '');
    el.setAttribute('role', 'status');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function stopTimer() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }
  function setView(html) { app.innerHTML = html; window.scrollTo({ top: 0 }); }

  /* ---------- home ---------- */
  function viewHome() {
    const nq = S.all.filter((q) => q.kind !== 'card' && !q.is_code).length;
    const nc = S.all.filter((q) => !q.is_code).length;
    setView(`
      <section class="dark hero">
        <div class="wrap">
          <span class="rule"></span>
          <div class="eyebrow" style="margin-bottom:18px">DSS110 · CO1 to CO3 · Reviewer</div>
          <h1>Practice until the answers feel obvious.</h1>
          <p class="sub">Questions and flashcards taken from the SA1, SA2 and CO3 reviewers, plus the credit scoring case study.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/quiz">Start a quiz</a>
            <a class="btn btn-ghost" href="#/cards">Flashcards</a>
            <a class="btn btn-ghost" href="#/board">Leaderboard</a>
          </div>
          <div class="hero-meta">
            <div class="stat"><div class="num">${nq}</div><div class="lbl">quiz questions</div></div>
            <div class="stat"><div class="num">${nc}</div><div class="lbl">flashcards</div></div>
            <div class="stat"><div class="num">${TOPICS.length}</div><div class="lbl">units</div></div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <span class="eyebrow">Roadmap</span>
            <h2>Seven units to cover</h2>
            <p>Pick a unit to drill it on its own, or mix them all in the quiz.</p>
          </div>
          <div class="units">
            ${TOPICS.map((t) => `
              <button class="unit" data-topic="${t.id}">
                <span class="n">${t.n}</span>
                <span class="t">${esc(t.title)}</span>
                <span class="d">${esc(t.desc)}</span>
                <span class="c">${esc(t.short)} · ${countBy((q) => q.kind !== 'card' && !q.is_code, t.id)} questions</span>
              </button>`).join('')}
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap cards-3">
          <div class="panel"><span class="eyebrow">Quiz</span><h3>Test yourself</h3><p class="muted" style="margin-bottom:18px">Choose topics, length and shuffling. Instant feedback with the reason behind each answer.</p><a class="btn btn-primary" href="#/quiz">Build a quiz</a></div>
          <div class="panel"><span class="eyebrow">Flashcards</span><h3>Flip and recall</h3><p class="muted" style="margin-bottom:18px">Flip through every question and the case study cards. Cards you miss come back.</p><a class="btn btn-ghost" href="#/cards">Open the deck</a></div>
          <div class="panel"><span class="eyebrow">Leaderboard</span><h3>Post your score</h3><p class="muted" style="margin-bottom:18px">Finish a quiz of 10 or more questions and add your name to the board.</p><a class="btn btn-ghost" href="#/board">See the board</a></div>
        </div>
      </section>
    `);
    app.querySelectorAll('.unit').forEach((b) =>
      b.addEventListener('click', () => {
        S.cfg.topics = [b.dataset.topic];
        store.set('rv.quizcfg', S.cfg);
        location.hash = '#/quiz';
      }));
  }

  /* ---------- quiz: setup ---------- */
  const chip = (name, value, label, count, checked) =>
    `<label class="chip"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''}> ${esc(label)} <small>${count}</small></label>`;

  function viewQuizSetup() {
    S.mode = 'setup';
    const c = S.cfg;
    setView(`
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <span class="eyebrow">Quiz</span>
            <h2>Build a practice quiz</h2>
            <p>Questions follow the wording of the reviewers. Quizzes of 10 or more questions can be posted to the leaderboard.</p>
          </div>
          <form class="panel setup" id="setup" autocomplete="off">
            <div class="field">
              <span class="label">Topics</span>
              <div class="chips" id="topic-chips"></div>
              <div style="display:flex;gap:8px;margin-top:4px">
                <button type="button" class="btn btn-ghost btn-sm" data-act="all">Select all</button>
                <button type="button" class="btn btn-ghost btn-sm" data-act="none">Clear</button>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="cnt">Number of questions</label>
                <select id="cnt">
                  ${['10', '20', '30', '50', 'all'].map((v) => `<option value="${v}" ${c.count === v ? 'selected' : ''}>${v === 'all' ? 'All available' : v}</option>`).join('')}
                </select>
              </div>
              <div class="toggles">
                <label class="toggle"><input type="checkbox" id="shq" ${c.shuffleQ ? 'checked' : ''}> Shuffle question order</label>
                <label class="toggle"><input type="checkbox" id="sho" ${c.shuffleO ? 'checked' : ''}> Shuffle answer choices</label>
                <label class="toggle"><input type="checkbox" id="code" ${c.code ? 'checked' : ''}> Include coding / syntax items</label>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <button class="btn btn-primary" type="submit" id="start">Start quiz</button>
              <span class="hint" id="avail"></span>
            </div>
          </form>
        </div>
      </section>
    `);
    const form = document.getElementById('setup');
    const chips = document.getElementById('topic-chips');
    const draw = () => {
      chips.innerHTML = TOPICS.map((t) => {
        const n = S.all.filter((q) => q.topic === t.id && q.kind !== 'card' && (S.cfg.code || !q.is_code)).length;
        return chip('topic', t.id, t.short, n, S.cfg.topics.includes(t.id));
      }).join('');
    };
    const sync = () => {
      S.cfg.topics = [...form.querySelectorAll('input[name=topic]:checked')].map((i) => i.value);
      S.cfg.count = document.getElementById('cnt').value;
      S.cfg.shuffleQ = document.getElementById('shq').checked;
      S.cfg.shuffleO = document.getElementById('sho').checked;
      S.cfg.code = document.getElementById('code').checked;
      store.set('rv.quizcfg', S.cfg);
      const n = quizPool(S.cfg).length;
      const take = S.cfg.count === 'all' ? n : Math.min(n, +S.cfg.count);
      document.getElementById('avail').textContent = n ? `${n} questions available, ${take} in this quiz.` : 'No questions match these settings.';
      document.getElementById('start').disabled = !n;
    };
    draw();
    sync();
    form.addEventListener('change', (e) => {
      if (e.target.id === 'code') { S.cfg.code = e.target.checked; const keep = [...form.querySelectorAll('input[name=topic]:checked')].map((i) => i.value); S.cfg.topics = keep; draw(); }
      sync();
    });
    form.addEventListener('click', (e) => {
      const a = e.target.dataset && e.target.dataset.act;
      if (!a) return;
      S.cfg.topics = a === 'all' ? ALL_IDS.slice() : [];
      draw();
      sync();
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); startQuiz(); });
  }

  /* ---------- quiz: run ---------- */
  function startQuiz() {
    let pool = quizPool(S.cfg);
    if (!pool.length) return toast('No questions match those settings.', true);
    if (S.cfg.shuffleQ) pool = shuffle(pool);
    if (S.cfg.count !== 'all') pool = pool.slice(0, +S.cfg.count);
    runQuiz(pool);
  }

  function runQuiz(pool) {
    const items = pool.map((q) => {
      const idx = q.options.map((_, i) => i);
      const order = S.cfg.shuffleO && q.kind === 'mc' ? shuffle(idx) : idx;
      return { q, order, correct: order.indexOf(q.answer) };
    });
    S.quiz = { items, i: 0, score: 0, log: [], t0: Date.now(), answered: false, posted: false, topics: [...new Set(pool.map((q) => q.topic))] };
    S.mode = 'quiz';
    stopTimer();
    showQuestion();
    S.timer = setInterval(() => {
      const el = document.getElementById('timer');
      if (el && S.quiz) el.textContent = fmtTime((Date.now() - S.quiz.t0) / 1000);
    }, 1000);
  }

  function showQuestion() {
    const Z = S.quiz;
    const it = Z.items[Z.i];
    const q = it.q;
    Z.answered = false;
    const pct = (Z.i / Z.items.length) * 100;
    setView(`
      <section class="quiz-shell">
        <div class="wrap" style="max-width:820px">
          <div class="q-meta">
            <span class="eyebrow">Question ${Z.i + 1} of ${Z.items.length} · ${esc(topicLabel(q.topic))}</span>
            <span class="timer" id="timer">${fmtTime((Date.now() - Z.t0) / 1000)}</span>
          </div>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${Z.items.length}" aria-valuenow="${Z.i}"><i style="width:${pct}%"></i></div>
          <div class="q-prompt">${rich(q.prompt)}</div>
          <div class="options" id="options">
            ${it.order.map((oi, k) => `
              <button class="opt" data-k="${k}">
                <span class="k">${q.kind === 'tf' ? (k === 0 ? 'T' : 'F') : 'ABCDEFGH'[k]}</span>
                <span class="v">${esc(q.options[oi])}</span>
              </button>`).join('')}
          </div>
          <div id="feedback"></div>
          <div class="q-actions">
            <span class="kbd">Keys: <kbd>${q.kind === 'tf' ? 'T' : 'A'}</kbd> <kbd>${q.kind === 'tf' ? 'F' : 'B'}</kbd>${q.kind === 'tf' ? '' : ' <kbd>C</kbd> <kbd>D</kbd>'} to answer, <kbd>Enter</kbd> for next</span>
            ${q.verify ? '<span class="tag warn" title="Reconstructed from the PDF; wording or answer may differ slightly">Reconstructed</span>' : ''}
            ${q.is_code ? '<span class="tag">Coding item</span>' : ''}
          </div>
        </div>
      </section>
    `);
    document.getElementById('options').addEventListener('click', (e) => {
      const b = e.target.closest('.opt');
      if (b) choose(+b.dataset.k);
    });
  }

  function choose(k) {
    const Z = S.quiz;
    if (!Z || Z.answered) return;
    const it = Z.items[Z.i];
    if (k < 0 || k >= it.order.length) return;
    Z.answered = true;
    const ok = k === it.correct;
    if (ok) Z.score++;
    Z.log.push({ q: it.q, picked: it.order[k], ok });
    document.querySelectorAll('#options .opt').forEach((b, bi) => {
      b.disabled = true;
      if (bi === it.correct) b.classList.add('correct');
      else if (bi === k) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    const last = Z.i === Z.items.length - 1;
    document.getElementById('feedback').innerHTML = `
      <div class="explain ${ok ? 'ok' : 'no'}" role="status">
        <strong>${ok ? 'Correct.' : 'Not quite.'}</strong>
        ${ok ? '' : `<div>Answer: <b>${esc(it.q.options[it.q.answer])}</b></div>`}
        ${it.q.explanation ? `<div class="muted" style="margin-top:6px">${rich(it.q.explanation)}</div>` : ''}
      </div>
      <div class="q-actions"><button class="btn btn-primary" id="next">${last ? 'See results' : 'Next question'}</button></div>`;
    document.getElementById('next').addEventListener('click', nextQuestion);
    document.getElementById('next').focus({ preventScroll: true });
  }

  function nextQuestion() {
    const Z = S.quiz;
    if (!Z || !Z.answered) return;
    if (Z.i < Z.items.length - 1) { Z.i++; showQuestion(); } else finishQuiz();
  }

  function finishQuiz() {
    const Z = S.quiz;
    stopTimer();
    S.mode = 'result';
    Z.seconds = Math.round((Date.now() - Z.t0) / 1000);
    const total = Z.items.length;
    const pct = Math.round((1000 * Z.score) / total) / 10;
    const missed = Z.log.filter((l) => !l.ok);
    const canPost = total >= 10;
    const topic = Z.topics.length === 1 ? Z.topics[0] : 'mixed';
    const verdict = pct >= 90 ? 'Excellent.' : pct >= 75 ? 'Solid. A few to tighten.' : pct >= 50 ? 'Getting there. Review the misses below.' : 'Keep going. The explanations below will help.';
    setView(`
      <section class="dark result">
        <div class="wrap">
          <div class="eyebrow" style="margin-bottom:12px">Results · ${esc(topicLabel(topic))}</div>
          <div class="big">${Z.score}<small> / ${total}</small></div>
          <div class="pct">${pct}% · ${verdict}</div>
          <div class="hero-actions">
            ${missed.length ? '<button class="btn btn-primary" id="retry">Retry the ' + missed.length + ' missed</button>' : ''}
            <button class="btn ${missed.length ? 'btn-ghost' : 'btn-primary'}" id="again">New quiz</button>
            <a class="btn btn-ghost" href="#/board">Leaderboard</a>
          </div>
          <div class="facts">
            <div class="stat"><div class="num">${fmtTime(Z.seconds)}</div><div class="lbl">time taken</div></div>
            <div class="stat"><div class="num">${Z.score}</div><div class="lbl">correct</div></div>
            <div class="stat"><div class="num">${missed.length}</div><div class="lbl">missed</div></div>
          </div>
          <div class="submit-box">
            <h3>Post to the leaderboard</h3>
            ${canPost
              ? `<p class="muted" style="font-size:14px">Add your name to share this score.${RV.live ? '' : ' (Offline mode: stored only in this browser.)'}</p>
                 <form class="inline" id="post" autocomplete="off">
                   <label class="sr-only" for="pname">Your name</label>
                   <input type="text" id="pname" maxlength="24" placeholder="Your name or nickname" value="${esc(S.name)}" required>
                   <button class="btn btn-primary" type="submit" id="postbtn">Post score</button>
                 </form>`
              : '<p class="muted" style="font-size:14px">Scores are posted for quizzes of 10 or more questions.</p>'}
          </div>
        </div>
      </section>
      ${missed.length ? `
      <section class="review">
        <div class="wrap" style="max-width:820px">
          <span class="eyebrow">Review</span>
          <h2>What you missed</h2>
          ${missed.map((l) => `
            <div class="miss">
              <div class="p">${rich(l.q.prompt)}</div>
              <div class="you">Your answer: ${esc(l.q.options[l.picked])}</div>
              <div class="right">Correct: ${esc(l.q.options[l.q.answer])}</div>
              ${l.q.explanation ? `<div class="why">${rich(l.q.explanation)}</div>` : ''}
            </div>`).join('')}
        </div>
      </section>` : ''}
    `);
    document.getElementById('again').addEventListener('click', () => { location.hash = '#/quiz'; viewQuizSetup(); });
    const retry = document.getElementById('retry');
    if (retry) retry.addEventListener('click', () => runQuiz(shuffle(missed.map((l) => l.q))));
    const post = document.getElementById('post');
    if (post) {
      post.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (Z.posted) return;
        const name = document.getElementById('pname').value.trim();
        if (!name) return;
        const btn = document.getElementById('postbtn');
        btn.disabled = true;
        btn.textContent = 'Posting...';
        try {
          await RV.submitScore({ name, topic, score: Z.score, total, seconds: Z.seconds });
          Z.posted = true;
          S.name = name;
          store.set('rv.name', name);
          post.innerHTML = '<p>Posted. <a href="#/board" style="color:#fff">View the leaderboard</a></p>';
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Post score';
          toast(String(err.message || err), true);
        }
      });
    }
  }

  /* ---------- flashcards ---------- */
  function viewDeckSetup() {
    S.mode = 'decksetup';
    const c = S.dcfg;
    setView(`
      <section class="section">
        <div class="wrap">
          <div class="section-head">
            <span class="eyebrow">Flashcards</span>
            <h2>Flip through the deck</h2>
            <p>Every reviewer question becomes a card, along with the written-answer items and the case study cards. Cards you mark "still learning" come back.</p>
          </div>
          <form class="panel setup" id="dsetup" autocomplete="off">
            <div class="field">
              <span class="label">Topics</span>
              <div class="chips" id="dchips"></div>
              <div style="display:flex;gap:8px;margin-top:4px">
                <button type="button" class="btn btn-ghost btn-sm" data-act="all">Select all</button>
                <button type="button" class="btn btn-ghost btn-sm" data-act="none">Clear</button>
              </div>
            </div>
            <div class="toggles">
              <label class="toggle"><input type="checkbox" id="dsh" ${c.shuffle ? 'checked' : ''}> Shuffle cards</label>
              <label class="toggle"><input type="checkbox" id="dcode" ${c.code ? 'checked' : ''}> Include coding / syntax items</label>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <button class="btn btn-primary" type="submit" id="dstart">Start deck</button>
              <span class="hint" id="davail"></span>
            </div>
          </form>
        </div>
      </section>
    `);
    const form = document.getElementById('dsetup');
    const draw = () => {
      document.getElementById('dchips').innerHTML = TOPICS.map((t) => {
        const n = S.all.filter((q) => q.topic === t.id && (S.dcfg.code || !q.is_code)).length;
        return chip('dtopic', t.id, t.short, n, S.dcfg.topics.includes(t.id));
      }).join('');
    };
    const sync = () => {
      S.dcfg.topics = [...form.querySelectorAll('input[name=dtopic]:checked')].map((i) => i.value);
      S.dcfg.shuffle = document.getElementById('dsh').checked;
      S.dcfg.code = document.getElementById('dcode').checked;
      store.set('rv.deckcfg', S.dcfg);
      const n = deckPool(S.dcfg).length;
      document.getElementById('davail').textContent = n ? `${n} cards in this deck.` : 'No cards match these settings.';
      document.getElementById('dstart').disabled = !n;
    };
    draw();
    sync();
    form.addEventListener('change', (e) => {
      if (e.target.id === 'dcode') { S.dcfg.code = e.target.checked; S.dcfg.topics = [...form.querySelectorAll('input[name=dtopic]:checked')].map((i) => i.value); draw(); }
      sync();
    });
    form.addEventListener('click', (e) => {
      const a = e.target.dataset && e.target.dataset.act;
      if (!a) return;
      S.dcfg.topics = a === 'all' ? ALL_IDS.slice() : [];
      draw();
      sync();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let pool = deckPool(S.dcfg);
      if (S.dcfg.shuffle) pool = shuffle(pool);
      runDeck(pool);
    });
  }

  function runDeck(pool) {
    S.deck = { queue: pool.slice(), total: pool.length, known: 0, flipped: false, retry: [] };
    S.mode = 'deck';
    showCard();
  }

  function cardBack(q) {
    if (q.kind === 'card') return `<div class="ans">${rich(q.explanation)}</div>`;
    const ans = q.options[q.answer];
    return `
      <div class="ans">${esc(ans)}</div>
      <ul class="opts-list">${q.options.map((o, i) => `<li class="${i === q.answer ? 'is-ans' : ''}">${i === q.answer ? '✓ ' : '· '}${esc(o)}</li>`).join('')}</ul>
      ${q.explanation ? `<div class="why">${rich(q.explanation)}</div>` : ''}`;
  }

  function showCard() {
    const D = S.deck;
    if (!D.queue.length) return finishDeck();
    const q = D.queue[0];
    D.flipped = false;
    const done = D.known;
    setView(`
      <section class="deck-shell">
        <div class="wrap" style="max-width:820px">
          <div class="q-meta">
            <span class="eyebrow">${esc(topicLabel(q.topic))}</span>
            <div class="pile"><span>Known <b>${done}</b> / ${D.total}</span><span>Left <b>${D.queue.length}</b></span></div>
          </div>
          <div class="progress"><i style="width:${(done / D.total) * 100}%"></i></div>
          <div class="flip" id="flip">
            <div class="flip-inner" id="flip-inner" tabindex="0" role="button" aria-label="Flip card">
              <div class="face front"><span class="eyebrow side">${q.kind === 'card' ? 'Prompt' : 'Question'}</span><div class="front-text">${rich(q.prompt)}</div></div>
              <div class="face back"><span class="eyebrow side">Answer</span>${cardBack(q)}</div>
            </div>
          </div>
          <div class="flip-hint">Click the card or press <kbd>Space</kbd> to flip. <kbd>←</kbd> still learning, <kbd>→</kbd> got it.</div>
          <div class="deck-actions" style="margin-top:18px">
            <button class="btn btn-ghost" id="again-card">Still learning</button>
            <button class="btn btn-primary" id="got-card">Got it</button>
          </div>
          ${q.verify ? '<p class="hint" style="text-align:center;margin-top:14px">This card was reconstructed from the PDF; wording may differ slightly.</p>' : ''}
        </div>
      </section>
    `);
    const flip = () => { D.flipped = !D.flipped; document.getElementById('flip').classList.toggle('is-flipped', D.flipped); };
    D.flip = flip;
    document.getElementById('flip-inner').addEventListener('click', flip);
    document.getElementById('got-card').addEventListener('click', () => rate(true));
    document.getElementById('again-card').addEventListener('click', () => rate(false));
  }

  function rate(got) {
    const D = S.deck;
    if (!D || !D.queue.length) return;
    const q = D.queue.shift();
    if (got) D.known++;
    else { D.queue.push(q); if (!D.retry.includes(q.id)) D.retry.push(q.id); }
    showCard();
  }

  function finishDeck() {
    const D = S.deck;
    S.mode = 'deckdone';
    setView(`
      <section class="dark result">
        <div class="wrap">
          <div class="eyebrow" style="margin-bottom:12px">Deck complete</div>
          <div class="big">${D.total}<small> cards</small></div>
          <div class="pct">${D.retry.length ? `${D.retry.length} needed another look.` : 'All of them first try.'}</div>
          <div class="hero-actions">
            <button class="btn btn-primary" id="redo">New deck</button>
            <a class="btn btn-ghost" href="#/quiz">Take a quiz</a>
          </div>
        </div>
      </section>`);
    document.getElementById('redo').addEventListener('click', viewDeckSetup);
  }

  /* ---------- leaderboard ---------- */
  async function viewBoard() {
    S.mode = 'board';
    setView(`
      <section class="board-shell">
        <div class="wrap">
          <div class="section-head">
            <span class="eyebrow">Leaderboard</span>
            <h2>Top scores</h2>
            <p>Ranked by percentage, then by number of questions, then by time. Scores are self-reported.</p>
          </div>
          ${RV.live ? '' : '<div class="banner">Offline mode: this leaderboard is stored only in your own browser until the shared backend is connected.</div>'}
          <div class="board-tools">
            <div class="field"><label for="bt">Topic</label>
              <select id="bt"><option value="">All topics</option><option value="mixed">Mixed topics</option>${TOPICS.map((t) => `<option value="${t.id}">${esc(t.short)}</option>`).join('')}</select></div>
            <label class="toggle" style="padding-bottom:10px"><input type="checkbox" id="best" checked> Best score per player</label>
            <button class="btn btn-ghost btn-sm" id="refresh" style="margin-bottom:6px">Refresh</button>
          </div>
          <div class="table-wrap" id="board"><div class="empty">Loading...</div></div>
        </div>
      </section>`);
    let rows = [];
    const draw = () => {
      const topic = document.getElementById('bt').value;
      const best = document.getElementById('best').checked;
      let list = rows.filter((r) => !topic || r.topic === topic);
      if (best) {
        const seen = new Map();
        list.forEach((r) => { const k = r.name.trim().toLowerCase(); if (!seen.has(k)) seen.set(k, r); });
        list = [...seen.values()];
      }
      list = list.slice(0, 50);
      document.getElementById('board').innerHTML = list.length
        ? `<table>
            <thead><tr><th>#</th><th>Player</th><th class="num">Score</th><th class="num">%</th><th class="num">Time</th><th class="hide-sm">Topic</th><th class="hide-sm">Date</th></tr></thead>
            <tbody>${list.map((r, i) => `
              <tr class="${i === 0 ? 'top1' : ''}">
                <td class="rank">${i + 1}</td>
                <td class="name">${esc(r.name)}</td>
                <td class="num">${r.score} / ${r.total}</td>
                <td class="num">${r.pct}%</td>
                <td class="num">${fmtTime(r.seconds)}</td>
                <td class="hide-sm">${esc(topicLabel(r.topic))}</td>
                <td class="hide-sm">${esc(new Date(r.created_at).toLocaleDateString())}</td>
              </tr>`).join('')}</tbody>
          </table>`
        : '<div class="empty">No scores yet. Finish a quiz of 10 or more questions and post yours.</div>';
    };
    const load = async () => {
      document.getElementById('board').innerHTML = '<div class="empty">Loading...</div>';
      try { rows = (await RV.loadScores()) || []; draw(); }
      catch (e) { document.getElementById('board').innerHTML = '<div class="empty">Could not load the leaderboard. Try again in a moment.</div>'; }
    };
    document.getElementById('bt').addEventListener('change', draw);
    document.getElementById('best').addEventListener('change', draw);
    document.getElementById('refresh').addEventListener('click', load);
    load();
  }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (S.mode === 'quiz' && S.quiz) {
      const it = S.quiz.items[S.quiz.i];
      const key = e.key.toLowerCase();
      if (!S.quiz.answered) {
        let k = -1;
        if (it.q.kind === 'tf') k = key === 't' ? 0 : key === 'f' ? 1 : -1;
        if (k < 0) k = 'abcdefgh'.indexOf(key);
        if (k < 0 && /^[1-8]$/.test(key)) k = +key - 1;
        if (k >= 0 && k < it.order.length) { e.preventDefault(); choose(k); }
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextQuestion();
      }
    } else if (S.mode === 'deck' && S.deck && S.deck.queue.length) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); S.deck.flip && S.deck.flip(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); rate(true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); rate(false); }
    }
  });

  /* ---------- router ---------- */
  function route() {
    stopTimer();
    const h = (location.hash || '#/').replace(/^#/, '');
    const page = h.startsWith('/quiz') ? 'quiz' : h.startsWith('/cards') ? 'cards' : h.startsWith('/board') ? 'board' : 'home';
    document.querySelectorAll('.nav-links a').forEach((a) => {
      if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (page === 'quiz') viewQuizSetup();
    else if (page === 'cards') viewDeckSetup();
    else if (page === 'board') viewBoard();
    else viewHome();
  }
  window.addEventListener('hashchange', route);
  document.querySelector('.nav-links').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); route(); }
  });

  /* ---------- boot ---------- */
  app.innerHTML = '<div class="wrap"><div class="empty" style="padding:120px 0">Loading questions...</div></div>';
  RV.loadQuestions()
    .then(({ items, source }) => {
      S.all = items;
      S.source = source;
      route();
    })
    .catch(() => {
      app.innerHTML = '<div class="wrap"><div class="panel" style="margin:80px 0"><span class="eyebrow">Something went wrong</span><h3>Could not load the questions</h3><p class="muted" style="margin:8px 0 18px">Check your connection and try again.</p><button class="btn btn-primary" onclick="location.reload()">Reload</button></div></div>';
    });
})();
