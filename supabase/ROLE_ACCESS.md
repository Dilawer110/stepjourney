# Role access

Authoritative roles and assignments are stored in `public.user_access` and are writable only by server administration. Auth user metadata and `profiles.role` do not grant access. There is a unique index allowing only one Super Admin.

- Super Admin: all outlet data.
- ASM: distributors in the assigned zone.
- TSE: the assigned distributor.
- Worker: the assigned booker’s planning records and their own activity.

All four roles keep the same field tools. Transactional writes are recorded as the authenticated user and must target an allowed outlet. Catalogs are shared read-only. Territory planning and role assignments cannot be modified by browser clients.

Accounts use lowercase employee IDs mapped to `ID@login.stepjourney.invalid` internally. These are login aliases, not deliverable email addresses. No invitations are sent. Recovery requires server-side administrator assistance until real email addresses are configured.

The private `initial_passwords` table stores only a snapshot of the Auth password hash. Until the user changes their initial password, database functions deny business access. The client routes them to Account. No password, signing key, or service-role key belongs in this repository.

`role_access.sql` describes the full schema and policies. Production was applied in two migrations: `prepare_role_access_accounts`, then `enforce_role_scoped_business_access`. Between them, accounts were provisioned with the Auth Admin API and their initial hashes copied server-side. The one-time provisioning function was replaced with a disabled response after creation.

Before adding an account, use the Auth Admin API, create its compatible `profiles` row, then create its `user_access` assignment. Populate `app_private.initial_passwords` from the new Auth row to enforce initial password change. For a reset, replace that snapshot after resetting the password. Keep the account inactive during setup/reset and reactivate only after the snapshot is ready. Increment access_version when changing assignments to invalidate old app caches. Never change or reset another account merely because a matching name exists.

Client caches are namespaced by user and access assignment. Legacy shared records are preserved on the device but not automatically assigned to new accounts. Authorization must be verified online when opening a new app session. After verification, navigation within that running session can use existing offline caches. Database policies enforce current assignments on every server request.

This change does not add cross-device synchronization for the app’s existing local-only forms and order reports. Reports still use the signed-in user’s device-saved orders. Existing unsupported form backends remain separate work.

Validation: `node scripts/test-user-storage.cjs`, `node scripts/test-pwa.cjs`, TypeScript, and `scripts/test-role-access.sql` (privileged SQL tooling; all test mutations roll back).

