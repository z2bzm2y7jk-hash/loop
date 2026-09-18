# Loop: build and launch plan

## Product promise

**The fastest way for a golf group to agree on a game, keep score, and understand the result.** Loop's focus is flexible house rules, quick hole entry, and a payout ledger every player can check. It records group accounting; it does not hold, move, or collect money.

The first customer is the person who organizes a regular foursome or golf trip. The group is the unit of adoption: one organizer starts a round, everyone can see the rules and result, and they return together for the next outing.

## Evidence and positioning

- The U.S. had 29.1 million on-course golfers in 2025, according to the [National Golf Foundation](https://www.ngf.org/the-clubhouse/golf-industry-research/). This is a large market, but the relevant early segment is recurring social groups that play side games.
- [18Birdies](https://18birdies.com/clubhouse/golf-games/track-your-golf-games-on-the-course-with-18birdies) already offers group scoring and games including Wolf, Nassau, Vegas, and Skins. [Golf GameBook](https://www.golfgamebook.com/) offers many formats and live scoring. Calculation alone is not a differentiator.
- Loop should win a narrower job: set up a group's exact house rules in a minute, enter scores in seconds, and make every cent of the final ledger explainable. The random-game picker makes discovering a new game part of the experience.

These are product hypotheses, not proven advantages. Validate them with golfers before investing in broad distribution.

## Where the prototype stands

The local Next.js prototype has 11 games, editable stakes, hole-level Wolf/Hammer/Vegas decisions, scoring, a settlement ledger, a mobile interface, and 39 automated tests. It has no hosted URL, account system, shared rounds, real course data, durable backup, offline guarantee, or production instrumentation. It stores rounds only in each browser's localStorage. A link sent to another phone would not show the same round.

## Release sequence

### 1. Private phone beta: prove the core round

Build a hosted HTTPS mobile web beta first so a golfer can open it by link without app-store installation. One captain enters the group's scores. Preserve the current fast scoring flow. Before inviting testers:

1. Add proper course, tee, par, and stroke-index entry, starting with manual entry; avoid licensing a course database until demand is clear.
2. Add editing and undo for any hole, including its side-game decisions, with a visible revision history.
3. Add validated, versioned saved-round data and export/restore so browser storage loss does not erase a group's history.
4. Make the round usable with weak service on a course; test airplane-mode recovery and refresh on real phones.
5. Test the five most important games—Skins, Nassau, Wolf, Vegas, and Greenies—against real paper scorecards and the group's agreed rules. Mark other formats as beta until checked.
6. Add privacy-conscious error reporting and event counts. Never send names, wager values, or payout amounts into product analytics.
7. Publish a short privacy policy and support contact before external testing. Conduct a market-specific legal and app-policy review of wager accounting in parallel.

**Exit test:** 15–20 real groups each complete at least one round; no unexplained payout discrepancy or lost round; at least 80% of started pilot rounds finish; the captain can enter four scores for a hole in about 10 seconds; participants can explain the final settlement from the ledger. These are proposed decision thresholds, not industry benchmarks.

### 2. Shared-group beta: create the adoption loop

Add a server and group identity only when the single-phone round is trusted. Use a round invite link with guest access, clear captain/editing permissions, live read-only status for everyone, and conflict-safe updates. Store every saved-hole revision so two phones cannot silently overwrite one another. Keep account creation optional until someone wants long-term history.

After a round, generate a recap that is easy to share with the group. Hide monetary figures in outward-facing previews unless the organizer explicitly chooses to include them. Let the group save its rules as a template, then start the next outing from that template.

**Exit test:** groups can invite every player, finish a round despite intermittent network access, settle without math disputes, and start a second round with their saved lineup and rules.

### 3. Public release, then native app decision

Open self-serve access only after group return behavior is visible. A Home Screen web app is a reasonable first mobile delivery path; Apple supports Home Screen web-app capabilities on iOS ([Apple developer documentation](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)). Consider a native iPhone app when on-course usage shows that native input, offline reliability, accessibility, or distribution would materially improve the experience. Do not simply wrap the website: Apple's [minimum functionality guideline](https://developer.apple.com/app-store/review/guidelines/) requires a useful app experience beyond a repackaged site.

## Distribution: make each round introduce the next group

1. **Founding groups:** recruit 15–20 recurring foursomes and trip organizers directly. Sit with them through setup and settlement. Ask which rule or payout they argued about and whether they would use Loop at their next outing.
2. **Built-in invitation:** the captain shares one round link before tee-off; other golfers view rules and live status without a forced signup. At the end, each receives a recap and a clear way to start a new group round. This is the primary growth loop.
3. **Useful owned content:** publish concise, accurate “How to play” pages and calculators for Wolf, Vegas, Nassau, and Skins, linked to the relevant setup flow. The existing game library is the seed, but each page must explain regional variants and the app's selected house rules.
4. **Borrowed audiences:** demonstrate a real round with local league organizers, golf-trip planners, club pros, and golf creators. Give them a group-specific template or demo rather than a generic ad.
5. **Repeatable releases:** each validated game format, trip feature, or new rule variant is a reason to re-engage groups. Use a small email list and the product's own website as channels the company controls. Paid acquisition waits until groups return organically.

The initial message should show the product doing one hard job: “Our foursome played Wolf with our rules; the app tracked every choice and showed exactly who owed whom.” Avoid claiming to be the first golf app with games.

## What to measure

Track at the **group** level, since golf is often played less frequently than weekly app habits:

- Setup completion and time from open to first saved hole.
- Median time to enter a hole and number of corrected holes.
- Completed rounds / started rounds, with drop-off by hole and game.
- Groups that begin a second round within their next 30–60 days of play.
- Invite-link opens, player participation, and groups started by an invited player.
- Payout disputes, data-loss incidents, support requests, and the rules that caused them.

North-star metric: **groups completing a second trusted round**. A download, waitlist signup, or random-game draw is useful only if it leads to this behavior.

## Business model hypothesis

Keep a useful core round free. Test a group or organizer subscription for saved templates, multi-round trips, leagues, and richer history after retention is demonstrated. Do not charge a fee per wager or settlement, and do not add fund transfers as a shortcut to revenue. Validate willingness to pay with organizers before building billing.

## Release gate: money-related policy

“We never touch the money” is an important product boundary, but it does **not** by itself settle legal or store-classification questions. Apple's [App Review Guideline 5.3](https://developer.apple.com/app-store/review/guidelines/) and Google Play's [real-money games policy](https://support.google.com/googleplay/android-developer/answer/9877032/) can apply to features that facilitate gambling or support wagers; Google specifically discusses companion functionality. Obtain qualified advice for intended markets and review the final product flows and language before public store submission or paid promotion. This gate affects distribution choice and feature scope; it is not a claim that the current prototype is unlawful.

## Next build sprint

1. Agree on the narrow beta promise and recruit the first five test groups.
2. Make a production data model with schema versioning, import/export, and arbitrary-hole correction.
3. Add course/tee/par/stroke-index entry and an offline-first save path.
4. Put a private HTTPS preview on phones and run a full on-course round with one group.
5. Record every confusing rule and payout; fix those before building shared live rounds.

The private beta is ready when it survives a real round, not merely when its screens look finished.
