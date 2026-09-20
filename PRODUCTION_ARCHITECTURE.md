# Loop production architecture

## Selected stack

- **Application:** Next.js, React and TypeScript running as a Node.js application
- **Hosting:** Hostinger Business Web Hosting
- **Database:** Hostinger MariaDB/MySQL
- **Source control and deployment:** private GitHub repository connected to Hostinger
- **Local/offline data:** IndexedDB-backed queue for the active round
- **Course data:** OpenGolfAPI with attribution, cached snapshots and manual correction
- **Native path:** Capacitor after web-beta validation

The browser never connects directly to MariaDB. Database credentials exist only in Hostinger environment variables. Clients call versioned HTTPS endpoints, and the server authorizes every request.

## Hostinger constraints and response

Hostinger Business supports Node.js and a local MySQL-compatible database. A small reusable connection pool keeps the app below connection limits and avoids connection setup on every request.

Incoming WebSocket connections are not supported on managed Web/Cloud hosting. The private beta will use efficient incremental polling:

- Active scorekeeper saves immediately and updates optimistically.
- Other phones request only changes after their last known round revision every 3–5 seconds.
- Responses use revision numbers and ETags so unchanged polls are small.
- Polling pauses when the page is backgrounded and resumes on focus.
- A Hostinger VPS or external realtime transport can replace polling later without changing the API contracts.

## Trust invariants

1. Monetary values are stored and calculated as integer cents.
2. The server recalculates balances from canonical scores and decisions; client totals are never authoritative.
3. Every completed game's balances sum to exactly zero.
4. Hole saves carry an idempotency key so retries cannot duplicate an action.
5. Hole updates require the expected prior revision; conflicting edits are returned rather than overwritten.
6. Every accepted hole update creates an append-only revision record.
7. The course, tee, handicaps, players and rules used for a round are stored as snapshots.
8. Changing a saved House Rule never alters an earlier round.
9. Guest links store only a hash of the secret token and can expire or be revoked.
10. Logs and analytics exclude player names, wager values, balances and invite tokens.

## Initial data model

### Identity and groups

- `users`: account identity and status
- `sessions`: hashed session tokens, expiry and last activity
- `groups`: owner and group settings
- `group_members`: role and membership
- `players`: permanent or guest golfer identity within a group
- `round_invites`: hashed guest token, scope, expiry and use count

### Golf data

- `courses`: provider identity and location
- `course_tees`: rating, slope, gender, yardage, pars and stroke indexes
- `rounds`: group, status, course snapshot, hole count and current revision
- `round_players`: ordered player snapshots and handicap values
- `round_games`: game key, rules version and configuration snapshot
- `hole_results`: current canonical result for each hole
- `hole_revisions`: append-only history of every accepted hole change
- `round_outcomes`: immutable calculated ledger when the round closes
- `settlement_items`: who owes whom and reversible paid status

### Reuse and planning

- `house_rules`: versioned saved configurations
- `trips`, `trip_members` and `trip_rounds`: multi-round planning and standings

## API shape

- `POST /api/v1/rounds` — create a draft round
- `POST /api/v1/rounds/:id/invites` — create a scoped invite
- `GET /api/v1/rounds/:id?afterRevision=n` — fetch a snapshot or incremental changes
- `PUT /api/v1/rounds/:id/holes/:hole` — idempotent, conflict-safe save
- `POST /api/v1/rounds/:id/complete` — validate and create immutable outcome
- `POST /api/v1/rounds/:id/reopen` — captain-only audited correction
- `GET /api/v1/rounds/:id/export` — portable scorecard data

All mutating endpoints require an authenticated user session or a scoped guest-round session. Rate limits apply by session, round and IP.

## Offline save flow

1. Validate the score and hole decision on the phone.
2. Write the command to IndexedDB with a random idempotency key.
3. Update the local round view.
4. Send the command when online.
5. Remove it from the queue only after the server returns the accepted revision.
6. If the expected revision is stale, show both versions and require a captain decision.

The local browser cache is a resilience layer, not the permanent source of truth.

## Security baseline

- HTTPS only, secure and HTTP-only session cookies, CSRF protection and strict same-site defaults
- Passwords hashed with a memory-hard algorithm; password reset tokens hashed and short-lived
- Database user limited to the Loop database and required privileges
- Parameterized queries through the database layer
- Input validation at every HTTP boundary
- Security headers, request-size limits and rate limiting
- Daily database backups and tested restore instructions
- Account export and deletion workflows before public launch
- Dependency, audit-log and error monitoring without financial details in telemetry

## Delivery phases

### Foundation

- Convert static export to Hostinger Node.js runtime
- Add environment validation, database connection pooling and repeatable migrations
- Add health checks and production-safe logging
- Create the private GitHub deployment repository

### Private single-captain beta

- Persist accounts, groups, House Rules, courses and rounds
- Add edit/undo and complete hole history
- Add offline queue and recovery
- Validate five priority engines against paper examples

### Shared-round beta

- Guest invite links and QR codes
- Incremental polling and role-based editing
- Conflict-safe score entry
- Shared live scorecard and final recap

### Public web release

- Privacy/support/account controls
- Production monitoring and restore drill
- Group subscription and Trip Pass experiment
- Approved score-export integrations

### Native release

- Package the validated product with Capacitor
- Add background sync, push, camera import and native sharing
- Complete store-policy and market-specific legal review
