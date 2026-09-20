# Loop competitive strategy

Research updated September 20, 2026. Product claims and prices change quickly; verify them quarterly before publishing comparisons.

## Decision

Loop should not compete as another GPS, swing-analysis, or generic scorecard app. That market is mature and expensive to enter. Loop should own a narrower job:

> The trusted game operating system for a regular golf group: agree on the exact rules, score once, understand every dollar, and run it back next round.

The organizer is the buyer. Everyone else must be able to join as a guest, see the rules, and follow the round without changing their preferred GPS or handicap app.

## Market map

| Product | Current position | Price signal | Strengths | Opening for Loop |
| --- | --- | --- | --- | --- |
| [BEEZER Golf](https://beezergolf.com/pricing) | Broad scorecard, GPS, stats and roughly 28 side games | $29.99/year | Game breadth, live score synchronization, GPS and watch support | Reviews still ask for deeper rule variants, clearer Nassau presentation, editable course data and smoother first-round setup |
| [Stick Golf](https://stickapp.golf/) | Betting-first scorecard built around inspectable settlement math | $59.99/year, according to its published comparison | Deep game engines, hole-by-hole narration, multi-game stacking and strong test claims | iOS-first and currently focused on 12 formats; Loop must match its trust standard while winning on guest adoption, discovery, trips and portability |
| [Skins App](https://skinsapp.com/) | Large game library and automatic settlement | $40/year in the App Store | Many formats, tutorials, live leaderboards and Troon distribution | Settings depth, group-specific rules, reliability and cross-app score portability remain meaningful battlegrounds |
| [Golf GameBook](https://www.golfgamebook.com/gold-membership) | Social scoring, tournaments, GPS and many formats | €59.99/year | Established network, tournaments up to 72 players, watch and GPS support | Heavier all-in-one product; Loop can make the first tee and settlement flows much faster for a recurring foursome |
| [18Birdies](https://18birdies.com/premium/) | Full golf super-app with GPS, coaching, stats and side games | $99.99/year | Scale, course coverage, GPS, AI and strong consumer awareness | Side games compete for attention with many other tools; Loop can be the neutral game layer for golfers who use different golf apps |
| [TheGrint](https://thegrint.com/) | Handicap, social network, GPS and scoring | $59.99/year | Handicap workflows, social graph, stats and score posting | Side-game depth and exact house-rule settlement are not the primary product promise |
| [Golfshot](https://golfshot.com/facts-about-golfshot) | GPS, watch, shot tracking, scoring and GHIN posting | $79.99/year | Mature GPS/watch experience and handicap posting | Advanced game support is secondary and paid; Loop can coexist rather than replace it |
| Emerging betting-first apps | GolfBet, Birdie Bank, MatchRoom, Press Golf, SideAction Saloon, Wicket Wagers, Tee Up and others | Free to early paid plans | Rapid feature expansion: custom bets, trips, observers, scorecard scanning and social feeds | Speed alone is not defensible. Loop needs verifiable rules, excellent guest adoption, offline resilience and a group memory that compounds over time |

Competitor pricing sources: [BEEZER](https://beezergolf.com/pricing), [Golf GameBook](https://www.golfgamebook.com/gold-membership), [18Birdies](https://18birdies.com/premium/), [TheGrint](https://thegrint.com/), [Golfshot](https://golfshot.com/facts-about-golfshot), and the [Skins App Store listing](https://apps.apple.com/us/app/skins-app/id6447497626).

## What golfers are signaling

Recurring themes in current product reviews and golfer discussions:

1. **The whole group will not adopt another golf account.** Golfers use different GPS and handicap products. The organizer needs to enter guests immediately and share a link later.
2. **House rules matter more than the game name.** “Wolf,” “Nassau,” and “Skins” are families of rules. Presses, validation, steals, carryovers, handicaps and multipliers vary by group.
3. **Trust fails on edge cases.** A polished total is useless if golfers cannot see which hole, press, carryover or decision produced it.
4. **Weak reception is normal.** A round cannot disappear or lock up because the course has poor cellular service.
5. **Double entry blocks adoption.** Many golfers already post elsewhere for GPS, statistics or handicap. Loop must export cleanly and pursue approved integrations.
6. **The first tee is time-sensitive.** Setup must take about a minute, and returning groups should begin from a saved template in seconds.
7. **Trip formats exceed ordinary scorecards.** Mixed group sizes, combined rounds, side contests and rotating teams still send golfers back to spreadsheets.

Useful research threads include golfers asking for [guest players without forcing another account](https://www.reddit.com/r/golf/comments/1viwt70/side_game_apps/), complex [multi-round trip formats](https://www.reddit.com/r/golf/comments/1savxfa/best_golf_app_for_guys_tripgames/), and the trust requirements of [inspectable calculations, offline reliability and simple invites](https://www.reddit.com/r/SideProject/comments/1w3h2c9/we_built_a_golf_sidegame_app_the_harder_problem/). Treat individual posts as qualitative signals rather than market-size evidence.

## Defensible Loop position

### 1. House Rules, not generic presets

Every group can save a named, versioned configuration. Before the round, Loop explains the effective rules in plain language and estimates the exposure. Every completed round retains the exact rule version used, even after a template changes.

### 2. A visible rules ledger

The result of every game must be traceable to scores, per-hole decisions and rule settings. The settlement view explains each material swing. Server calculations verify the ledger sums to zero in integer cents before a round can close.

### 3. One organizer, zero-friction guests

One person creates the round. Guests join from a short link or QR code without installing an app. A guest can view immediately, enter a display name, and receive a scoped round session. Creating a permanent account is optional until the golfer wants history or to start a group.

### 4. Offline-first scoring

The active round is stored on the phone before the UI confirms a save. Changes queue with idempotency keys and synchronize when service returns. Conflicts never silently overwrite a score: the app shows the two versions and lets the captain resolve them.

### 5. Neutral score portability

Loop does not try to replace every GPS, watch or official-handicap product. It exports a complete scorecard, course/tee data and round summary. Approved integrations and scorecard import reduce duplicate entry over time.

### 6. Game Caddie and exposure guardrails

Loop already recommends compatible games from player count, holes, vibe and maximum exposure. This is a meaningful differentiator if recommendations use the group's history and clearly disclose the modeled range before the first tee.

### 7. The group's season, not an individual stat warehouse

Rivalries, partners, house rules, trips, records and “run it back” flows make the group more valuable after every completed round. Individual swing analytics remain outside the core promise.

## Product boundaries

- Loop records informal accounting. It does not hold funds, transmit wagers, take a percentage of wagers or act as a sportsbook.
- No advertising inside an active round.
- No requirement that every player subscribe.
- No claim that a Loop handicap is an official Handicap Index.
- No broad GPS or swing-analysis build until the trusted-round product has repeat use.

## Revenue model to test

Pricing is a hypothesis for interviews and private beta, not a public commitment.

### Free

- Join and view any invited round
- Create guest players
- Complete a limited number of organizer rounds with full game logic
- Scorecard export and transparent settlement
- No ads during play

### Loop Group — target $39.99/year or $5.99/month

- One paying organizer, unlimited invited guests
- Unlimited rounds
- Full game and rule library
- Saved House Rules and lineups
- Group season, rivalries and advanced history
- Offline recovery and multi-device scoring
- Priority data export

This sits between BEEZER's individual $29.99 plan and Stick's reported $59.99 plan, while making the value group-based rather than requiring four subscriptions.

### Trip Pass — target $12.99 for 14 days

- Up to 16 golfers
- Multiple courses and rounds
- Team assignments and changing formats
- Combined standings, side contests and final settlement
- Every player receives the recap

This captures high-intent organizers who will pay for one trip but reject another annual subscription.

### Club/League — target $249/year after product validation

- Recurring events and saved rosters
- Multiple flights or groups
- Organizer dashboard and live leaderboard
- CSV exports and branded recap links
- No payment processing

Validate willingness to pay before building billing. Start with direct interviews and payment-intent screens; do not spend early engineering time on checkout.

## Go-to-market sequence

1. Recruit 10 founding groups with different house rules. Observe setup, nine holes, completion and settlement.
2. Reach 25 groups and measure whether at least half start a second round within their next two playing opportunities.
3. Turn the best rules explanations into accurate “How to play” pages for Nassau, Wolf, Vegas, Skins and regional variants.
4. Give local club pros and trip organizers a prebuilt group template rather than a generic referral link.
5. Make every recap invite its recipients to start the next round with the same lineup and rules.
6. Test the Group subscription and Trip Pass only after groups trust the calculation enough to return.

North-star metric: **groups completing a second trusted round**.

Guardrail metrics: payout discrepancies, lost rounds, corrected holes, time to first hole, time to enter four scores, invite completion, offline recovery success and support contacts per completed round.

## What must be true before native apps

- At least 25 real groups complete a round.
- No unresolved ledger discrepancy in validated game engines.
- Active rounds survive refresh, offline periods and duplicate submissions.
- Guest invite completion is high enough to create a group growth loop.
- A meaningful share of groups begin a second round.
- Testers can name the benefit over paper, a spreadsheet and their existing golf app.

When these gates hold, package the proven web product for iOS and Android and add native capabilities that matter on-course: reliable background sync, camera scorecard import, push notifications, share sheets and watch support.
