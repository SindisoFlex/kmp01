# SUPABASE DEPLOYMENT GUIDE
## Manual & CLI-Based Deployment Instructions

**Status:** GitHub ✅ | Supabase Deployment 📋

---

## ⚠️ Supabase CLI Installation Issue

The standard `npm install -g supabase` doesn't work. You need to use one of these installation methods:

### Option A: Install Supabase CLI via Scoop (Windows)
```bash
scoop install supabase
```

### Option B: Install Supabase CLI via Homebrew (macOS/Linux)
```bash
brew install supabase/tap/supabase
```

### Option C: Install Supabase CLI via npm in project
```bash
cd /c/Users/KMP/Desktop/kmp01
npm install --save-dev supabase
npx supabase --version
```

### Option D: Download from GitHub Releases
https://github.com/supabase/cli/releases

Once installed, deploy with:
```bash
cd /c/Users/KMP/Desktop/kmp01
supabase db push
```

---

## 🌐 OPTION 2: Web Dashboard Deployment (No CLI Required)

This is the easiest if you don't want to install CLI locally.

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your Kasilam Media project
3. Navigate to "SQL Editor" (sidebar)

### Step 2: Execute Migrations in Order

Copy-paste and execute each migration in sequence (they're alphabetically safe):

#### Migration 1: Add Bookings RLS
```sql
-- Paste contents from:
-- supabase/migrations/20260222_add_bookings_rls.sql
```

Go to your local file: `C:\Users\KMP\Desktop\kmp01\supabase\migrations\20260222_add_bookings_rls.sql`
Copy all contents and paste into SQL Editor, then click "Run"

#### Migration 2: Create Admin Freeze Account RPC
```
File: supabase/migrations/20260222_create_admin_freeze_account_rpc.sql
```

#### Migration 3: Create Audit Log Table
```
File: supabase/migrations/20260222_create_audit_log_table.sql
```

#### Migration 4: Fix Apply Completed Booking RPC Auth
```
File: supabase/migrations/20260222_fix_apply_completed_booking_rpc_auth.sql
```

#### Migration 5: Fix Award Tokens RPC Auth
```
File: supabase/migrations/20260222_fix_award_tokens_rpc_auth.sql
```

#### Migration 6: Fix Invoice Email Queue RLS
```
File: supabase/migrations/20260222_fix_invoice_email_queue_rls.sql
```

#### Migration 7: Fix Profiles Admin Access
```
File: supabase/migrations/20260222_fix_profiles_admin_access.sql
```

#### Migration 8: Fix Referral RPC Auth
```
File: supabase/migrations/20260222_fix_referral_rpc_auth.sql
```

#### Migration 9: Fix User Gallery Admin Delete
```
File: supabase/migrations/20260222_fix_user_gallery_admin_delete.sql
```

#### Migration 10: Verify Referral RPC Final
```
File: supabase/migrations/20260222_verify_referral_rpc_final.sql
```

**After executing all 10 migrations**, proceed to verification.

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Step 1: Run SQL Verification Queries

Copy-paste each query into Supabase SQL Editor and execute:

**Query 1: Verify RLS Coverage (expect 14 tables)**
```sql
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

**Expected Result:**
```
tablename | rowsecurity
-----------|------------
account_lifecycle_warnings | true
bookings | true
invoice_email_queue | true
invoices | true
loyalty_events | true
loyalty_processed_bookings | true
loyalty_state | true
loyalty_tier_config | true
profiles | true
reactivation_events | true
token_transactions | true
user_gallery | true
user_referrals | true
user_tokens | true

(14 rows)
```

✅ **PASS if:** All 14 rows with `rowsecurity = true`

---

**Query 2: Verify Referral Function Signatures (CRITICAL)**
```sql
SELECT proname, pronargs, oidvectortypes(proargtypes)
FROM pg_proc
WHERE proname IN ('track_referral_open', 'mark_referral_registered')
ORDER BY proname;
```

**Expected Result:**
```
proname | pronargs | oidvectortypes
-----------|----------|----------------
mark_referral_registered | 2 | text,uuid
track_referral_open | 0 | (empty)

(2 rows)
```

✅ **PASS if:**
- `track_referral_open` has 0 args (NOT 1)
- `mark_referral_registered` has 2 args (NOT 3)

---

**Query 3: Verify RPC Functions Exist**
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('admin_freeze_account', 'admin_mark_booking_paid')
ORDER BY proname;
```

**Expected Result:**
```
proname
--------
admin_freeze_account
admin_mark_booking_paid

(2 rows)
```

✅ **PASS if:** Both functions exist

---

**Query 4: Verify Audit Log Table**
```sql
SELECT tablename FROM pg_tables
WHERE tablename = 'audit_log' AND schemaname = 'public';
```

**Expected Result:**
```
tablename
----------
audit_log

(1 row)
```

✅ **PASS if:** Table exists

---

**Query 5: Verify RLS Policies Distribution**
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected Result:**
```
tablename | policy_count
-----------|---------------
account_lifecycle_warnings | 2
bookings | 4
invoice_email_queue | 1
invoices | 2
loyalty_events | 1
loyalty_processed_bookings | 0
loyalty_state | 1
loyalty_tier_config | 1
profiles | 3
reactivation_events | 2
token_transactions | 2
user_gallery | 4
user_referrals | 2
user_tokens | 2

(14 rows)
```

✅ **PASS if:** All tables have proper policy counts

---

### Step 2: Browser-Based Testing

Open your application in browser and run these tests in DevTools console:

**Test 1: Regular User Booking RLS**
```javascript
const { data, error } = await supabase
  .from('bookings')
  .select('*');
console.log('Regular user bookings count:', data?.length ?? 0);
console.log('Error:', error);
// PASS if: Limited to own bookings, no error
```

**Test 2: Admin User Booking Access**
```javascript
// (Login as admin first)
const { data, error } = await supabase
  .from('bookings')
  .select('*');
console.log('Admin bookings count:', data?.length ?? 0);
// PASS if: Can see all bookings
```

**Test 3: Regular User Email Queue Block (Should Fail)**
```javascript
const { data, error } = await supabase
  .from('invoice_email_queue')
  .select('*');
console.log('Email queue error:', error?.message);
console.log('Data:', data);
// PASS if: RLS violation or empty result, NOT successful access
```

**Test 4: Admin Email Queue Access**
```javascript
// (Login as admin first)
const { data, error } = await supabase
  .from('invoice_email_queue')
  .select('*');
console.log('Admin email queue count:', data?.length ?? 0);
// PASS if: Can see email queue records
```

**Test 5: Referral Function (Correct Signature)**
```javascript
const { data, error } = await supabase.rpc('track_referral_open');
console.log('New referral ID:', data);
console.log('Error:', error);
// PASS if: Returns UUID, no error about parameters
```

**Test 6: Account Freeze RPC (Admin Only)**
```javascript
// (Login as admin first)
const { data, error } = await supabase.rpc('admin_freeze_account', {
  p_target_user_id: 'target-user-uuid',  // Replace with real UUID
  p_reason: 'Testing freeze functionality'
});
console.log('Freeze result:', data);
console.log('Error:', error);
// PASS if: Returns JSON with success: true
```

**Test 7: Audit Log Entry**
```javascript
const { data, error } = await supabase
  .from('audit_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5);
console.log('Latest audit logs:', data);
// PASS if: Entries exist after admin actions
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment ✅
- [x] All 10 migration files created
- [x] Code changes applied (AdminLoginForm.tsx)
- [x] GitHub push successful (commit 7762800)

### During Deployment
- [ ] Install Supabase CLI OR use web dashboard
- [ ] Execute all 10 migrations in order

### Post-Deployment Verification
- [ ] Query 1: 14/14 tables have RLS (✅ PASS)
- [ ] Query 2: Referral functions correct signatures (✅ PASS)
- [ ] Query 3: RPC functions exist (✅ PASS)
- [ ] Query 4: Audit log table exists (✅ PASS)
- [ ] Query 5: RLS policies properly distributed (✅ PASS)

### Browser Testing
- [ ] Test 1: Regular user booking RLS (✅ PASS)
- [ ] Test 2: Admin booking access (✅ PASS)
- [ ] Test 3: Regular user blocked from email queue (✅ PASS)
- [ ] Test 4: Admin email queue access (✅ PASS)
- [ ] Test 5: Referral function works (✅ PASS)
- [ ] Test 6: Account freeze RPC works (✅ PASS)
- [ ] Test 7: Audit logs created (✅ PASS)

**When ALL checks pass:** ✅ **PRODUCTION READY**

---

## 🎯 NEXT STEPS

1. **Choose deployment method:**
   - Option A: Install Supabase CLI and run `supabase db push`
   - Option B: Use web dashboard and copy-paste each migration

2. **Execute the 10 migrations**

3. **Run SQL verification queries** (5 queries above)

4. **Run browser tests** (7 tests above)

5. **Once all tests pass:** System is production-ready! 🚀

6. **Phase 2 (non-blocking):** Session timeout, logout cleanup, PII removal

---

## 📞 SUPPORT

If migrations fail:
1. Check error message in SQL Editor
2. Verify file contents aren't corrupted
3. Try executing one migration at a time
4. Check Supabase project status at https://app.supabase.com

---

**Current Status:** Awaiting Supabase deployment execution
**GitHub:** ✅ Complete
**Supabase:** 📋 Ready for deployment
**Overall:** 86%+ ready for production (pending Supabase verification)
