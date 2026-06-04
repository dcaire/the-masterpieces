-- The Masterpieces — seed the core quartet.
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard → your project → SQL Editor).
--
-- Voice parts confirmed by Beth: Sherry Miller (Soprano), Donna White (Alto),
-- Steve Miller (Tenor), Jim Tucker (Bass).
--
-- This only adds the four core members. Phone/email are left blank; fill them in
-- from the app so the email features (availability requests) can reach everyone.

insert into roster (name, voice_part, singer_type, active, joined_date) values
  ('Sherry Miller','Soprano', 'member', true, current_date),
  ('Donna White',  'Alto',    'member', true, current_date),
  ('Steve Miller', 'Tenor',   'member', true, current_date),
  ('Jim Tucker',   'Bass',    'member', true, current_date);
