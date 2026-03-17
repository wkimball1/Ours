-- Add a short evocative theme to content_sets, shown to users as the
-- framing for each daily/weekly session (e.g. "feeling chosen").
ALTER TABLE content_sets ADD COLUMN IF NOT EXISTS theme text;

-- Themes for the Week 1 daily sets, derived from the prompt content
UPDATE content_sets SET theme = 'feeling chosen'     WHERE name = 'Week 1 - Day 1' AND type = 'daily';
UPDATE content_sets SET theme = 'warmth & security'  WHERE name = 'Week 1 - Day 2' AND type = 'daily';
UPDATE content_sets SET theme = 'looking forward'    WHERE name = 'Week 1 - Day 3' AND type = 'daily';
UPDATE content_sets SET theme = 'small appreciations' WHERE name = 'Week 1 - Day 4' AND type = 'daily';
UPDATE content_sets SET theme = 'being cared for'    WHERE name = 'Week 1 - Day 5' AND type = 'daily';
UPDATE content_sets SET theme = 'closeness'          WHERE name = 'Week 1 - Day 6' AND type = 'daily';
UPDATE content_sets SET theme = 'your week together' WHERE name = 'Week 1 - Weekly Reset' AND type = 'weekly';
