# Product notes

## Positioning and differentiation

Loop answers **“What are we playing today?”** for regular golf groups. Its loop is discover → agree on a game and values → score together → settle → remember the round. The advantage is the combination of Game Caddie, exposure planning, reusable House Rules, group memory, and trip management; calculation alone is not the product.

The tone should feel like golfers talking to golfers: game, side game, value, exposure, round, group and settle up. Avoid sportsbook language and casino styling.

## Free and paid concepts

Prices are product-testing placeholders, shown without checkout or disabled demo features.

| Concept | Placeholder price | Intended value |
|---|---:|---|
| Player | Free | Core scoring, Nassau/Skins/Wolf, basic settlement, one group and basic game discovery |
| Game Captain | $19.99/year | Full Caddie, unlimited House Rules/groups, advanced exposure planning, stats, custom-game combinations |
| Trip Captain | $9.99/trip | Up to 24 players, multi-round itinerary, standings, settlement and recap |

Validate willingness to pay with golfers before implementing a subscription. The free experience should remain useful.

## What this prototype deliberately excludes

No sportsbook, wager collection, money custody, transfer, bet percentage, odds, payment processing, or gambling transaction. No real account, cross-device sync, invitation link, course data provider, native app, or natural-language game generation. Share text and the PNG recap card are created locally and sent only when the golfer uses the device share sheet; the image can also be saved directly.

## Product and regulatory assumptions

This is a scoring, discovery, accounting, and recordkeeping tool for side games agreed outside the app. The UI describes projected and modeled exposure as estimates, not enforced limits. Players decide their own values and can edit per-hole choices. Before distribution, obtain legal/product review by market, particularly where money games and consumer payment features might be regulated. Avoid making claims that the app enforces a maximum loss until the engine implements an actual hard cap across all selected games.

## Recommended roadmap

1. Watch real foursomes use Game Caddie and one-handed scoring outdoors. Test whether recommended games and descriptions make sense without explanation.
2. Validate regional rule variants, particularly Wolf, Nassau press conventions, Vegas flips, and trip scoring. Add a rules review screen before play.
3. Add runtime validation/migrations, local export and backup, and an audit trail for edited holes before shipping persistent data broadly.
4. Design identity, group invitations, offline-first shared scoring and conflict resolution for a multi-device beta.
5. Add actual trip teams, configurable seasons, tee/course data, stronger player insights, accessible controls and device end-to-end tests.
6. Revisit monetization only after retention and repeat group usage show a real habit.
