# Implementation plan

Audit: The app is one client-side Next.js route with Home, setup, scoring, Games, history and profiles. Pure TypeScript engines calculate Nassau, Skins, Wolf, Hammer, Vegas and the remaining side games from saved hole data. Settlement reconciles a zero-sum ledger. Simulation generates score events. Browser localStorage holds the current round and history. Preserve those flows and the versioned rules behavior.

1. Add Sixes and a reusable game catalog with compatibility, complexity, team and exposure metadata. Build deterministic recommendations and conservative exposure estimates, with unit tests.
2. Add a guided Game Caddie that returns three explainable, compatible recommendations and hands a chosen game to the existing setup flow.
3. Add locally persisted House Rules, groups, trip plans, derived insights and rivalries; keep all actions functional and computed from saved rounds where possible.
4. Reposition Home and Game Library around discovery. Add round recap/share, development-only demo tools, and pricing concepts without payments.
5. Run existing and new engine tests, lint, type checks, production build and manual mobile acceptance flow. Fix regressions and document the architecture and limits.

## Next product unit: recurring local groups

1. Add a weekly event beneath each permanent group: course, date, attendance, home House Rule and status.
2. Split 4–12 attendees into balanced two-to-four-player pods and let the organizer adjust the lineup.
3. Create one live round per pod with its own invite and score-entry permissions, all linked to the weekly event.
4. Add event-wide Quota/Chicago and Stableford scoring, then combined skins and season points.
5. Finalize the weekly event only after every pod completes or withdraws; preserve the score and edit audit trail.
6. Add substitutes, recurring tee time, home course, default tees and a saved home-game template.
