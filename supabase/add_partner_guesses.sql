-- Add partner guess columns to game answer tables

alter table would_you_rather_answers add column if not exists guess text;
alter table this_or_that_answers add column if not exists guess text;
