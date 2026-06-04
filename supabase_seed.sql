-- The Masterpieces — seed the core quartet.
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard → your project → SQL Editor).
--
-- NOTE ON VOICE PARTS: the photo shows two women and two men, so the parts below
-- are a best guess (women on Soprano/Alto, men on Tenor/Bass). If anyone is on a
-- different part, just change the voice_part value before running — or fix it later
-- in the app via the Quartet tab (each singer card → "→ Make ..." / detail view).
--
-- This only adds the four core members. Phone/email are left blank; fill them in
-- from the app so the email features (availability requests) can reach everyone.

insert into roster (name, voice_part, singer_type, active, joined_date) values
  ('Donna White',  'Soprano', 'member', true, current_date),
  ('Sherry Miller','Alto',    'member', true, current_date),
  ('Jim Tucker',   'Tenor',   'member', true, current_date),
  ('Steve Miller', 'Bass',    'member', true, current_date);
