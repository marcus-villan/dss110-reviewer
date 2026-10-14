/* Data layer: questions + leaderboard (Supabase REST when configured, otherwise bundled/local fallbacks). */
(function () {
  'use strict';

  const C = window.RV_CONFIG || {};
  const live = !!(C.url && C.key);
  const base = String(C.url || '').replace(/\/+$/, '');

  /* ---------- tiny helpers shared by the pages ---------- */
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Text with ``` fenced blocks -> escaped HTML with <pre> blocks.
  function rich(text) {
    const parts = String(text == null ? '' : text).split('```');
    return parts
      .map((p, i) => {
        if (i % 2) return '<pre>' + esc(p.replace(/^\n/, '').replace(/\n$/, '')) + '</pre>';
        let t = p;
        if (i > 0) t = t.replace(/^\n/, '');
        if (i < parts.length - 1) t = t.replace(/\n$/, '');
        return esc(t);
      })
      .join('');
  }

  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  const fmtTime = (s) => {
    s = Math.max(0, Math.round(s));
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  };

  /* ---------- REST ---------- */
  function headers() {
    const h = { apikey: C.key, 'Content-Type': 'application/json' };
    if (!String(C.key).startsWith('sb_')) h.Authorization = 'Bearer ' + C.key; // legacy JWT anon keys
    return h;
  }

  async function rest(path, opts) {
    const res = await fetch(base + '/rest/v1/' + path, Object.assign({ headers: headers() }, opts || {}));
    const text = await res.text();
    if (!res.ok) throw new Error(text || res.statusText);
    return text ? JSON.parse(text) : null;
  }
  const rpc = (name, args) => rest('rpc/' + name, { method: 'POST', body: JSON.stringify(args) });

  /* ---------- questions ---------- */
  function normalize(r) {
    return {
      id: r.id,
      topic: r.topic,
      kind: r.kind,
      prompt: r.prompt,
      options: Array.isArray(r.options) ? r.options : [],
      answer: r.answer == null ? null : Number(r.answer),
      explanation: r.explanation || '',
      is_code: !!r.is_code,
      verify: !!r.verify,
      source: r.source || '',
      position: Number(r.position) || 0,
    };
  }

  async function bundled() {
    const res = await fetch('data/questions.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Could not load data/questions.json');
    return (await res.json()).map(normalize);
  }

  async function loadQuestions() {
    if (live) {
      try {
        const rows = await rest('rv_questions?select=*&order=position.asc,id.asc&limit=2000');
        if (rows && rows.length) return { items: rows.map(normalize), source: 'live' };
      } catch (e) {
        /* fall through to the bundled copy */
      }
    }
    return { items: await bundled(), source: 'bundled' };
  }

  /* ---------- leaderboard ---------- */
  const LOCAL_KEY = 'rv.scores';
  const localRead = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch (e) { return []; }
  };

  async function loadScores() {
    if (live) {
      return rest('rv_leaderboard?select=*&order=pct.desc,total.desc,seconds.asc,created_at.asc&limit=500');
    }
    return localRead().sort((a, b) => b.pct - a.pct || b.total - a.total || a.seconds - b.seconds);
  }

  async function submitScore(entry) {
    if (live) {
      const out = await rpc('rv_submit_score', {
        p_name: entry.name, p_topic: entry.topic, p_score: entry.score, p_total: entry.total, p_seconds: entry.seconds,
      });
      if (!out || !out.ok) throw new Error((out && out.error) || 'Could not submit score.');
      return;
    }
    const rows = localRead();
    rows.push({
      id: Date.now(), name: entry.name, topic: entry.topic, score: entry.score, total: entry.total,
      seconds: entry.seconds, created_at: new Date().toISOString(),
      pct: Math.round((1000 * entry.score) / entry.total) / 10,
    });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(-300)));
  }

  /* ---------- admin (every call carries the passcode; the database checks it) ---------- */
  const need = () => { if (!live) throw new Error('The admin page needs the online backend (see js/config.js).'); };
  const wrap = async (p) => {
    const out = await p;
    if (out && out.ok === false) throw new Error(out.error === 'unauthorized' ? 'Wrong passcode, or too many attempts. Try again later.' : out.error || 'Request failed');
    return out;
  };

  const admin = {
    async check(pass) { need(); return rpc('rv_admin_check', { p_pass: pass }); },
    deleteScore(pass, id) { need(); return wrap(rpc('rv_admin_delete_score', { p_pass: pass, p_id: id })); },
    clearScores(pass, topic) { need(); return wrap(rpc('rv_admin_clear_scores', { p_pass: pass, p_topic: topic || null })); },
    saveQuestion(pass, q) { need(); return wrap(rpc('rv_admin_save_question', { p_pass: pass, p_q: q })); },
    deleteQuestion(pass, id) { need(); return wrap(rpc('rv_admin_delete_question', { p_pass: pass, p_id: id })); },
    async importQuestions(pass, items, onProgress) {
      need();
      let done = 0;
      for (let i = 0; i < items.length; i += 40) {
        await wrap(rpc('rv_admin_import_questions', { p_pass: pass, p_items: items.slice(i, i + 40) }));
        done = Math.min(items.length, i + 40);
        if (onProgress) onProgress(done, items.length);
      }
      return done;
    },
    bundled,
  };

  window.RV = { live, esc, rich, shuffle, fmtTime, loadQuestions, loadScores, submitScore, admin, util: { esc, rich, shuffle, fmtTime } };
})();
