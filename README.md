# DSS110 Reviewer

Quizzes, flashcards and a shared leaderboard for DSS110 (CO1 to CO3). Plain HTML, CSS and JavaScript, no build step.

- `index.html` is the reviewer (Home, Quiz, Flashcards, Leaderboard).
- `admin.html` is the owner-only page (passcode) to manage scores and questions.
- `data/questions.json` is the bundled question bank (also the offline fallback).
- `build/questions.mjs` regenerates that JSON: `node build/questions.mjs`.
- `supabase/schema.sql` creates the database used for the shared leaderboard and online questions.

## Run locally
`python3 -m http.server 8000` then open http://localhost:8000. With `js/config.js` left blank the site runs offline: questions come from the JSON file and scores are stored only in your browser.

## Publish (GitHub Pages)
Repo Settings, Pages, Deploy from a branch, `main`, `/ (root)`.

## Shared leaderboard (Supabase)
1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Create a passcode hash locally (command at the bottom of the SQL file) and insert it into `rv_admin`. Do not commit the passcode.
3. Put the project URL and the **publishable** key in `js/config.js`. Never use a secret or service_role key.
4. Open `admin.html`, unlock, and use Import / export, Import bundled questions.

## Notes
- Scores are self-reported by the browser, so a determined visitor can fake one. Use the admin page to delete entries.
- The admin page is reachable by anyone but every action is checked against the passcode in the database, with a lockout after repeated failures.
- Items marked "verify" were reconstructed where the source PDF was unclear. Coding items are hidden by default (not on the exam).
