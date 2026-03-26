# FantasyLand

## Current State
- TruthOrDareRoom has a mode selector (Play with Strangers / Play with AI) already implemented
- ThemeContext sets CSS variables on document root, but most components use hardcoded oklch dark colors instead of CSS variables, so theme changes only affect elements that read the variables
- SocialMediaRoom has a Publish button and handlePublish function that works, but uses hardcoded dark colors throughout (not theme-aware)
- TruthOrDare strangers mode uses ChatRoom with a spin panel, but has no turn indicator showing whose turn it is to spin

## Requested Changes (Diff)

### Add
- Turn indicator in Truth or Dare 1v1 strangers room: show a clear UI element indicating which player's turn it is to spin (alternate turns between the two players; start with the joiner)

### Modify
- Fix themes to apply broadly: update SocialMediaRoom, TruthOrDareRoom, ChatRoom, Lobby, and other key pages to use CSS variables (`var(--fl-bg)`, `var(--fl-surface)`, `var(--fl-border)`, `var(--fl-text)`, `var(--fl-text-muted)`, `var(--fl-accent)`, `var(--fl-header-bg)`) instead of hardcoded dark values wherever possible
- Fix Social Media publish: ensure the post input textarea, media preview, and publish flow is clearly visible and functional across all themes; make sure the post area background uses theme surface variables

### Remove
- Nothing

## Implementation Plan
1. Update ThemeContext CSS variables to also set body background-color so page bg changes on theme switch
2. In SocialMediaRoom.tsx, replace hardcoded dark oklch colors with CSS variable references for: page bg, surface cards, border, text, muted text
3. In TruthOrDareRoom.tsx, replace hardcoded dark colors with CSS variables; add turn indicator in the strangers room showing "Your turn" vs "Stranger's turn" by tracking spin count
4. In ChatRoom.tsx, replace hardcoded dark colors on the chat container and message bubbles with CSS variables where feasible
5. In Lobby.tsx, check and replace hardcoded dark bg/surface/text with CSS variables
6. Validate build passes
