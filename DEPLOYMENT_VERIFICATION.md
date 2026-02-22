# DEPLOYMENT VERIFICATION GUIDE
## Quick Reference for Launch

**Last Updated:** February 22, 2026

---

## STEP 1: Deploy Migrations

```bash
# From project root
supabase db push
```

---

## STEP 2: Verify Database Changes

Run these SQL queries in Supabase SQL Editor to verify fixes:

### Check 1: RLS on All Tables
```sql
-- Should show 14 tables, all with rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_catalog.pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'bookings', 'invoices', 'user_tokens',
    'token_transactions', 'user_referrals', 'loyalty_state',
    'loyalty_events', 'loyalty_tier_config', 'loyalty_processed_bookings',
    'account_lifecycle_warnings', 'reactivation_events', 'user_gallery',
    'invoice_email_queue'
  )
ORDER BY tablename;
```

**Expected:** 14 rows, all with `rowsecurity = true`

### Check 2: Referral Function Signatures (CRITICAL)
```sql
-- Should show track_referral_open with 0 args (NOT 1)
-- Should show mark_referral_registered with 2 args (NOT 3)
SELECT proname, pronargs, oidvectortypes(proargtypes)
FROM pg_proc
WHERE proname IN ('track_referral_open', 'mark_referral_registered')
ORDER BY proname;
```

**Expected:**
```
            proname            | pronargs |         oidvectortypes
--------------------------------+----------+--------------------------------
 mark_referral_registered       |        2 | text,uuid
 track_referral_open            |        0 |
(2 rows)
```

### Check 3: Admin Freeze Account RPC Exists
```sql
SELECT proname, pronargs
FROM pg_proc
WHERE proname = 'admin_freeze_account';
```

**Expected:** 1 row with `pronargs = 2`

### Check 4: Audit Log Table Exists
```sql
SELECT tablename
FROM pg_tables
WHERE tablename = 'audit_log' AND schemaname = 'public';
```

**Expected:** 1 row (table exists)

### Check 5: Invoice Email Queue RLS Status
```sql
SELECT tablename, rowsecurity
FROM pg_catalog.pg_tables
WHERE tablename = 'invoice_email_queue';
```

**Expected:** `rowsecurity = true`

### Check 6: Count of RLS Policies
```sql
-- Should show policies for all protected tables
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected:** Multiple policies per table; especially:
- `bookings` should have 4 policies (user SELECT/INSERT/UPDATE + admin ALL)
- `profiles` should have 3 policies (including new admin policy)
- `invoice_email_queue` should have 1 policy (admin only)
- `user_gallery` should have 4 policies (including new DELETE)

---

## STEP 3: Test Critical Flows

### Test 3A: Booking RLS (Users can't see others' bookings)

```javascript
// In browser console, logged in as regular user:
const { data, error } = await supabase
  .from('bookings')
  .select('*');

// Expected: Only YOUR bookings are returned
// If you see other users' bookings: RLS FAILED
```

### Test 3B: Booking RLS (Admins can see all)

```javascript
// Logged in as admin user:
const { data, error } = await supabase
  .from('bookings')
  .select('*');

// Expected: ALL bookings returned
// If you see error/empty: Admin policy failed
```

### Test 3C: Email Queue Access (Users blocked)

```javascript
// Logged in as regular user:
const { data, error } = await supabase
  .from('invoice_email_queue')
  .select('*');

// Expected: Error - "new row violates row-level security"
// or empty result. If you see email records: RLS FAILED
```

### Test 3D: Email Queue Access (Admins only)

```javascript
// Logged in as admin user:
const { data, error } = await supabase
  .from('invoice_email_queue')
  .select('*');

// Expected: Returns email queue records
// If you see error: Admin policy failed
```

### Test 3E: Referral Function Calls

```javascript
// Test track_referral_open with CORRECT signature (no params)
const { data: referralId, error } = await supabase
  .rpc('track_referral_open');  // NO parameters

// Expected: Returns UUID
// If it succeeds with parameters: old signature is still active (BAD)
```

### Test 3F: Gallery Deletion (Admin only)

```javascript
// Logged in as admin:
const { error } = await supabase
  .from('user_gallery')
  .delete()
  .eq('id', 'some-gallery-id');

// Expected: Deletion succeeds
// If error: Admin DELETE policy failed
```

### Test 3G: Profile Admin Access

```javascript
// Logged in as admin:
// Should be able to read other users' profiles
const { data: otherProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'some-other-user-id')
  .single();

// Expected: Profile data returned
// If error: Admin policy failed
```

### Test 3H: Account Freeze RPC

```javascript
// Logged in as admin:
const { data, error } = await supabase
  .rpc('admin_freeze_account', {
    p_target_user_id: 'target-user-uuid',
    p_reason: 'Testing freeze functionality'
  });

// Expected: Returns JSON with success=true
// If error about admin role: RPC auth check failed
// If error about self: Self-prevention failed
```

---

## STEP 4: Verify Audit Logging

```javascript
// After an admin performs an action:
const { data: auditLog } = await supabase
  .from('audit_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);

console.log('Recent audit log entries:', auditLog);

// Expected: Should see new entries for actions taken
// Entries should have: actor_user_id, action, table_name, created_at
```

---

## STEP 5: Verify Frontend Compliance

### Check: Referral Service Updated (If exists)

Search codebase for:
```typescript
// OLD (should NOT exist)
rpc('track_referral_open', { p_referrer_id: userId })

// NEW (should exist instead)
rpc('track_referral_open', {})
```

### Check: No Hardcoded Credentials

Search for:
```typescript
// Should NOT find:
admin@example.com
adminpass
Demo admin credentials
```

---

## STEP 6: Production Readiness Checklist

- [ ] All migrations deployed (`supabase db push` completed)
- [ ] Check 1: RLS enabled on 14/14 tables ✓
- [ ] Check 2: Referral functions have correct signatures ✓
- [ ] Check 3: admin_freeze_account RPC exists ✓
- [ ] Check 4: audit_log table exists ✓
- [ ] Check 5: invoice_email_queue has RLS ✓
- [ ] Check 6: Policies properly configured ✓
- [ ] Test 3A: User booking RLS works ✓
- [ ] Test 3B: Admin booking access works ✓
- [ ] Test 3C: User blocked from email queue ✓
- [ ] Test 3D: Admin can see email queue ✓
- [ ] Test 3E: Referral function works ✓
- [ ] Test 3F: Admin gallery delete works ✓
- [ ] Test 3G: Admin profile access works ✓
- [ ] Test 3H: Account freeze RPC works ✓
- [ ] Test 3I: Audit logs are created ✓
- [ ] Frontend referral calls updated (if applicable) ✓
- [ ] No hardcoded credentials in code ✓

**Once all checks pass:** Ready for production deployment ✅

---

## TROUBLESHOOTING

### Problem: Referral functions still accept UUID parameter
**Solution:** Run verification migration manually:
```sql
DROP FUNCTION IF EXISTS public.track_referral_open(uuid);
DROP FUNCTION IF EXISTS public.mark_referral_registered(uuid, text, uuid);
-- Then rerun migration 20260222_verify_referral_rpc_final.sql
```

### Problem: RLS not enabled on a table
**Solution:** Table may not have been created yet. Run:
```sql
-- For each table without RLS:
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;
```

### Problem: Users can see other users' data
**Solution:** Check policies are correct:
```sql
-- View all policies on a table:
SELECT * FROM pg_policies WHERE tablename = '[table_name]';
-- Check USING and WITH CHECK clauses properly reference auth.uid()
```

### Problem: Admins can't access data they should
**Solution:** Verify admin policy exists and admin role is set:
```sql
-- Check if user has admin role:
SELECT role FROM public.profiles WHERE id = 'target-user-uuid';
-- Should return 'admin'
```

---

## POST-DEPLOYMENT (NEXT SPRINT)

These aren't blocking but should be implemented soon:

1. **Session Timeout** (2 hours)
   - Add 15-minute inactivity logout
   - File: src/contexts/AuthContext.tsx

2. **Logout Cleanup** (30 min)
   - Clear React Query cache and localStorage on logout
   - File: src/services/authService.ts

3. **Remove PII from Logs** (1 hour)
   - Audit console.log statements for user IDs, amounts, emails

---

**Once verification checklist complete: READY FOR PRODUCTION** ✅
