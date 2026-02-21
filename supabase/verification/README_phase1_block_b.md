# Phase 1 Block B: Backend Verification Runbook

Date target: **Sunday, February 22, 2026 (EOD)**

## Purpose
Validate that Phase 1 hardening is truly active in the backend:
- Pricing is server-owned (`create_secure_booking` with no client `base_price`).
- Loyalty updates are server-driven and synced to `profiles.membership_tier`.
- RLS/policies and core data integrity are in place.

## Prerequisite
Apply migrations first (including `supabase/migrations/20260221_phase1_server_authority.sql`).

## Execute
1. Open Supabase SQL Editor for your project.
2. Run: `supabase/verification/phase1_block_b_checklist.sql`
3. Review the first result set (`check_results`).

## Pass Criteria
- **No rows with `status = 'FAIL'`.**

## If Any Check Fails
1. `rpc_create_secure_booking_new_signature` FAIL:
   - Phase 1 migration not applied or wrong environment.
2. `rpc_create_secure_booking_old_signature_removed` FAIL:
   - Old vulnerable RPC still callable; re-apply migration.
3. `rpc_apply_completed_booking_syncs_profile_membership_tier` FAIL:
   - Loyalty/profile sync regression in function body.
4. `rls_enabled_*` FAIL:
   - Enable RLS for flagged table and re-check policies.
5. `data_completed_bookings_unprocessed` FAIL:
   - Backfill by calling `apply_completed_booking_to_loyalty` for missing completed bookings.
6. `data_profile_loyalty_tier_sync_drift` FAIL:
   - Run a one-time sync update from `loyalty_state` to `profiles.membership_tier`.

## Output to Capture for Sign-off
- Screenshot/export of `check_results` with all PASS.
- Any remediation SQL executed.
- Timestamp and environment name.
