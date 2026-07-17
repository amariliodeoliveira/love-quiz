# Product vision

This app started as a single card game. It's growing into a small private hub for the
two of us. Capturing the direction here so it isn't lost between sessions — nothing
below is built yet unless a section says so.

## The four future areas

- **Feed de Memórias (social)** — a fully private Instagram for the two of us. Day-to-day
  photo posts, albums for special moments, "time capsule" messages for the future.
- **Painel de Planos (dashboard)** — building the future together. Vision board, bucket
  lists / goals, countdowns to trips or reunions.
- **Diário de Conexão (intimacy)** — daily closeness. Quick mood check-in (emoji), a
  "question of the day" (answer to unlock the other's answer), love letters kept in a
  digital chest.
- **Hub de Lazer (entertainment)** — what we watch/read/listen to together. Movie/show
  lists, playlists, book quotes.

**Built so far:** the countdown (part of Painel de Planos), Truth or Dare (its own
existing game, predates this vision).

## Navigation, once there's more than one feature

Today there's exactly one feature (Truth or Dare) plus card management, so there's no
nav beyond the profile header. Once a second real feature area (most likely the photo
feed) exists, add a dedicated **feature nav** — a separate icon/menu button in the header,
next to the avatar circle but distinct from it (the avatar menu is for *account* actions —
avatar color, log out; a features menu is for *navigating content*, a different concern).
Don't fold feature navigation into the avatar dropdown long-term — that's only where the
countdown's "set for the first time" entry point lives for now, as a stand-in until this
real nav exists.

## Home page, once there's more than one feature

The signed-in home page becomes a light "teaser" of every area — a taste of the feed, the
next countdown, today's diary prompt, what's queued in the entertainment hub — each
piece linking deeper into its own section. Don't build this until at least two of the
four areas exist; a teaser of one thing is just that thing's page.
