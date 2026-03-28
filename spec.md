# FantasyLand

## Current State
Game Zone has stranger matchmaking that pairs two players, but after matching, the game is played locally (fake AI opponent). No real move syncing happens between matched strangers.

Backend has RPS game support (`createRPSChallenge`, `joinRPSGame`, `playRPS`, `getRPSGame`) for chat rooms. Game Zone queue uses `joinGameQueue`/`getGameQueueMatch`/`leaveGameQueue`.

## Requested Changes (Diff)

### Add
- Backend `GameSession` type with RPS and TTT support (player1/player2, moves, result, status)
- Backend functions: `createGameSession`, `joinGameSession`, `submitRPSMove`, `submitTTTMove`, `getGameSession`
- New `StrangerGame.tsx` frontend component for synced RPS/TTT between matched strangers
- Hooks for all new backend functions

### Modify
- GameRoom.tsx: after stranger match, show `StrangerGame` instead of local `DuelGame`
- backend.did.d.ts: add GameSessionView type and new method signatures

### Remove
- Nothing removed

## Implementation Plan
1. Add GameSession backend (Motoko) with RPS + TTT logic
2. Update declarations file
3. Add 5 new hooks to useQueries.ts
4. Create StrangerGame.tsx component that:
   - Determines player1 vs player2 from matchId
   - Player1 sees game picker (RPS or TTT), creates session on pick
   - Player2 polls for session and auto-joins when session appears
   - Both poll getGameSession and render live game state
5. Wire StrangerGame into GameRoom when matchPhase === 'playing'
