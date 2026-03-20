# FantasyLand

## Current State
- Voice message recording uses hold-to-record; on release it auto-sends immediately with no confirmation step
- Truth or Dare has a mode selector (Strangers / AI); Strangers mode dumps everyone into the shared `truth-dare` room (no 1v1 matchmaking)

## Requested Changes (Diff)

### Add
- After recording stops, show a voice preview bar in the typing area: a small audio player, a green Send icon, and an X cancel icon
- Truth or Dare: when user picks "Play with Strangers", enter a matchmaking flow (reuse MatchmakingScreen) to match with one other user; on match, enter a private 1v1 room that has both chat and the spin panel overlay

### Modify
- ChatRoom: `stopRecording` no longer auto-sends; instead stores blob in state. Typing bar shows voice preview row with send/cancel when `pendingVoice` is set
- TruthOrDareRoom: "Play with Strangers" mode transitions through `matchmaking` state using MatchmakingScreen; on match, use matched roomId for the ChatRoom instead of the static `truth-dare` room

### Remove
- Auto-send on recording stop

## Implementation Plan
1. In ChatRoom.tsx: add `pendingVoice` state (Blob | null). stopRecording stores blob, does NOT send. Show preview bar with `<audio>` player, send button (triggers actual send), cancel button (clears blob).
2. In TruthOrDareRoom.tsx: add `matchmaking` state to the mode enum. When strangers button clicked, set mode to `matchmaking`. Render MatchmakingScreen with onMatched setting mode to `strangers` and storing the matched roomId. Use that roomId for the ChatRoom with spin panel.
