# FantasyLand

## Current State
The app has StrangerGame.tsx with a 'Play Again' button that resets game state locally without notifying the opponent. The Lobby has no animated welcome banner. The App.tsx controls room routing.

## Requested Changes (Diff)

### Add
- **Rematch request flow** in StrangerGame.tsx: when game ends, instead of a simple 'Play Again' button, show a 'Request Rematch' button. When clicked, it sends a rematch request signal via the backend. The opponent sees a 'Rematch Requested' notification with Accept/Decline buttons. Both players must agree before resetting the game state. If declined, show a 'Rematch declined' message.
- **Animated FANTASYLAND popup/banner** at the very top of the Lobby page only. Should be a visually prominent animated text banner with the name 'FANTASYLAND' using glowing/pulsing animation, gradient text, and sparkle effects. This appears above the tagline and room cards.
- **Welcome popup**: An animated modal/toast popup that appears when a user first loads the lobby (not on every visit, just per-session). It welcomes the user by name ('Welcome, [username]!'). It must NOT appear inside any chat room. When the user enters any room, it should be dismissed/hidden.

### Modify
- StrangerGame done screen: replace the current simple 'Play Again' button with a proper two-player rematch request system.

### Remove
- Nothing removed.

## Implementation Plan
1. Add rematch request state to backend (or use a lightweight polling signal via existing game session backend). Add a `rematchRequested` and `rematchAccepted` field or use a simple string status in the game session.
2. In StrangerGame.tsx, on game done: show 'Request Rematch' button. Track local state: `rematchSent`, `rematchReceived`. Poll the session to detect when opponent sends rematch.
3. Add `FantasylandBanner` component -- animated glowing 'FANTASYLAND' header with CSS keyframe animations, gradient text, sparkle emojis.
4. Add `WelcomePopup` component -- shows once per session (sessionStorage flag), displays username greeting, auto-dismisses after a few seconds or on user click.
5. In App.tsx / Lobby.tsx: render banner + welcome popup only when `room.type === 'lobby'`.
