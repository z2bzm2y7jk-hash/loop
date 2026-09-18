# Loop game rules and settings

These are Loop's disclosed house rules for the prototype. Golf groups use variants; agree on settings and hole decisions before playing. Every amount is scorekeeping and settlement calculation only. Loop does not hold or transfer money.

## Shared conventions

- Stakes accept dollars and cents. The label says whether an amount is **per opponent**, **per player pairing**, **per team**, or **per team point**. The group sets one starting amount for each selected game; Wolf may change its amount on a single hole.
- Gross uses recorded strokes. Net subtracts handicap strokes assigned by hole difficulty. Round configuration is fixed once play begins, while each hole saves its own Wolf, Hammer, Vegas and junk decisions.
- Team Nassau, Hammer and default Vegas use the chosen Team A versus everyone else. Nassau/Vegas require equal teams. Team winnings and losses are split equally, with a spare cent assigned in lineup order.
- A tie is a push unless a game's rule below says otherwise. Positive and negative balances always sum to zero, and end-of-round settlement is computed in cents.

| Game | Editable amount and options | How a hole pays |
| --- | --- | --- |
| Nassau | Separate front, back and overall stakes; team or all-pairs individual; gross/net; automatic presses, down threshold, press stake and cap | Gross/net best ball or individual score moves each active match one hole. Each winning match pays its configured stake. Live wins are provisional. A manual press starts on the next hole. |
| Skins | Stake per opponent, carryovers, gross/net | Unique low score wins current stake and any tied carryover from every opponent. Unwon final carryovers expire. |
| Wolf | Stake per opponent, starting Wolf, gross/net, Lone and Blind win/loss multipliers, solo tie rule | Wolf rotates by player order but can be overridden per hole. Choose a partner after that player’s drive, go Lone, or declare Blind before tee shots. Best ball decides. Partner wins or losses use 1×. Lone/Blind use configured multipliers. Each opponent owes the per-opponent stake; a two-person Wolf side shares the pooled result. Solo ties may push or count as a Wolf loss. |
| Match Play | Stake per player pairing, gross/net, per hole or whole round | Each player faces every other player. A lower score wins the hole; whole-round mode counts holes won and pays the configured amount once per pair. |
| Sixes | Team value per hole; four players and 18 holes | Partners rotate after holes 6 and 12 so every golfer partners with every other golfer once. Each pair plays best ball. The winning team receives the configured hole value, split equally; a tie pushes. |
| Vegas | Value per team point, gross/net, optional gross-birdie flip, score cap at 9 | Select teams of two, with a per-hole partner option. Scores are sorted low/high and concatenated, such as 4 and 5 → 45. Against 5 and 6 → 56, the lower 45 wins by 11 points. At $1 per point, the losing team pays $11 total, split $5.50 per player. If one side birdies and flip is on, the other side’s number reverses; birdies on both sides cancel. Without the cap, double-digit scores go first. |
| Hammer | Base stake per team per hole, gross/net, winning birdie double, accepted-throw limit | Compare team best ball. Either side can throw first; the other accepts a double or declines and concedes the existing stake. Accepted throws alternate. A gross birdie by the winning side optionally doubles the final accepted amount. Each hole resets. An unanswered offer blocks saving. |
| Greenies | Stake per opponent, selectable par-3 holes, optional gross-par requirement | Select a closest-to-pin winner on an eligible hole. If qualified, that player earns the stake from every opponent. |
| Birdies | Stake per opponent, eagle-or-better multiplier | Every gross birdie earns its stake from each opponent. Eagle or better gets the chosen multiplier; simultaneous awards can offset. |
| Sandies | Stake per opponent, optional gross-par requirement | Mark each agreed bunker up-and-down. Qualified players earn the stake from every opponent. |
| Snake | Stake per opponent, last holder or every event | Mark every three-putter in order on each hole. Either the last marked player pays everyone at round end, or each marked event pays immediately. Last-holder live money is provisional. |
| Dots | Stake per opponent | Mark each agreed achievement. Each marked player receives the stake from every opponent. |

## Exposure planning

Game Caddie models projected and possible per-player exposure using the configured base values, hole count, presses and multipliers. It recommends settings within a selected target and shows when a changed combination could exceed it. This is a conservative planning estimate, **not a hard cap**. A Wolf per-hole value override, a new mix of side games, or edited rules can raise the eventual amount. Loop does not enforce a player loss limit.

## Where choices come from

[Golf Digest's Wolf guide](https://www.golfdigest.com/story/golf-game-wolf-betting-gambling-explained) describes rotating Wolf, partner selection and Lone/Blind variants, and says points and money should be agreed on by the group. Loop exposes multipliers and ties rather than assuming one universal schedule.

[Golf Digest's Hammer guide](https://www.golfdigest.com/story/golf-betting-game-hammer-jordan-spieth-justin-thomas-netflix-full-swing) describes alternating doubles and birdie options. Loop records each offer and response to keep its settlement explainable.

[Golf Digest's Vegas guide](https://www.golfdigest.com/story/how-to-play-vegas-golf-betting-games-explained) describes point stakes and many variants. Loop uses an explicit concatenated-score team variant and configurable birdie flips. The game library and setup show the selected variant.

The game library remains concise on the phone; this document records the exact accounting assumptions for review and further development.
