# FantasyLand

## Current State
- Full chat app with multiple rooms, games, AI bot, social media, profiles
- Games: RPS, TicTacToe, NumberGuess, WordScramble, TriviaQuiz, 1v1 Duel — no sound effects
- Private room: create/join via 6-char code — currently has a reliability bug where creating fails
- AI bot in 1v1 chat: basic keyword-matching responses with fixed reply arrays
- World chat: polling at 600ms interval via useMessages hook

## Requested Changes (Diff)

### Add
- Sound effects system using Web Audio API (no external files) — synthetic sounds for: game win, game lose, correct answer, wrong answer, game start, button click, countdown tick, level up, match found
- `useGameSounds` hook in `src/frontend/src/hooks/useGameSounds.ts` exposing `playWin()`, `playLose()`, `playCorrect()`, `playWrong()`, `playStart()`, `playTick()`, `playClick()`, `playLevelUp()`, `playMatchFound()`
- Advanced AI bot with conversation memory, mood detection, multi-turn context, topic threading, trivia challenge mode, story mode, and 3x more response categories

### Modify
- **PrivateRoomModal**: Fix the create flow — if actor not ready, show a loading state; if `createRoom.mutateAsync` returns `false` (room already exists), treat it as a join and enter anyway with a toast "Room already exists — joining it!"; add retry logic
- **GameRoom.tsx / RPSGame.tsx / TicTacToe.tsx / NumberGuess.tsx**: Wire `useGameSounds` — play `playWin()` on round win, `playLose()` on round loss, `playCorrect()` on correct answer/move, `playWrong()` on wrong answer, `playStart()` on game start, `playTick()` when timer hits ≤10s in WordScramble/Trivia
- **ChatRoom.tsx AI bot**: Replace `getBotReply()` with `getAdvancedBotReply(msg, conversationHistory)` that has: full personality, mood tracking, memory of last 5 messages, topic detection (relationships, food, music, movies, sports, tech, travel, life advice), multi-part answers, follow-up questions, joke delivery in 2 parts, and genuine emotional responses
- **World chat polling**: Change refetchInterval from 600ms to 300ms specifically for worldChat roomId, and use `staleTime: 0, gcTime: 0` to always get fresh data

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/hooks/useGameSounds.ts` — Web Audio API synth sounds, respects user mute setting from localStorage
2. Update `ChatRoom.tsx` — replace `getBotReply` with advanced multi-turn AI with memory, wire sound effects for message send
3. Update `GameRoom.tsx` — import `useGameSounds`, add sound calls at game result moments in all 6 game components
4. Update `RPSGame.tsx`, `TicTacToe.tsx`, `NumberGuess.tsx` — wire sounds
5. Update `PrivateRoomModal.tsx` — fix create/join logic to be robust
6. Update `useQueries.ts` — world room gets 300ms polling interval
