# FantasyLand

## Current State
Game Zone has a "Play with Strangers" mode that fakes opponent matching using a random name from a hardcoded list after a short delay. No real-time multiplayer game state exists for Game Zone.

The backend already has:
- `joinMatchmaking / leaveMatchmaking / getMatchResult` for 1v1 chat
- `createRPSChallenge / joinRPSGame / playRPS / getRPSGame` for RPS multiplayer
- `joinGameQueue` does not exist yet

## Requested Changes (Diff)

### Add
- Backend: `joinGameQueue(username)` — joins game matchmaking queue, returns `?{matchId: Text; opponent: Text}` if matched immediately
- Backend: `leaveGameQueue(username)` — removes from queue
- Backend: `getGameQueueMatch(username)` — poll for match result, returns `?{matchId: Text; opponent: Text}`
- Frontend: Replace fake opponent timeout in GameRoom with real backend polling via `joinGameQueue` + `getGameQueueMatch`
- When matched, automatically start an RPS game between the two players using existing `createRPSChallenge / joinRPSGame / playRPS / getRPSGame`
- Show opponent's real username in matched banner

### Modify
- GameRoom.tsx: Replace fake `setTimeout` matching with real backend matchmaking loop (poll every 1.5s)
- GameRoom.tsx: After match, create and sync RPS game between two real users

### Remove
- `OPPONENT_NAMES` fake name array usage in stranger mode

## Implementation Plan
1. Add `gameQueue` and `gameMatchResults` HashMaps to backend
2. Add `joinGameQueue`, `leaveGameQueue`, `getGameQueueMatch` funcs to backend
3. Update `backend.d.ts` bindings
4. In GameRoom.tsx, replace fake timeout with polling loop calling `joinGameQueue` then `getGameQueueMatch`
5. On match, use `createRPSChallenge` / `joinRPSGame` so both users play real RPS together
6. Show opponent's real username in matched banner
