# FantasyLand

## Current State
Game Zone has 6 games with Accept/Deny challenge cards. Users have auto-generated UIDs. Social Media room supports posts with likes. No leaderboard exists. User avatars use colored initials only.

## Requested Changes (Diff)

### Add
- Game Zone leaderboard panel showing top players by score/wins across all games
- Cute animated avatar logos for every user (guest and permanent) — small animated icon/emoji characters that appear next to usernames in chat, members list, and profile
- New Record popup: when a user beats their high score in any Game Zone game, show a celebratory animated popup (confetti, trophy icon, "New Record!" banner)
- Trending popup: when a Social Media post reaches a high like count (e.g. 10+ likes) or when a post becomes viral, show an animated "Trending Now 🔥" popup/toast notification to the room

### Modify
- User avatar system: replace plain colored initials with cute animated SVG/emoji-based avatar icons (e.g. animals, fantasy creatures) — assigned randomly and consistently per user based on their UID
- Game Zone UI: add a leaderboard tab/section showing top 10 players with their animated avatars, usernames, and scores

### Remove
- Nothing removed

## Implementation Plan
1. Create an `AVATARS` array of 20+ cute animated SVG/CSS-animated avatar icons (animals, stars, fantasy characters) assigned to users by hashing their UID
2. Replace all avatar circles (colored initials) throughout the app with these animated avatars
3. Add a leaderboard state tracked in localStorage (per game scores/wins) and display a top-10 leaderboard panel in the Game Zone room
4. Add a `NewRecordPopup` component: confetti burst + trophy + "New Record!" text, triggered when a game score exceeds previous best
5. Add a `TrendingPopup` component: fire animation + "Trending Now" banner, triggered when a post's like count crosses a threshold (10 likes) or goes viral
