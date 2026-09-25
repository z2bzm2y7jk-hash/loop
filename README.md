# Loop

**The golf game operating system that helps groups decide what to play, run the game, track the action, and settle up.** Loop is a mobile-first web application moving from a local prototype to a private shared-round beta. It tracks side games and payments owed; it never collects wagers, holds money, transfers funds, or takes a percentage.

## Run and verify

Requires Node.js 22–24 and npm.

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run db:check
npm run build
```

Open the local URL reported by `npm run dev` (normally http://localhost:3000). The shared beta requires an account and a configured MariaDB/MySQL database. The production branch includes secure sessions, hashed passwords, per-account cloud saves, validated environment configuration, pooled database connections, repeatable migrations, and a deployment health endpoint.

## A round in the prototype

Home asks **What are we playing today?** Tap **Pick my game** for Game Caddie. Choose 2–8 players, 9/18 holes, names/handicaps, vibe, maximum exposure target, complexity, and team preference. The deterministic engine offers three compatible games and explains why. **Show me 3 more** excludes earlier choices. **Surprise me** selects from the approved three. The Games screen also offers a shorter surprise flow with an exposure target.

A recommendation opens round setup with suggested values. **Bet amounts and rules** appears before the game library and accepts whole-dollar amounts. **Use recommended settings** advances to review; **Customize** opens the same editable settings used in direct setup. During an active round, **Edit games & bets** changes the game list or values and recalculates recorded holes. The exposure range and modeled maximum are planning estimates, not hard caps. Wolf per-hole overrides and edited settings can exceed the model. Review values together before starting.

Enter whole-stroke scores with the large +/- controls, then save each hole. Wolf partner/lone/blind choices, Hammer offers, Vegas partners, greenies, sandies, dots, and three-putts are recorded per hole when selected. Games shows results and presses; Money shows each game’s balance. Completion opens a recap and share card with final standings, biggest moment, and settlement. Share uses the Web Share API with a generated PNG card when supported, with text or copy fallback. Save card downloads the image locally. **Mark paid** records a reversible local flag only.

**Demo tools** on the scoring screen simulate one, three, front nine, back nine, or all remaining holes. They also force a tied skin, force a birdie, trigger a manual Nassau press, and reset the active round. These controls make game outcomes testable without entering 18 holes by hand.

## Screens and persistence

- **Home:** discovery, current round, recent rounds, groups, House Rules, trips, library.
- **Game Caddie:** guided recommendations using compatibility, handicaps, style, recent group games, and exposure.
- **Games:** discovery sections for recommended, popular, team, individual, low-stakes, chaos, quick-nine and new formats; each card has Learn and Play.
- **Groups:** Saturday Guys demo with 18 seeded/completed rounds, derived stats, insights, records and rivalries. New groups can be created locally.
- **House Rules:** save, play, edit, duplicate, and delete configurations. The Game Creator preview composes supported games and bonuses into a saved House Rule.
- **Trips:** Myrtle Beach 2027 demo has 12 golfers, three days, nine calculated foursome rounds, standings and net settlement. Create a local trip, define round plans, and attach a completed round.
- **Profile:** player records, best partner, toughest opponent, favorite game and head-to-head rivalries.
- **Membership:** all 12 games are unlocked during private beta. Optional secure checkout links can be configured later for Game Captain and Trip Captain plans.

Account preferences, the active round, completed history, House Rules, groups and trips persist in the user’s online account. A small browser cache supports recovery if a save is interrupted. Paid flags record settlement status only; Loop never moves wager money.

An active round receives the first position on Home with hole progress, live balances, and direct Continue, Share, and End Round actions. Ending early requires a reason and an explicit group decision: save the partial score and current bet balances to history, or discard the round so it contributes nothing to records or stats.

Live sharing creates an expiring round link. Captain scoring is the recommended default and gives everyone else an automatically refreshed read-only scorecard. Captains can instead create a group-scoring link. Every accepted hole save uses an expected revision, rejects stale conflicting updates, and records the account, time, hole, and editor color in the activity feed. Hostinger-compatible polling fetches only changes after the phone’s last accepted revision and pauses while the page is in the background.

## Architecture

- `app/page.tsx`: client screen routing and round state; `app/globals.css`: mobile/desktop styling.
- `lib/types.ts`, `lib/rules.ts`, `lib/product-model.ts`: typed round, player, rules and saved product data.
- `lib/library.ts`, `lib/game-catalog.ts`: 12 supported games and discovery metadata.
- `lib/recommendations/gameCaddie.ts`: deterministic candidate scoring and explanation.
- `lib/games/exposure.ts`: projected range, modeled maximum, and suggested settings.
- `lib/games/*`: pure payout engines, including rotating partnerships in Sixes and hole decisions in Wolf/Hammer/Vegas.
- `lib/games/index.ts`, `lib/settlement.ts`: zero-sum ledger and cent-safe payment matching.
- `lib/insights/*`, `lib/trip-insights.ts`, `lib/recap.ts`, `lib/share-card.ts`: derived group, player, trip and round outputs.
- `lib/simulation.ts`, `lib/demo-tools.ts`: handicap-weighted demo scores and deliberate test events.
- `components/*`: guided Caddie, configuration, discovery, group/trip pages and recap.
- `lib/contracts/*`: validated, versioned requests for conflict-safe round synchronization.
- `lib/server/*`: server-only environment checks, database pool, and the 19-table production schema.
- `drizzle/*`: reviewed MariaDB/MySQL migration files.
- `app/api/v1/health`: deployment and database readiness check.

All game balances are recalculated from saved holes. House Rules store configurations, not a second copy of scoring results. Group/trip insights derive from completed rounds. Local storage has a simple version field but still needs schema validation and migrations for production.

[Game rules and payout assumptions](GAME_RULES.md) documents the supported variants. [Production architecture](PRODUCTION_ARCHITECTURE.md) defines the Hostinger design and trust invariants. [Competitive strategy](COMPETITIVE_STRATEGY.md) covers the market, differentiation, pricing hypotheses, and growth loop. [Build and launch plan](BUILD_AND_LAUNCH.md) covers the beta gates.

## Current limits

The course finder can locate courses and tees, but production provider licensing and cache policy still need validation. Live links currently require each tester to sign in, and weak-service offline command queuing remains launch work. Exposure is modeled conservatively and is not enforced as a real loss cap. Custom games can only combine the supported engines, not arbitrary natural-language rules. Paid checkout links remain unset during the free private beta. Restore drills and jurisdiction-specific product review remain launch work.
