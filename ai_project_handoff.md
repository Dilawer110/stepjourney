# StepJourney — Project Handoff

Last updated: **1 October 2026**  
Owner: **Dilawer Hussain, RSM Central**  
Previous application baseline: **`1356f88e632bb68346be5e910163b67ca793be29`**

This is the single project handoff. Read this document and `supabase/ROLE_ACCESS.md` before continuing development. Distinguish deployed features from planned work below; a working screen or successful build does not prove that its data is saved or synchronized.

## 1. Purpose and current status

StepJourney is a mobile-first field-sales application for FMCG teams. It supports planned outlet visits (PJP), orders and invoices, returns, merchandising surveys, CRM, outlet registration, assessments, and printable sales reports. The intended experience is quick one-handed use in areas with unreliable connectivity.

The web app is deployed, its PWA files are live, and the owner confirmed that the sideloaded Android APK launches successfully. Individual logins and database-enforced territory access are deployed. **Dependable end-to-end offline sales capture and cross-device synchronization are not complete. Do not describe the application as production-ready until the remaining data-integrity work is verified.**

| Resource | Location / identity |
|---|---|
| Repository | https://github.com/Dilawer110/stepjourney |
| Web app | https://dilawer110.github.io/stepjourney/ |
| Login | https://dilawer110.github.io/stepjourney/login/ |
| Supabase project | `nutnroslzccocspawbvd`, displayed as **StepRoute** |
| Supabase URL | https://nutnroslzccocspawbvd.supabase.co |
| Android package ID | **`io.github.dilawer110.stepjourney`** |
| Deployment branch | `main` |
| Last verified application deployment | https://github.com/Dilawer110/stepjourney/actions/runs/36549836053 |

No passwords, private signing material, service-role keys, or credential lists belong in this public repository or handoff.

## 2. Architecture and constraints

The current locked stack is Next.js **14.2.5**, React **18.3.1**, TypeScript **5.5.4**, Tailwind **3.4.7**, and `@supabase/supabase-js` **2.45.0**. These are installed versions, not a recommendation to retain outdated dependencies. Dependency upgrades are pending.

`next.config.js` uses `output: 'export'`, `basePath: '/stepjourney'`, `assetPrefix: '/stepjourney/'`, `trailingSlash: true`, and unoptimized images. `npm run build` generates `out/`; there is no separate `next export` step. GitHub Pages serves static files, so Next.js server routes, server secrets, and server middleware are not available at runtime. Privileged operations belong in a properly authenticated backend, such as a Supabase Edge Function.

```text
Android APK / browser
  -> GitHub Pages: static Next.js app
       -> AccessGate -> Supabase Auth + user_access + password-change RPC
       -> scoped Supabase Data API -> Postgres RLS
       -> userStorage -> per-user, per-assignment browser caches
       -> service worker -> public app shell/static resources only
```

Preserve these product constraints:

- Keep the app lightweight. Prefer existing React/TypeScript and native browser APIs over heavy PDF, screenshot, or state-management packages.
- Preserve `calcOrder` in `app/order/page.tsx` unless a mathematical defect is demonstrated. Add regression examples before changing financial calculations. Existing tax/discount constants are application behavior, not independently validated tax advice.
- Preserve fast mobile workflows and the Slate, Navy/Blue, Emerald, and Indigo design. Use native print CSS for invoice and report PDFs.
- Use `lib/user-storage.ts` for business caches; do not reintroduce shared unscoped `localStorage` access.
- Preserve unsynced records during upgrades, sign-out, assignment changes, and error recovery. Never silently delete a user's field data.
- Treat local-first durable saving and background sync as the target architecture. Current code does not consistently meet that target.
- UI filters are not an authorization boundary. Supabase RLS must remain authoritative.

## 3. Completed work and evidence

| Change | Deployed result | Reference |
|---|---|---|
| Sunday access | Removed the full-screen Sunday day-off block; Sunday routes can be selected | `d336bdb76fcf8f272afee9931a230a49bcc25b5b` |
| Real header filters | Distributor and booker names load from master data; bookers depend on selected distributor; seven route days supported; paginated reads | `4affc7a57870487a8501920ace652bcdab45ed49` |
| Planning assignments | Restored `outlet_visit_schedule` and imported source assignments; restored missing booker master rows | `supabase/header_filters.sql` and seed preparation script |
| PWA | Manifest, description, icons, registration, static-resource caching, and offline fallback | `b18807fd3c5465dc0dba6c68240ddfbfa015b0ba` |
| Android install | Owner resolved package collision by using `io.github.dilawer110.stepjourney`, then confirmed app running | Owner's device confirmation; no physical-device automation performed |
| Roles and individual logins | 55 accounts, first-login password change, RLS by territory, account display/sign-out, isolated caches | `1356f88e632bb68346be5e910163b67ca793be29` |
| Visit correctness | Removed immediate recursive retries; allowed returned/revisit statuses; visit uniqueness includes actor | Same role-access release |

The planning import was verified at **12,767 assignments**, **12,406 unique scheduled outlets**, **47 booker master records**, and **7 distributors**. These are dated import counts, not live promises. There are 46 worker logins because a vacant booker position did not receive an account. A vacant TSE position also remains without credentials. Do not delete master-data rows just because a position is vacant.

## 4. Users, roles, and authorization

The owner described four distinct roles. All use the same field tools; their data scope differs.

| UI role | Stored role | Accounts created | Scope / login convention |
|---|---|---:|---|
| Super Admin — RSM Central | `super_admin` | 1 | Dilawer Hussain only; login `RSM001`; all outlet territories |
| Admin — ASM | `asm` | 2 | Assigned zone; existing ASM code |
| Supervisor — TSE | `tse` | 6 | Assigned distributor; `TSE` + distributor code, e.g. `TSED0002` |
| Worker — Order Booker | `worker` | 46 | Own booker assignments and own recorded activity; existing OB code |

The two ASM assignments in the source data are Hunain Ali (`ASM001`, Lahore) and Sajwala Ali (`ASM011`, Gujranwala). Preserve names as recorded unless the owner supplies a correction.

### Login and first use

1. Enter the employee-code login ID and initial password. IDs are normalized to lowercase; passwords are case-sensitive.
2. Internally, code logins map to `<lowercase-id>@login.stepjourney.invalid`. These are non-deliverable login aliases, not staff email inboxes.
3. `AccessGate` checks the authenticated user's active `user_access` row and calls `needs_password_change()`.
4. A new account is routed to `/account` and must choose a password of at least 12 characters. Business data is denied in the database until the initial password hash changes.
5. The app then shows the person's name/role and scoped filter options. Account and Sign out controls are available.

The owner received a **private local credential document**, `StepJourney-private-logins.md`, outside the repository. Do not commit it, repeat the entire credential list in development logs, or distribute it to other users. The initial-password scheme uses a distinct prefix followed by the employee code. Do not replace it with one shared predictable password.

### Database security implementation

- `public.user_access` is the authorization source: user UUID, unique lowercase login ID, display name, role, one applicable assignment field, active flag, and access version.
- A partial unique index permits only one Super Admin. Scope constraints distinguish a zone-bound ASM, distributor-bound TSE, and booker-bound worker.
- Browser clients can read only their own `user_access` record and cannot edit assignments or elevate their role.
- Editable Auth `user_metadata` and legacy `profiles.role` do **not** grant authorization. `profiles` retains compatible values for existing foreign keys.
- Private `app_private` functions bind every lookup to `auth.uid()` and resolve allowed bookers, distributors, and outlet UUIDs. Their fixed search paths and restricted grants are intentional.
- Master/planning tables are scoped read-only to application clients; catalogs are shared read-only among active users who completed the initial password change.
- Orders, visits, and returns are scoped by allowed outlet. Workers additionally read only their own activity. Transaction writes remain tied to the current actor even for managers: an ASM does not impersonate a booker to save a visit.
- Outlet assets may be read/inserted/updated only for allowed outlets. Legacy `routes` has own-user/Super-Admin access; current journey planning uses `pjp_routes` and `outlet_visit_schedule`.
- Transactions with a missing/unmapped outlet do not automatically qualify for access; investigate orphan records explicitly when implementing reporting.
- Anonymous access to business tables was removed. The former shared test account has no authorized business scope; it is not a default staff login.
- `app_private.initial_passwords` contains initial password-hash snapshots, not plaintext. Browser roles have no table privileges/policies. This deliberate denial produces an informational advisor notice.

See `supabase/role_access.sql` and `supabase/ROLE_ACCESS.md`. The SQL file describes the combined change; **do not blindly rerun it** against production. Existing policies/constraints already exist and the script is not a general idempotent migration runner.

Production changes were applied in two migrations: `prepare_role_access_accounts`, followed by `enforce_role_scoped_business_access`. Accounts were created through the Auth Admin API between those steps, with initial password snapshots populated before enforcement. The temporary `provision-staff-once` Edge Function was replaced with a disabled response and JWT verification enabled; it is not an active account-management API.

For new accounts/resets, keep the account inactive during setup, use the Auth Admin API server-side, create/update its compatible profile and authoritative access row, initialize the password snapshot, then activate. Increment `access_version` for assignment changes. Never reset an unrelated existing account merely because a name matches. Real email recovery, a secure user-management screen, reset auditing, and a defined offboarding workflow remain to be built.

## 5. Code and data map

| File / area | Responsibility |
|---|---|
| `app/layout.tsx` | Metadata, fonts, AccessGate wrapper, PWA registration |
| `components/AccessGate.tsx` | Authentication/access check, initial password gate, account header, sign-out |
| `app/login/page.tsx`, `app/account/page.tsx` | Code/email login and password change |
| `app/page.tsx` | PJP dashboard, dependent filters, paginated reads, cached selection, visit status |
| `components/OutletCard.tsx` | Outlet action buttons and status menu |
| `app/order/page.tsx` | Hardcoded catalog, cart, `calcOrder`, local invoice storage |
| `app/return/page.tsx` | Return entry; persistence contract still needs repair |
| `app/brand-positioning/page.tsx` | Merchandising/stock form and local survey payload |
| `app/add-outlet/page.tsx` | Outlet registration form/draft; incomplete backend/photo flow |
| `app/crm/page.tsx` | Complaint/CRM form and local records |
| `app/competitor-intelligence/page.tsx` | Active eight-step CIR, per-user local drafts and reports; no database sync |
| `app/sales-officer-assessment/page.tsx` | Assessment form and local records |
| `app/outlet/page.tsx` | Additional outlet-detail screen; inspect before extending overlapping workflows |
| `app/report/page.tsx`, `app/export/page.tsx` | Current user's device-saved daily orders, summary, bulk print/share |
| `components/PrintInvoice.tsx` | Native print/PDF invoice rendering |
| `lib/supabase.ts`, `lib/types.ts`, `lib/geo.ts` | Supabase client, domain types, geolocation helpers |
| `lib/user-storage.ts` | Required account/assignment namespace for business cache reads/writes |
| `public/manifest.webmanifest`, `public/sw.js`, `public/offline.html` | Installation metadata and public-resource caching |
| `components/PwaRegistration.tsx` | Production-only service-worker registration |
| `scripts/` | Focused pagination, PWA, storage, and SQL access checks; icon/seed utilities |
| `supabase/` | Planning and authorization SQL plus role documentation |
| `supabase_master_data.sql` | Historical import source; inspect and use scoped additive changes, not wholesale replay |

Relevant live tables at the last inspections:

- Identity: `profiles`, `user_access`, private `initial_passwords`.
- Planning: `distributors`, `app_users`, `pjp_routes`, `outlet_visit_schedule`, `outlets`, legacy `routes`.
- Catalog: `products`, `channels`, `discount_slabs`.
- Transactions: `orders`, `sales_returns`, `outlet_visits`, `outlet_assets`.

Booker/distributor **codes** are text master-data keys. Auth/profile IDs and outlet IDs are **UUIDs**. Do not put an OB code into an `order_booker_id` UUID column. `outlet_visit_schedule.store_code` joins `outlets.code`; its `order_booker_code` joins `app_users.order_booker_code`. Authorization derives a distributor from the booker and a zone from `distributors.zone`, rather than trusting free-text client fields.

The planning table's primary key is `(store_code, pjp_code, day, order_booker_code)`. Visits are now unique on `(outlet_id, order_booker_id, visit_date)`. Preserve that exact conflict target in all visit upserts.

## 6. Current field workflow

### Dashboard and visits

After access verification, load permitted distributors, bookers, and planning routes. Changing distributor resets the booker selection. Changing day previews that weekday's route; it does not change the date of a newly recorded visit. Sunday is a normal selectable planning day.

Queries use deterministic ordering and pages of 200 to avoid Supabase row-cap truncation. Assignments are joined to outlets and deduplicated for display; multiple routes receive a combined/count label. Current-day visits supply the latest visible status per outlet. Managers see activity permitted by RLS; status data is not historical activity for the selected preview weekday. Clarify actor/date filtering further when implementing manager reporting, especially for outlets with multiple bookers.

A status action records the signed-in actor. Returned and revisit-required statuses are accepted. On failure, the dashboard reloads saved status rather than retrying immediately forever. A durable offline visit queue with bounded retry is still missing.

### Orders, returns, and reports

The order screen computes offers, slab discounts, taxes, and invoice output. Its daily invoices remain local; creating an invoice does not yet reliably insert a full cloud order. Errors during local saving can still be swallowed. Returns have a known payload/schema mismatch and can report success without persistence.

Reports and bulk export read the signed-in user's device-saved daily orders. **An ASM/Super Admin does not yet get a consolidated cross-device team sales report just because the role can read scoped database data.** That requires real transaction sync and reporting work.

The End Day button currently displays a success/sync message but does not implement a freeze, reconciliation, or queue flush. Treat this as a placeholder, not a completed business operation.

## 7. Offline storage and PWA behavior

Business keys such as `todayOutlets`, `orders_YYYY-MM-DD`, survey/form keys, and drafts are accessed through `userStorage`. The effective prefix contains `stepjourney-v2`, user UUID, and a signature of role, assignment fields, and `access_version`. Reads without a storage identity fail. Changes of user or assignment select a different namespace.

Older shared records are preserved on their original device but are not automatically assigned to new users. A future import must identify ownership, validate payloads, preview what will move, and preserve a backup; never expose old shared records to every new account.

Offline behavior has defined limits:

- Opening a new app session requires an online authorization check.
- A previously verified running session can navigate with available cached data while offline; a cold offline start is not fully supported by AccessGate.
- Offline data already on a device cannot be instantly revoked by a database role change. New server requests use current RLS, and the app rechecks on navigation/reconnect; stronger offline revocation/expiry needs a product decision.
- `todayOutlets` reflects the last loaded filter selection, potentially a route preview. Do not assume it always means the complete current-day plan.
- JSON validation, storage quota handling, durable retries, and schema migration of cached records are incomplete.

The service worker currently uses `stepjourney-static-v2`. It precaches the fallback page, manifest, and icons; navigation is network-first with cached HTML/fallback; Next static assets are cache-first. Supabase requests, mutations, other origins, and Next RSC requests are excluded. It does not implement business-data synchronization. Unvisited pages are not guaranteed to work offline. Activation waits for older clients to close; do not assume every open tab receives a release immediately. Google-hosted font/icon dependencies still warrant offline device testing.

## 8. Android packaging and updates

Use PWABuilder to package the deployed web app. The owner distributes the **APK directly through WhatsApp**, not through Google Play. An AAB is a store-upload artifact, not the normal sideload file.

Keep the package ID **`io.github.dilawer110.stepjourney`** and preserve the original signing key/password for future APK updates. The earlier generic `io.github.dilawer110.twa` package conflicted with an existing package on the owner's phone; the specific package ID resolved installation. Do not recommend uninstalling an existing app before checking its local data and signing/package identity.

Web-only changes normally arrive from the hosted app after refresh/reopening online. A new APK is needed for native-wrapper/package changes. Verify app-link/Digital Asset Links configuration separately if trusted fullscreen behavior is incomplete; successful APK launch alone does not prove domain verification. Never publish private keystores or signing passwords.

## 9. Known remaining issues

The original 27 September audit described broader problems, several of which are now fixed. Use this updated list rather than treating the entire original audit as current.

| Priority | Issue still open | Required outcome |
|---|---|---|
| P0 | Orders can show success despite a failed local write; no full cloud-order sync; incomplete identity fields | Durable identified local save before success, explicit errors, idempotent cloud persistence |
| P0 | Return payload uses fields absent from `sales_returns`; errors ignored; no reliable local queue | One tested schema/payload contract, local-first return save, accurate status |
| P0 | Forms target `new_outlets`, `crm_cases`, `sales_officer_assessment`, absent at the last schema review | Decide schemas or adapt to existing tables; add scoped RLS and tested sync |
| P0 | End Day claims to sync/freeze without doing it | Honest pending/synced state; real reconciliation and idempotent day close |
| P1 | Duplicate `decodeURIComponent` on already-decoded query parameters in order/return | Fix `%`, `&`, Urdu/Unicode, and encoded-name cases without changing calculations |
| P1 | Local weekday and UTC date keys disagree around Pakistan midnight | One business-date helper and explicit historical-date behavior |
| P1 | Local parsing/quota errors and orphaned legacy caches | Validated versioned payloads and a recoverable migration/export flow |
| P1 | No full visit/form retry queue | Bounded retries, durable errors, deduplication, recovery after restart |
| P1 | Separate hardcoded catalogs; audit found 55 app SKUs versus 48 database SKUs | Reconcile prices/offers and use one versioned cached catalog |
| P1 | Camera toggles are not full photo capture; `outlet-photos` bucket absent at last review | Capture/compress/store pending images, private scoped upload/read policies, visible failures |
| P1 | Dependency audit previously flagged Next/PostCSS/xlsx issues | Fresh audit, supported upgrades, regression checks against static-export use |
| P2 | Manager reports, account management, recovery, offboarding | Secure scoped workflows with audit trail; no frontend administrative secrets |
| P2 | Large outlet lists and main-thread JSON writes not device-benchmarked | Measure before choosing pagination/windowing/storage changes |

Supabase's last advisor check also reported [leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). The private password-snapshot table's RLS-without-policy notice is intentional. Neither a clean advisor nor a scanner proves the app is production-ready. TestSprite was not available during the original audit and was not used; do not claim a TestSprite scan.

## 10. Recommended build plan and acceptance criteria

### Phase A — reliable orders and returns (next recommended development task)

Define a shared record envelope: client-generated immutable UUID, schema version, authenticated actor UUID, outlet UUID, business date, created/updated timestamps, payload, and sync state. Keep existing invoice calculation/print payloads compatible and preserve a transaction-time product/price snapshot. Treat identifiers supplied by clients as untrusted and enforce ownership/scope in the database.

Implement states such as draft, saved locally, pending sync, synced, and action required. Persist successfully before displaying success. Use a server uniqueness key for idempotency so retries do not duplicate invoices. The return schema must be reconciled before enabling sync; do not merely suppress database errors.

Acceptance: save offline, reload, reconnect, retry twice, and get exactly one server record; simulate quota failure, expired session, rejected RLS write, and invalid payload without false success or data loss. Another worker cannot read or edit it. The authorized TSE/ASM can read it after sync. Changing user must not flush a previous user's queue using the new identity.

### Phase B — remaining forms and photos

Inventory each form's real payload; choose dedicated tables or an explicit shared schema, add migrations and policies, and reuse the tested queue. Build camera/file handling with bounded image size and durable pending media. Storage policies must mirror outlet/actor access; avoid public buckets for private field images.

Acceptance: each form survives offline save/restart, reaches the expected server table exactly once, and reports rejected uploads without discarding the form. Verify cross-user media isolation and deletion/retention expectations.

### Phase C — supervisor reports and End Day

Build server-backed scoped transaction queries and aggregate reporting. Expose zone/distributor/booker/date filters only within authorization scope. Separate local pending totals from confirmed server totals. Define whether reopening an ended day is allowed and who can approve it before implementing a lock.

Acceptance: worker totals reconcile with TSE/ASM views after sync; no cross-territory rows appear; day close identifies unsynced/failed records and never reports success while dropping them. Repeated close requests must be idempotent.

### Phase D — account operations and stronger offline behavior

Build a Super-Admin-only management backend/UI for provisioning, assignment changes, deactivation, and resets, with an audit trail. Keep server keys off the static frontend. Decide real email recovery, offline authorization expiry, device reassignment, and safe handling of unsynced records after a territory change.

Acceptance: no user can alter their own role through request tampering; deactivation blocks new server reads/writes; password resets enforce a new first-login change; reassignment preserves recoverable local records without exposing them in the new scope.

### Phase E — release hardening

Fix name decoding and business dates, reconcile catalogs, upgrade vulnerable dependencies, expand targeted regression checks, and measure on an inexpensive Android phone using real route sizes. Verify fresh/returning login, all role scopes, Sunday, airplane-mode behavior, restart/reconnect, Android back navigation, and print/export. Record measured startup/search/save behavior and error results rather than asserting that there are no possible defects.

## 11. Development and deployment workflow

1. Inspect remote `main`, local Git status, existing instructions, relevant page code, SQL history, and current schema. Some previous changes were committed through GitHub APIs; an existing local checkout may have an older HEAD despite newer working files. Do not reset or overwrite work blindly.
2. Select one concrete workflow and acceptance test from the plan. Document schema/payload expectations before implementation.
3. Develop locally using the lockfile and the repository's current environment configuration. Do not print or commit secrets.
4. For database changes, inspect existing policies/grants first and create a narrowly scoped migration. Prefer staging/test isolation. Coordinate DB/client rollout so neither account access nor pending field records are stranded.
5. Run focused checks, validate the relevant role boundaries, and inspect the diff for secrets and accidental generated files.
6. Commit/publish the intended changes. In this project, a push to `main` triggers GitHub Pages deployment. Do not claim deployment success until the workflow finishes successfully and the live behavior is checked.
7. Update this handoff and `supabase/ROLE_ACCESS.md` when behavior or operations change. Record what was actually tested and what remains unverified.

Typical local commands from the repository root:

```bash
npm ci
npx tsc --noEmit --incremental false
node scripts/test-header-pagination.cjs
node scripts/test-user-storage.cjs
node scripts/test-pwa.cjs
npm run build
```

For development use `npm run dev` and the `/stepjourney/` path. For exported previews, serve `out/` at that same URL base path. `next start` is not the appropriate production server for this static export.

GitHub Actions (`.github/workflows/deploy.yml`) uses Node 20, installs via `npm ci`, runs the build, uploads `out`, and deploys Pages. Build-time variables are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, supplied by repository secrets. These variables contain public client configuration only; never place a service-role key in a `NEXT_PUBLIC_` variable. Current CI builds/deploys; the standalone Node/SQL checks above are not automatically wired into that workflow.

A previous Windows local build failed with `spawn EPERM`; TypeScript and the GitHub Linux production build passed. Treat that as a local process-permission limitation, not proof of a code defect or a reason to skip deployment verification.

## 12. Verification record and limits

For application baseline `1356f88e632bb68346be5e910163b67ca793be29`:

- TypeScript and the focused storage/PWA checks passed; pagination checks passed with the earlier filter release.
- `scripts/test-role-access.sql` verified all 55 identities, initial-password denial, expected booker counts, no self-promotion, rejection of cross-scope reads/writes, no ownership reassignment, metadata spoofing resistance, and shared-test/anonymous denial. All test mutations rolled back.
- Real Auth/Data API login tests passed for one representative of each role, including own-access visibility and the initial password gate. Those test sessions were signed out afterward; staff passwords were not changed.
- GitHub production build/deploy succeeded and the new Login ID screen was observed live.
- End-to-end first-password-change UI, all sales submissions, device offline recovery, load/concurrency, and mobile performance were not exhaustively tested. SQL access checks are not a substitute for these workflows.

The SQL test script uses existing provisioned accounts and assumes their initial-password snapshots still match. **After staff change passwords, adapt the test to dedicated fixtures in an isolated test environment; do not reset real staff passwords to make the test pass.** It also references the historical shared test account. Preserve rollback semantics and review it before running against any live database.

Owner-local artifacts include the private credential list, `StepJourney-access-verification.md`, and the earlier `StepJourney-readiness-audit.md`/dependency audit. They are not repository dependencies. The earlier audit is historical; its Sunday, filter, permissive-RLS, retry-loop, and missing-PWA findings have since been addressed as described here.

## 13. CIR replacement and legacy cleanup — 1 October 2026

### Identity and active implementation

The owner calls this Customer Intelligence Report (CIR); the implemented UI and route retain the existing Competitor Intelligence terminology. These refer to the same feature in this cleanup, not two independent modules.

The active implementation is the eight-step form in `app/competitor-intelligence/page.tsx`, imported from the owner's separate local `outlet-visit-app` project. Its steps are Product, Pricing, Commercial, Stock, Displays, POSM, Contracts, and Evidence. It replaces the old four-field screen at the SAME `/competitor-intelligence/` route. `components/OutletCard.tsx` now has one direct CIR icon with a non-empty-draft indicator; the duplicate old More-menu entry is removed. Other outlet actions remain intact.

The separate source folder is `C:/Users/13162/Downloads/Compressed/outlet-visit-app-project/outlet-visit-app`. Its original files and localhost:3010 browser data were preserved. That folder is not the deployment checkout. Continue development in the canonical StepJourney repository; do not overwrite its authentication or scope protections from the older source project.

### Actual database state and completed removal

- Supabase project: `nutnroslzccocspawbvd`.
- Removed `public.competitor_surveys` via migration `retire_legacy_cir`. It contained **zero rows**, so no legacy report records or duplicate legacy rows were present to delete.
- Catalog inspection found no inbound foreign keys, dependent application views, or function references. Removal used an exclusive lock, an empty-table assertion, timeouts, and **DROP ... RESTRICT**, not CASCADE. Only that table and its own policies/index/constraints/type were removed.
- The old form's target `public.competitor_intelligence` did not exist. Its obsolete insert and dated-cache writer have been removed from active code.
- `cir_reports`, `cir_entries`, `cir_photos`, and `competitor_brands` also **do not exist** in the live database. Their definitions in the separate local project's SQL were proposals, not evidence of deployment. Do not run its broad setup/sync scripts: they include unrelated permissive access policies.
- All 15 remaining public tables retain identical row counts and sorted row-content hashes across removal. Other public/app_private columns, constraints, policies, and function definitions also matched before and after.
- Remaining public tables: `app_users`, `channels`, `discount_slabs`, `distributors`, `orders`, `outlet_assets`, `outlet_visit_schedule`, `outlet_visits`, `outlets`, `pjp_routes`, `products`, `profiles`, `routes`, `sales_returns`, `user_access`. Private `app_private.initial_passwords` remains unchanged.
- Removed legacy table creation/RLS references from `supabase/schema.sql` and `supabase/role_access.sql`. Historical migration history is retained for audit; never replay old deployment scripts blindly.

### Current storage and workflow

Use an outlet's direct CIR icon, add one or more competitor SKUs, complete the eight steps, choose Done, then Submit Final Report. Final confirmation accurately says **Saved on this device**. It does not claim server synchronization.

The integrated form uses `userStorage` with existing account/assignment isolation. Logical keys are `cir_master_brands`, `cir_draft_<outlet UUID>`, and `cir_reports_submitted`. The historical field named `outlet_code` currently holds the outlet UUID from the route's `id` parameter; reconcile this naming before implementing a server schema. Opening the route without an outlet is preview-only and cannot submit.

Draft hydration completes before autosave, malformed cached data produces an error instead of being overwritten, storage failures are visible, and repeated submit calls use a stable report UUID. The old source project's unscoped `cir_*` caches are left untouched and are not silently imported into another user's account. A deliberate authenticated import is needed if those preview records must be transferred.

`lib/legacy-cir-cleanup.ts` removes only exact dated `comp_intel_YYYY-MM-DD` keys (including old per-user namespaces) after an online authorized access check. It never clears all browser storage and preserves new CIR drafts/reports/brands, orders, and sessions. Offline devices or unopened browser profiles receive this cleanup only when they next run the updated app and pass that check; remote cleanup of every device cannot be claimed.

### Verification and remaining work

Database post-checks confirmed the legacy relations are absent and unrelated data/schema are unchanged. Targeted tests exercise exact cache deletion, idempotency, and preservation of current records; existing user-isolation tests and TypeScript checking passed. Supabase advisors retain only the previously known leaked-password-protection warning and intentionally inaccessible private password-snapshot table notice.

Database synchronization, cross-device report history, scoped CIR server tables/RLS, an idempotent queue, and durable photo uploads remain **unimplemented**. Preserve the current local records when adding those features. This cleanup does not certify those future workflows or the whole application as production-ready.
