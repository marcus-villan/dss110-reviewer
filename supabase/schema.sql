-- DSS110 Reviewer: tables, row-level security and admin functions.
-- Run once in the Supabase SQL editor. After that, run the "set passcode" statement at the bottom
-- (with your own salt + hash; see README). Never commit the passcode itself.

create table if not exists public.rv_questions (
  id text primary key,
  topic text not null,
  kind text not null check (kind in ('mc','tf','card')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  answer int,
  explanation text not null default '',
  is_code boolean not null default false,
  verify boolean not null default false,
  source text not null default '',
  position int not null default 0
);

create table if not exists public.rv_scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 24),
  topic text not null,
  score int not null check (score >= 0),
  total int not null check (total >= 10 and total <= 500),
  seconds int not null check (seconds >= 0),
  created_at timestamptz not null default now(),
  check (score <= total)
);

create table if not exists public.rv_admin (
  id int primary key default 1 check (id = 1),
  salt text not null,
  pass_hash text not null
);

create table if not exists public.rv_admin_attempts (
  id bigint generated always as identity primary key,
  at timestamptz not null default now()
);

create or replace view public.rv_leaderboard with (security_invoker = true) as
  select id, name, topic, score, total, seconds, created_at,
         round(100.0 * score / total, 1)::float8 as pct
  from public.rv_scores;

alter table public.rv_questions enable row level security;
alter table public.rv_scores enable row level security;
alter table public.rv_admin enable row level security;
alter table public.rv_admin_attempts enable row level security;

drop policy if exists "read questions" on public.rv_questions;
create policy "read questions" on public.rv_questions for select to anon, authenticated using (true);
drop policy if exists "read scores" on public.rv_scores;
create policy "read scores" on public.rv_scores for select to anon, authenticated using (true);
-- rv_admin and rv_admin_attempts get no policies: nobody can read or write them directly.

revoke all on public.rv_admin, public.rv_admin_attempts from anon, authenticated;
revoke insert, update, delete on public.rv_questions, public.rv_scores from anon, authenticated;
grant select on public.rv_questions, public.rv_scores, public.rv_leaderboard to anon, authenticated;

-- ---------- internal helpers ----------
create or replace function public.rv_admin_ok(p_pass text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare r public.rv_admin; recent int;
begin
  select count(*) into recent from public.rv_admin_attempts where at > now() - interval '10 minutes';
  if recent >= 8 then return false; end if;
  select * into r from public.rv_admin where id = 1;
  if r.id is null or p_pass is null then
    insert into public.rv_admin_attempts default values; return false;
  end if;
  if encode(sha256(convert_to(r.salt || p_pass, 'UTF8')), 'hex') = r.pass_hash then
    delete from public.rv_admin_attempts where true; return true;
  end if;
  insert into public.rv_admin_attempts default values;
  delete from public.rv_admin_attempts where at < now() - interval '1 day';
  return false;
end $$;

create or replace function public.rv_upsert_question(q jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.rv_questions (id, topic, kind, prompt, options, answer, explanation, is_code, verify, source, position)
  values (
    q->>'id', q->>'topic', q->>'kind', q->>'prompt',
    coalesce(q->'options', '[]'::jsonb),
    nullif(q->>'answer','')::int,
    coalesce(q->>'explanation',''),
    coalesce((q->>'is_code')::boolean, false),
    coalesce((q->>'verify')::boolean, false),
    coalesce(q->>'source',''),
    coalesce(nullif(q->>'position','')::int, 0))
  on conflict (id) do update set
    topic = excluded.topic, kind = excluded.kind, prompt = excluded.prompt, options = excluded.options,
    answer = excluded.answer, explanation = excluded.explanation, is_code = excluded.is_code,
    verify = excluded.verify, source = excluded.source, position = excluded.position;
end $$;

-- ---------- public: submit a score ----------
create or replace function public.rv_submit_score(p_name text, p_topic text, p_score int, p_total int, p_seconds int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare n text := btrim(coalesce(p_name,''));
begin
  if char_length(n) < 1 or char_length(n) > 24 then return jsonb_build_object('ok', false, 'error', 'Name must be 1 to 24 characters.'); end if;
  if p_total is null or p_total < 10 or p_total > 500 or p_score is null or p_score < 0 or p_score > p_total or p_seconds is null or p_seconds < 0 then
    return jsonb_build_object('ok', false, 'error', 'Invalid score.');
  end if;
  if char_length(coalesce(p_topic,'')) < 1 or char_length(p_topic) > 40 then return jsonb_build_object('ok', false, 'error', 'Invalid topic.'); end if;
  insert into public.rv_scores (name, topic, score, total, seconds) values (n, p_topic, p_score, p_total, p_seconds);
  return jsonb_build_object('ok', true);
end $$;

-- ---------- admin (each call re-checks the passcode) ----------
create or replace function public.rv_admin_check(p_pass text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin return jsonb_build_object('ok', public.rv_admin_ok(p_pass)); end $$;

create or replace function public.rv_admin_delete_score(p_pass text, p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.rv_admin_ok(p_pass) then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  delete from public.rv_scores where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.rv_admin_clear_scores(p_pass text, p_topic text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.rv_admin_ok(p_pass) then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  delete from public.rv_scores where p_topic is null or topic = p_topic;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.rv_admin_save_question(p_pass text, p_q jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.rv_admin_ok(p_pass) then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  if coalesce(p_q->>'id','') = '' or coalesce(p_q->>'prompt','') = '' then return jsonb_build_object('ok', false, 'error', 'ID and question text are required.'); end if;
  if p_q->>'kind' not in ('mc','tf','card') then return jsonb_build_object('ok', false, 'error', 'Invalid type.'); end if;
  perform public.rv_upsert_question(p_q);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.rv_admin_delete_question(p_pass text, p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.rv_admin_ok(p_pass) then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  delete from public.rv_questions where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.rv_admin_import_questions(p_pass text, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare q jsonb; n int := 0;
begin
  if not public.rv_admin_ok(p_pass) then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  for q in select * from jsonb_array_elements(p_items) loop
    if q->>'kind' in ('mc','tf','card') and coalesce(q->>'id','') <> '' and coalesce(q->>'prompt','') <> '' then
      perform public.rv_upsert_question(q); n := n + 1;
    end if;
  end loop;
  return jsonb_build_object('ok', true, 'count', n);
end $$;

-- Lock the helpers away from the public API, and expose only the public-facing functions.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.rv_submit_score(text,text,int,int,int) to anon, authenticated;
grant execute on function public.rv_admin_check(text) to anon, authenticated;
grant execute on function public.rv_admin_delete_score(text,bigint) to anon, authenticated;
grant execute on function public.rv_admin_clear_scores(text,text) to anon, authenticated;
grant execute on function public.rv_admin_save_question(text,jsonb) to anon, authenticated;
grant execute on function public.rv_admin_delete_question(text,text) to anon, authenticated;
grant execute on function public.rv_admin_import_questions(text,jsonb) to anon, authenticated;

-- ---------- set the admin passcode (run separately, with YOUR values) ----------
-- Generate a salt and hash locally:
--   python3 -c "import hashlib,secrets,getpass; s=secrets.token_hex(16); p=getpass.getpass(); print(s, hashlib.sha256((s+p).encode()).hexdigest())"
-- then:
-- insert into public.rv_admin (id, salt, pass_hash) values (1, '<salt>', '<hash>')
--   on conflict (id) do update set salt = excluded.salt, pass_hash = excluded.pass_hash;
