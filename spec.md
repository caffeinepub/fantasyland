# FantasyLand

## Current State
- 1v1 chat has a Skip button in the header when `isStranger && onSkip`
- Social Media room has a composer (textarea + photo/video/camera buttons + Publish) but the bottom row overflows on small screens
- Game Zone has 6 games (RPS, TTT, Number Guess, Word Scramble, Trivia, 1v1 Duel) but no Play with Strangers / Play with AI mode selector
- TrendingPopup fires at 10 likes (trending) and 20 likes (viral) — far too low

## Requested Changes (Diff)

### Add
- **Talk button** in 1v1 chat header (next to Skip): sends a friendly icebreaker message "Hey! Let's talk! 👋" into the chat
- **Game Zone mode selector**: at the top of GameRoom, two cards — "Play with Strangers" (matchmaking, find a live opponent, show waiting/matched state) and "Play with AI" (existing solo games). Default shows the selector; choosing a mode enters that sub-experience.
- Views counter on Social Media posts (increments when a post is expanded/read)

### Modify
- **Trending popup thresholds**: change from 10/20 likes to 1000 likes (trending) and 10000 views (viral). In demo/dev mode, simulate with a debug multiplier so it fires at 10 likes / 100 views to test UI.
- **Social Media composer layout**: make the action buttons row (`flex-wrap`) so Photo/Video/Camera and Publish button don't overflow on small screens. Publish button should always be visible. Add `min-w-0` and proper responsive padding.

### Remove
- Nothing removed

## Implementation Plan
1. In `ChatRoom.tsx`: add a "💬 Talk" button next to Skip (only when `isStranger`) that sends an icebreaker message
2. In `SocialMediaRoom.tsx`: 
   - Wrap composer bottom row in `flex-wrap gap-2` with Publish always on its own if needed
   - Add `views` field to Post type, increment on post render/expand
   - Change trending threshold to 1000 likes (trending) and 10000 views (viral); keep a `DEV_MODE` multiplier (1000x) so it still fires easily in demo
3. In `GameRoom.tsx`: add a `gamePlayMode` state (`null | 'ai' | 'stranger'`). When null, show a mode selector screen with two big cards. 'ai' = existing game UI. 'stranger' = matchmaking UI (waiting for opponent, then plays same games with simulated opponent turns)
