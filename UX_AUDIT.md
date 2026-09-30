# Round Settled UI/UX audit

Updated: September 29, 2026  
Methods: Impeccable technical review, UI/UX Pro Max design-system guidance, responsive inspection at 320 px, 390 px and 1440 px, source review, contrast measurement, accessibility-tree review and production-build evidence.

## Audit health score

| Dimension | Score | Current state |
|---|---:|---|
| Accessibility | 4/4 | Essential phone text now has a 16 px floor, contrast failures are corrected, account-mode controls expose state and skip navigation reaches the main content. |
| Performance | 3/4 | The reviewed pages produce no browser errors and the production first load is 176 kB. The main app is still concentrated in one large client module. |
| Responsive design | 4/4 | Public flows have no horizontal overflow at 320 px or 390 px, inputs avoid iOS zoom, legal pages are phone-first and controls honor safe areas. |
| Theming | 2/4 | Round Settled has primitive, semantic and component tokens, but the stylesheet still contains repeated direct color values. The intentional light theme suits outdoor use. |
| Implementation integrity | 4/4 | The interface remains product-specific, consistent and aligned with the clubhouse scorebook direction. |
| **Total** | **17/20** | **Strong beta foundation. Offline launch and conflict recovery are the next priorities.** |

## Design direction

Round Settled has a recognizable visual system, real golf-specific workflows, consistent Lucide icons, large score controls, clear saved/live states and product language tailored to golfers. UI/UX Pro Max suggested a vibrant gaming treatment during a broad pattern search; that does not fit Round Settled's users or on-course setting. The established clubhouse scorebook direction remains the product standard.

## Completed in this release

- Raised the global reading size to 15 px and the phone body size to 16 px while preserving compact nonessential golf metadata.
- Corrected low-contrast signup fine print and scorecard table headings.
- Added a keyboard-visible skip link and a focusable main-content target.
- Replaced the incomplete auth tab pattern with a simple two-button mode switch using `aria-pressed`.
- Added a public privacy policy describing the data Round Settled actually uses, group sharing, course-location search, storage, retention and current beta rights.
- Added a public responsible-play guide and surfaced the current national helpline on signup and in Help.
- Added permanent privacy and responsible-play links to signup, the home footer, Profile settings and Help.
- Added phone-first recovery for weak service: Round Settled restores an unsynced local scorecard, keeps it ahead of an older server copy, retries when the connection returns and clears the device copy at sign-out.
- Added hashed, expiring, single-use password-reset and email-verification links with an SMTP adapter ready for Hostinger mail.
- Added a public support form that records every request even when email delivery is unavailable.
- Added self-service account deletion with current-password confirmation, deliberate typed confirmation, sign-out cleanup and anonymous retention of shared score records.
- Updated the privacy policy to match the live deletion behavior and added support links throughout public and account surfaces.
- Verified the recovery and support screens at a 390 × 844 phone viewport with no visible clipping.

## Remaining priorities

### P1 — Finish the installable offline shell and conflict handling

**Location:** `app/page.tsx`

Round Settled now restores the last local snapshot, preserves unsynced edits, retries automatically when connectivity returns and explains when changes are only on the phone. The browser still needs a service worker to launch from a cold offline start, and shared-round conflicts need a dedicated review screen.

**Next change:** Add an app-shell service worker, show the last successful sync time and give captains a clear comparison screen when the server and phone both changed.

### P2 — Give primary screens real URLs and phone-back behavior

**Location:** `app/page.tsx`

Primary screens live in React state. Refreshing or using the browser back gesture does not preserve ordinary screens such as Groups, Games, Profile or Help.

**Next change:** Move primary screens to routes or synchronize them with history state while preserving invitation URLs and active-round recovery.

### P2 — Split the main client bundle by feature

**Location:** `app/page.tsx`

The production build reports a 174 kB first load. The single client module contains home, setup, live scoring, history, profile, groups and modal orchestration.

**Next change:** Lazy-load Groups, Trips, Help, Pricing and recap tools while keeping scoring immediately available.

### P3 — Continue consolidating visual tokens

**Location:** `app/globals.css`

The token foundation is sound, but direct colors and repeated surface values remain. Consolidate these as related components are touched; a wholesale rewrite is not needed before friend testing.

## Recommended build order

1. Installable offline shell, last-sync time and sync-conflict handling.
2. Real routes and reliable browser-back behavior.
3. Privacy-conscious beta feedback and error reporting.
4. Stableford and Quota after the testing foundation is dependable.
5. Lazy-load secondary features and continue token cleanup.

## Verification

- ESLint passes.
- TypeScript passes.
- All 94 automated tests pass, including local recovery, legacy-cache compatibility and sign-out cleanup.
- The production build passes and includes `/forgot-password`, `/reset-password`, `/verify-email`, `/support`, `/privacy`, and `/responsible-play`.
- The new phone layouts have no visible clipping or horizontal overflow.
- The reviewed browser console contains no warnings or errors.

## Audit limits

The live visual inspection covered public registration, recovery, support, privacy and responsible-play pages. Signed-in account deletion and verification status were reviewed from implementation and production-build evidence because no disposable test account was available in the audit browser. Add a seeded staging account to the beta process so signed-in screens can be visually regression-tested without touching a real golfer's records.
