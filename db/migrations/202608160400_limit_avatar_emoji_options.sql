BEGIN;

-- The picker has 30 desktop slots, but slot 0 is always the add-emoji control.
-- Retain the most-recent 29 entries before making the invariant database-enforced.
UPDATE users
SET avatar_emoji_options = avatar_emoji_options[1:29]
WHERE cardinality(avatar_emoji_options) > 29;

ALTER TABLE users
  ADD CONSTRAINT users_avatar_emoji_options_limit
  CHECK (
    avatar_emoji_options IS NULL OR (
      array_ndims(avatar_emoji_options) = 1 AND
      cardinality(avatar_emoji_options) <= 29
    )
  );

COMMIT;
