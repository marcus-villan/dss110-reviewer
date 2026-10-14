// Public settings for the shared leaderboard and the online question store.
//
// `key` is a Supabase *publishable* key. It is meant to be public: it can only do what the row-level-security
// rules in supabase/schema.sql allow (read questions and scores, and submit a score through a validated function).
// Never put a secret / service_role key here.
//
// Leave both empty to run in offline mode: questions come from data/questions.json and the leaderboard is
// stored only in the visitor's own browser.
window.RV_CONFIG = {
  url: "https://geibouejfinywxgeyeho.supabase.co",
  key: "sb_publishable_vae5qxOiDpG5ozS52LjcEg_k21eiUoF",
};
