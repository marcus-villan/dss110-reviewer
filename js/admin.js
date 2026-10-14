/* Admin: passcode gate, leaderboard moderation, question editor, import/export. The passcode is kept in memory only. */
(function () {
  'use strict';
  const { esc, rich } = RV;
  const app = document.getElementById('app');
  const dlg = document.getElementById('qdlg');
  const lockLink = document.getElementById('lock');
  let pass = '';
  let tab = 'scores';
  let questions = [];
  let scores = [];
  const filt = { q: '', topic: '', flag: '' };

  const TOPICS = [
    ['co1', 'CO1 · SA1'], ['co2', 'CO2 · SA2'], ['co3-sup', 'CO3 · Sup & Unsup'], ['co3-app', 'CO3 · Application'],
    ['co3-tree', 'CO3 · Decision Trees'], ['co3-kmeans', 'CO3 · K-Means'], ['case', 'Case study'],
  ];
  const tLabel = (id) => (TOPICS.find((t) => t[0] === id) || [0, id])[1];

  function toast(msg, err) {
    const d = document.createElement('div');
    d.className = 'toast' + (err ? ' err' : '');
    d.setAttribute('role', 'status');
    d.textContent = msg;
    document.getElementById('toasts').appendChild(d);
    setTimeout(() => d.remove(), 3800);
  }
  const guard = async (fn) => {
    try { return await fn(); } catch (e) { toast(e.message || String(e), true); if (/passcode/i.test(e.message || '')) lock(); }
  };

  /* ---------- gate ---------- */
  function gate(msg) {
    lockLink.hidden = true;
    app.innerHTML = `<div class="wrap"><form class="gate panel" id="gf">
      <span class="eyebrow">Admin only</span>
      <h1>Enter passcode</h1>
      <p class="muted">Manage the leaderboard and the question bank.</p>
      ${RV.live ? '' : '<div class="banner">Offline mode: the backend is not configured in js/config.js, so the admin tools are unavailable.</div>'}
      ${msg ? `<div class="banner">${esc(msg)}</div>` : ''}
      <div class="field" style="margin:16px 0"><label for="pw">Passcode</label>
        <input id="pw" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary" ${RV.live ? '' : 'disabled'}>Unlock</button></form></div>`;
    const pw = document.getElementById('pw');
    pw.focus();
    document.getElementById('gf').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      try {
        const out = await RV.admin.check(pw.value);
        if (out && out.ok) { pass = pw.value; await enter(); return; }
        gate('Wrong passcode, or too many attempts. Try again in a few minutes.');
      } catch (err) { gate(err.message); }
    };
  }
  function lock() { pass = ''; questions = []; scores = []; gate(); }
  lockLink.onclick = (e) => { e.preventDefault(); lock(); };

  async function enter() {
    lockLink.hidden = false;
    app.innerHTML = '<div class="wrap"><p class="empty">Loading…</p></div>';
    await refresh();
    shell();
  }
  async function refresh() {
    const [s, q] = await Promise.all([RV.loadScores(), RV.loadQuestions()]);
    scores = s;
    questions = q.items;
  }

  function shell() {
    app.innerHTML = `<section class="section"><div class="wrap">
      <div class="section-head"><span class="eyebrow">Admin</span><h2>Manage the reviewer</h2></div>
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" data-t="scores" aria-selected="${tab === 'scores'}">Leaderboard (${scores.length})</button>
        <button class="tab" role="tab" data-t="questions" aria-selected="${tab === 'questions'}">Questions (${questions.length})</button>
        <button class="tab" role="tab" data-t="data" aria-selected="${tab === 'data'}">Import / export</button>
      </div><div id="pane"></div></div></section>`;
    app.querySelectorAll('.tab').forEach((b) => (b.onclick = () => { tab = b.dataset.t; shell(); }));
    ({ scores: paneScores, questions: paneQuestions, data: paneData })[tab]();
  }
  const pane = () => document.getElementById('pane');

  /* ---------- leaderboard ---------- */
  function paneScores() {
    const opts = '<option value="">All topics</option>' + TOPICS.map((t) => `<option value="${t[0]}">${esc(t[1])}</option>`).join('') + '<option value="mixed">Mixed</option>';
    pane().innerHTML = `<div class="admin-bar">
      <div class="field"><label for="sf">Clear scores for</label><select id="sf">${opts}</select></div>
      <button class="btn btn-danger btn-sm" id="clr">Clear…</button></div>
      <div class="table-wrap">${scores.length ? `<table><thead><tr><th>#</th><th>Name</th><th>Topic</th><th class="num">Score</th><th class="num">%</th><th class="num">Time</th><th></th></tr></thead><tbody>
      ${scores.map((r, i) => `<tr><td>${i + 1}</td><td class="name">${esc(r.name)}</td><td>${esc(tLabel(r.topic))}</td><td class="num">${r.score}/${r.total}</td><td class="num">${r.pct}</td><td class="num">${RV.fmtTime(r.seconds)}</td><td class="num"><button class="btn btn-danger btn-sm" data-del="${r.id}">Delete</button></td></tr>`).join('')}
      </tbody></table>` : '<p class="empty">No scores yet.</p>'}</div>`;
    pane().querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => guard(async () => {
      await RV.admin.deleteScore(pass, Number(b.dataset.del));
      toast('Score deleted.'); await refresh(); shell();
    })));
    document.getElementById('clr').onclick = () => guard(async () => {
      const t = document.getElementById('sf').value;
      if (!confirm(t ? `Delete ALL scores for "${tLabel(t)}"?` : 'Delete ALL scores on the leaderboard?')) return;
      await RV.admin.clearScores(pass, t || null);
      toast('Scores cleared.'); await refresh(); shell();
    });
  }

  /* ---------- questions ---------- */
  function paneQuestions() {
    const topicOpts = '<option value="">All topics</option>' + TOPICS.map((t) => `<option value="${t[0]}"${filt.topic === t[0] ? ' selected' : ''}>${esc(t[1])}</option>`).join('');
    pane().innerHTML = `<div class="admin-bar">
      <div class="field grow"><label for="qs">Search</label><input id="qs" type="search" value="${esc(filt.q)}" placeholder="Search prompts or ids"></div>
      <div class="field"><label for="qt">Topic</label><select id="qt">${topicOpts}</select></div>
      <div class="field"><label for="qf">Show</label><select id="qf">
        <option value="">Everything</option><option value="verify"${filt.flag === 'verify' ? ' selected' : ''}>Needs verification</option>
        <option value="code"${filt.flag === 'code' ? ' selected' : ''}>Coding items</option></select></div>
      <button class="btn btn-primary btn-sm" id="add">Add question</button></div>
      <div class="table-wrap" id="ql"></div>`;
    const draw = () => {
      const q = filt.q.toLowerCase();
      const list = questions.filter((x) =>
        (!filt.topic || x.topic === filt.topic) &&
        (!filt.flag || (filt.flag === 'verify' ? x.verify : x.is_code)) &&
        (!q || (x.prompt + ' ' + x.id).toLowerCase().includes(q)));
      document.getElementById('ql').innerHTML = list.length ? list.slice(0, 200).map((x) => `<div class="q-row"><div class="txt">
        <div class="p">${esc(x.prompt)}</div>
        <div class="m"><span>${esc(x.id)}</span><span>·</span><span>${esc(tLabel(x.topic))}</span><span>·</span><span>${x.kind === 'card' ? 'flashcard' : x.kind === 'tf' ? 'true/false' : 'multiple choice'}</span>
        ${x.is_code ? '<span class="tag">code</span>' : ''}${x.verify ? '<span class="tag warn">verify</span>' : ''}</div></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-e="${esc(x.id)}">Edit</button><button class="btn btn-danger btn-sm" data-d="${esc(x.id)}">Delete</button></div></div>`).join('')
        + (list.length > 200 ? `<p class="empty">Showing 200 of ${list.length}. Narrow the search.</p>` : '') : '<p class="empty">No matching questions.</p>';
      document.querySelectorAll('[data-e]').forEach((b) => (b.onclick = () => edit(questions.find((x) => x.id === b.dataset.e))));
      document.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => guard(async () => {
        if (!confirm('Delete question ' + b.dataset.d + '?')) return;
        await RV.admin.deleteQuestion(pass, b.dataset.d);
        toast('Question deleted.'); await refresh(); shell();
      })));
    };
    draw();
    document.getElementById('qs').oninput = (e) => { filt.q = e.target.value; draw(); };
    document.getElementById('qt').onchange = (e) => { filt.topic = e.target.value; draw(); };
    document.getElementById('qf').onchange = (e) => { filt.flag = e.target.value; draw(); };
    document.getElementById('add').onclick = () => edit(null);
  }

  function edit(q) {
    const isNew = !q;
    q = q || { id: '', topic: filt.topic || 'co1', kind: 'mc', prompt: '', options: ['', '', '', ''], answer: 0, explanation: '', is_code: false, verify: false, source: '', position: questions.length + 1 };
    dlg.innerHTML = `<form method="dialog" id="qf2">
      <h3>${isNew ? 'Add question' : 'Edit question'}</h3>
      <div class="admin-bar">
        <div class="field"><label for="f-id">ID</label><input id="f-id" type="text" value="${esc(q.id)}" ${isNew ? '' : 'readonly'} placeholder="e.g. sa2-30" required></div>
        <div class="field"><label for="f-topic">Topic</label><select id="f-topic">${TOPICS.map((t) => `<option value="${t[0]}"${q.topic === t[0] ? ' selected' : ''}>${esc(t[1])}</option>`).join('')}</select></div>
        <div class="field"><label for="f-kind">Type</label><select id="f-kind">
          <option value="mc"${q.kind === 'mc' ? ' selected' : ''}>Multiple choice</option><option value="tf"${q.kind === 'tf' ? ' selected' : ''}>True / False</option><option value="card"${q.kind === 'card' ? ' selected' : ''}>Flashcard only</option></select></div>
      </div>
      <div class="field"><label for="f-prompt">Question / front of card (use \`\`\` for code blocks)</label><textarea id="f-prompt" required>${esc(q.prompt)}</textarea></div>
      <div class="field" id="opts-box"><label>Options (select the correct one)</label><div id="opts"></div></div>
      <div class="field"><label for="f-exp">Answer / explanation (back of card)</label><textarea id="f-exp">${esc(q.explanation)}</textarea></div>
      <div class="admin-bar">
        <div class="field grow"><label for="f-src">Source</label><input id="f-src" type="text" value="${esc(q.source)}"></div>
        <div class="field"><label for="f-pos">Position</label><input id="f-pos" type="text" inputmode="numeric" value="${esc(q.position)}"></div></div>
      <div class="chips">
        <label class="chip"><input type="checkbox" id="f-code" ${q.is_code ? 'checked' : ''}>Coding item (hidden by default)</label>
        <label class="chip"><input type="checkbox" id="f-ver" ${q.verify ? 'checked' : ''}>Needs verification</label></div>
      <div class="q-actions" style="display:flex;gap:10px;justify-content:flex-end">
        <button type="button" class="btn btn-ghost" id="cx">Cancel</button><button class="btn btn-primary" id="sv" value="save">Save</button></div></form>`;
    let opts = (q.options && q.options.length ? q.options : ['', '', '', '']).slice();
    let ans = q.answer == null ? 0 : q.answer;
    const kind = document.getElementById('f-kind');
    const drawOpts = () => {
      const k = kind.value;
      document.getElementById('opts-box').style.display = k === 'card' ? 'none' : '';
      if (k === 'tf') opts = ['True', 'False'];
      else if (opts.length < 2 || (opts.length === 2 && opts[0] === 'True')) opts = ['', '', '', ''];
      if (ans >= opts.length) ans = 0;
      document.getElementById('opts').innerHTML = opts.map((o, i) => `<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <input type="radio" name="ans" value="${i}" ${ans === i ? 'checked' : ''} aria-label="Correct option ${i + 1}">
        <input type="text" data-o="${i}" value="${esc(o)}" ${k === 'tf' ? 'readonly' : ''} style="flex:1" aria-label="Option ${i + 1}"></div>`).join('')
        + (k === 'mc' ? '<button type="button" class="btn btn-ghost btn-sm" id="ao">Add option</button> <button type="button" class="btn btn-ghost btn-sm" id="ro">Remove last</button>' : '');
      document.querySelectorAll('[name=ans]').forEach((r) => (r.onchange = () => (ans = Number(r.value))));
      document.querySelectorAll('[data-o]').forEach((t) => (t.oninput = () => (opts[Number(t.dataset.o)] = t.value)));
      const ao = document.getElementById('ao'), ro = document.getElementById('ro');
      if (ao) ao.onclick = () => { if (opts.length < 8) { opts.push(''); drawOpts(); } };
      if (ro) ro.onclick = () => { if (opts.length > 2) { opts.pop(); drawOpts(); } };
    };
    kind.onchange = drawOpts;
    drawOpts();
    document.getElementById('cx').onclick = () => dlg.close();
    document.getElementById('qf2').onsubmit = (e) => {
      e.preventDefault();
      guard(async () => {
        const k = kind.value;
        const item = {
          id: document.getElementById('f-id').value.trim(),
          topic: document.getElementById('f-topic').value, kind: k,
          prompt: document.getElementById('f-prompt').value.trim(),
          options: k === 'card' ? [] : opts.map((o) => o.trim()),
          answer: k === 'card' ? null : ans,
          explanation: document.getElementById('f-exp').value.trim(),
          is_code: document.getElementById('f-code').checked, verify: document.getElementById('f-ver').checked,
          source: document.getElementById('f-src').value.trim(),
          position: parseInt(document.getElementById('f-pos').value, 10) || 0,
        };
        if (!item.id || !item.prompt) throw new Error('ID and question text are required.');
        if (k !== 'card' && item.options.some((o) => !o)) throw new Error('Fill in every option (or remove the empty ones).');
        await RV.admin.saveQuestion(pass, item);
        dlg.close(); toast('Saved.'); await refresh(); shell();
      });
    };
    dlg.showModal();
  }

  /* ---------- import / export ---------- */
  function paneData() {
    pane().innerHTML = `<div class="cards-3">
      <div class="panel"><span class="eyebrow">Backup</span><h3>Export</h3><p class="muted">Download the questions currently in the database as JSON.</p><p style="margin-top:16px"><button class="btn btn-primary" id="ex">Download JSON</button></p></div>
      <div class="panel"><span class="eyebrow">Restore</span><h3>Import a file</h3><p class="muted">Upload a JSON array. Existing ids are updated; new ids are added.</p><p style="margin-top:16px"><input type="file" id="imf" accept="application/json,.json"></p></div>
      <div class="panel"><span class="eyebrow">Seed</span><h3>Bundled bank</h3><p class="muted">Load data/questions.json from this site into the database (same ids are overwritten, so your edits to those ids are replaced).</p><p style="margin-top:16px"><button class="btn btn-ghost" id="sd">Import bundled questions</button></p></div></div>
      <p class="hint" id="prog" style="margin-top:16px"></p>`;
    const prog = document.getElementById('prog');
    const run = (items) => guard(async () => {
      if (!Array.isArray(items) || !items.length) throw new Error('That file has no questions.');
      for (const it of items) if (!it || !it.id || !it.prompt || !it.topic || !it.kind) throw new Error('Every item needs id, topic, kind and prompt.');
      await RV.admin.importQuestions(pass, items, (d, t) => (prog.textContent = `Imported ${d} of ${t}…`));
      toast(`Imported ${items.length} items.`); await refresh(); shell();
    });
    document.getElementById('ex').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' }));
      a.download = 'dss110-questions.json'; a.click(); URL.revokeObjectURL(a.href);
    };
    document.getElementById('imf').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { await run(JSON.parse(await f.text())); } catch (err) { toast('Could not read that file as JSON.', true); }
    };
    document.getElementById('sd').onclick = async () => {
      if (!confirm('Import the bundled question bank? Matching ids will be overwritten.')) return;
      await run(await RV.admin.bundled());
    };
  }

  gate();
})();
