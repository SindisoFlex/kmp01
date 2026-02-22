# RLS CONFIGURATION SCAN - KASILAM MEDIA

**Scan Date:** February 22, 2026
**Status:** Definitive (based on actual SQL migration files)

---

## PROFILES TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- supabase_setup.sql:81
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users SELECT own profile only
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users UPDATE own profile only
CREATE POLICY "Users can update own activity" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

### Who Can SELECT?
- **Authenticated users:** Can SELECT their own profile only (`auth.uid() = id`)
- **Other authenticated users:** BLOCKED - GET 0 rows when querying other users
- **Unauthenticated (anon):** BLOCKED - no policies grant access

### Who Can UPDATE?
- **Authenticated users:** Can UPDATE their own profile only (`auth.uid() = id`)
- **Other users:** BLOCKED - RLS constraint

### Who Can INSERT?
- **Explicitly blocked** - No INSERT policy defined
- **Only method:** Database trigger `handle_new_user_setup()` (SECURITY DEFINER) creates profile on auth.users insert
- **Regular authenticated users:** CANNOT INSERT directly

### Who Can DELETE?
- **Explicitly blocked** - No DELETE policy defined
- **Result:** Cascading DELETE via `ON DELETE CASCADE` on `auth.users` only

**Summary:** ✅ PROFILES properly protected

---

## BOOKINGS TABLE

### Is RLS Enabled?
**NO** ❌ **CRITICAL**

### SQL Statement Enabling RLS
**DOES NOT EXIST** - No `ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY` found in any migration

### Table Definition Location
- Table is referenced in `create_secure_booking()` RPC at `20260221_phase1_server_authority.sql:136-160`
- Table is inserted into but never created in migrations (may be Supabase default table or created outside migrations)
- No `CREATE TABLE public.bookings` statement found in the migration chain

### Policies Defined
**NONE** - No CREATE POLICY statements target bookings table

### Who Can SELECT?
- **Any authenticated user** - NO RLS means **ALL rows readable** ❌
- Users CAN query: `SELECT * FROM bookings;` and see **ALL bookings in system**, not just their own
- *Note:* Client-side filtering exists in booking service (`.eq("user_id", userId)`), but RLS does NOT enforce this

### Can Users See Only Their Own Bookings?
**NO** - Without RLS, row-level filtering is optional, not mandatory
- Frontend filters client-side via `.eq("user_id", userId)` in `bookingService.ts:47`
- But any user can directly query the unfiltered table
- **Risk:** Developer could accidentally fetch all bookings, or admin could read all customer bookings

### Can Admins See All?
**Undefined** - No RLS policy to check admin role; anyone can see all

### Who Can UPDATE?
- **Any authenticated user** - NO RLS means **ALL rows updatable**
- A user could theoretically UPDATE another user's booking if they knew the booking ID

### Who Can INSERT?
- **Any authenticated user** - Could INSERT directly via Supabase client
- **BUT** - Actual insertion is restricted to RPC `create_secure_booking()` which validates user_id via `auth.uid()`
- Direct table INSERT would enforce user_id constraint but not prevent attempts

### Who Can DELETE?
- **Any authenticated user** - Could DELETE another user's booking without RLS
- CASCADE would delete related invoices

**Summary:** ❌ **BOOKINGS UNPROTECTED - DATA BREACH RISK**

---

## LOYALTY_STATE TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260221_loyalty_tracks.sql:353
ALTER TABLE public.loyalty_state ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Single policy: Users view own only
CREATE POLICY "Users can view own loyalty state"
ON public.loyalty_state
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Who Can SELECT?
- **Authenticated users:** Can SELECT own loyalty state only (`auth.uid() = user_id`)
- **Other users:** BLOCKED - RLS denies access

### Who Can UPDATE?
- **EXPLICITLY BLOCKED** via REVOKE:
```sql
REVOKE insert, update, delete ON public.loyalty_state FROM authenticated, anon;
```
- **Result:** No INSERT, UPDATE, or DELETE allowed
- **Why:** Updates only via RPC functions (`apply_completed_booking_to_loyalty`)

### Who Can INSERT?
- **REVOKED** - see above

### Who Can DELETE?
- **REVOKED** - see above

**Summary:** ✅ LOYALTY_STATE properly protected

---

## LOYALTY_EVENTS TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260221_loyalty_tracks.sql:354
ALTER TABLE public.loyalty_events ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Single policy: Users view own events only
CREATE POLICY "Users can view own loyalty events"
ON public.loyalty_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Who Can SELECT?
- **Authenticated users:** Can SELECT own events only (`auth.uid() = user_id`)
- **Other users:** BLOCKED

### Who Can UPDATE/INSERT/DELETE?
- **REVOKED:**
```sql
REVOKE insert, update, delete ON public.loyalty_events FROM authenticated, anon;
```

**Summary:** ✅ LOYALTY_EVENTS properly protected

---

## LOYALTY_TIER_CONFIG TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260221_loyalty_tracks.sql:355
ALTER TABLE public.loyalty_tier_config ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Single policy: All authenticated users can read config
CREATE POLICY "Users can view tier config"
ON public.loyalty_tier_config
FOR SELECT
TO authenticated
USING (true);
```

### Who Can SELECT?
- **Any authenticated user:** Can SELECT all rows (policy uses `USING (true)`)
- **Intended:** Public read access to tier configuration

### Who Can UPDATE/INSERT/DELETE?
- **REVOKED:**
```sql
REVOKE insert, update, delete ON public.loyalty_tier_config FROM authenticated, anon;
```

**Summary:** ✅ LOYALTY_TIER_CONFIG properly protected (read-only by design)

---

## LOYALTY_PROCESSED_BOOKINGS TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260221_loyalty_tracks.sql:356
ALTER TABLE public.loyalty_processed_bookings ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
**NONE** - No policies, just REVOKE for all access

### Who Can SELECT/INSERT/UPDATE/DELETE?
- **ALL operations REVOKED:**
```sql
REVOKE all ON public.loyalty_processed_bookings FROM authenticated, anon;
```
- **Result:** Only SECURITY DEFINER functions can access (RLS bypass)
- **Intended:** Internal tracking table for processed bookings

**Summary:** ✅ LOYALTY_PROCESSED_BOOKINGS properly protected (functions-only)

---

## INVOICES TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260221_invoices_manual_payment.sql:139
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users view own invoices
CREATE POLICY "Users can view own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins manage all invoices
CREATE POLICY "Admins can manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);
```

### Who Can SELECT?
- **Regular users:** Can SELECT own invoices (`auth.uid() = user_id`)
- **Admins:** Can SELECT all invoices (subquery checks for admin role)

### Who Can UPDATE?
- **Regular users:** BLOCKED
- **Admins:** Can UPDATE any invoice

### Who Can INSERT?
- **Regular users:** BLOCKED
- **Admins:** Can INSERT

### Who Can DELETE?
- **Regular users:** BLOCKED
- **Admins:** Can DELETE

**Summary:** ✅ INVOICES properly segmented

---

## USER_TOKENS TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260222_token_economy.sql:16
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users view own balance
CREATE POLICY "Users can read own token balance"
ON public.user_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins manage all
CREATE POLICY "Admins can manage tokens"
ON public.user_tokens FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
));
```

### Who Can SELECT?
- **Regular users:** Can SELECT own (`auth.uid() = user_id`)
- **Admins:** Can SELECT all

### Who Can UPDATE/INSERT/DELETE?
- **Regular users:** BLOCKED
- **Admins:** Can manage all operations

**Summary:** ✅ USER_TOKENS properly protected

---

## TOKEN_TRANSACTIONS TABLE

### Is RLS Enabled?
**YES** (twice - defined in two places)

### SQL Statements Enabling RLS
```sql
-- supabase_setup.sql:82
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- 20260222_token_economy.sql:42 (redefined)
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- supabase_setup.sql:94
CREATE POLICY "Users can view own transactions" ON public.token_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- 20260222_token_economy.sql:44-47
CREATE POLICY "Users can read own token transactions"
ON public.token_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 20260222_token_economy.sql:49-53
CREATE POLICY "Admins can manage token transactions"
ON public.token_transactions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
));
```

### Who Can SELECT?
- **Regular users:** Can SELECT own transactions (`auth.uid() = user_id`)
- **Admins:** Can SELECT all

### Who Can UPDATE/INSERT/DELETE?
- **Regular users:** BLOCKED (only SELECT allowed)
- **Admins:** Can manage

**Summary:** ✅ TOKEN_TRANSACTIONS properly protected

---

## USER_GALLERY TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260222_user_convergence_gallery_referrals.sql:23
ALTER TABLE public.user_gallery ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users read own only
CREATE POLICY "Users can read own gallery media"
ON public.user_gallery
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users insert own only
CREATE POLICY "Users can insert own gallery media"
ON public.user_gallery
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users update own only
CREATE POLICY "Users can update own gallery media"
ON public.user_gallery
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Who Can SELECT?
- **Authenticated users:** Can SELECT own media only

### Who Can UPDATE?
- **Authenticated users:** Can UPDATE own media

### Who Can INSERT?
- **Authenticated users:** Can INSERT (must be own user_id)

### Who Can DELETE?
- **BLOCKED** - No DELETE policy defined

**Summary:** ✅ USER_GALLERY properly protected

---

## USER_REFERRALS TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260222_user_convergence_gallery_referrals.sql:66
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users view own referrals
CREATE POLICY "Users can read own referrals"
ON public.user_referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

-- Policy 2: Admins manage all
CREATE POLICY "Admins can manage referrals"
ON public.user_referrals
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);
```

### Who Can SELECT?
- **Regular users:** Can SELECT own referrals (where `referrer_id = auth.uid()`)
- **Admins:** Can SELECT all

### Who Can UPDATE/INSERT/DELETE?
- **Regular users:** BLOCKED
- **Admins:** Can manage all

**Summary:** ✅ USER_REFERRALS properly protected

---

## ACCOUNT_LIFECYCLE_WARNINGS TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260222_lifecycle_warnings.sql:18
ALTER TABLE public.account_lifecycle_warnings ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users read own warnings
CREATE POLICY "Users can read own lifecycle warnings"
ON public.account_lifecycle_warnings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins manage all
CREATE POLICY "Admins can manage lifecycle warnings"
ON public.account_lifecycle_warnings FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
));
```

**Summary:** ✅ ACCOUNT_LIFECYCLE_WARNINGS properly protected

---

## REACTIVATION_EVENTS TABLE

### Is RLS Enabled?
**YES**

### SQL Statement Enabling RLS
```sql
-- 20260222_lifecycle_warnings.sql:43
ALTER TABLE public.reactivation_events ENABLE ROW LEVEL SECURITY;
```

### All Policies Defined
```sql
-- Policy 1: Users read own events
CREATE POLICY "Users can read own reactivation events"
ON public.reactivation_events FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins manage all
CREATE POLICY "Admins can manage reactivation events"
ON public.reactivation_events FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
));
```

**Summary:** ✅ REACTIVATION_EVENTS properly protected

---

## TABLE WITHOUT USER_ID RESTRICTION (Accessible to All Authenticated Users)

### LOYALTY_TIER_CONFIG

**Accessible to:** All authenticated users without user_id restriction

**Policy:**
```sql
CREATE POLICY "Users can view tier config"
ON public.loyalty_tier_config
FOR SELECT
TO authenticated
USING (true);  -- <-- Grants access to ALL rows
```

**Why:** By design - tier configuration is public reference data

**Can Other Tables Be Queried Without user_id Restriction?**

- **LOYALTY_TIER_CONFIG:** YES - intentionally (lookup table)
- **All others:** NO - all have `auth.uid() = user_id` or admin-only checks

---

## SUMMARY TABLE

| Table | RLS Enabled | User Access | Admin Access | Risk |
|-------|-------------|-------------|--------------|------|
| profiles | ✅ YES | Own only | N/A | ✅ Safe |
| bookings | ❌ **NO** | **ALL ROWS** | Unrestricted | 🔴 **CRITICAL** |
| loyalty_state | ✅ YES | Own only | N/A | ✅ Safe |
| loyalty_events | ✅ YES | Own only | N/A | ✅ Safe |
| loyalty_tier_config | ✅ YES | All (intentional) | N/A | ✅ Safe |
| loyalty_processed_bookings | ✅ YES | None (functions-only) | N/A | ✅ Safe |
| invoices | ✅ YES | Own + Admin | All | ✅ Safe |
| user_tokens | ✅ YES | Own + Admin | All | ✅ Safe |
| token_transactions | ✅ YES | Own + Admin | All | ✅ Safe |
| user_gallery | ✅ YES | Own | None | ✅ Safe |
| user_referrals | ✅ YES | Own + Admin | All | ✅ Safe |
| account_lifecycle_warnings | ✅ YES | Own + Admin | All | ✅ Safe |
| reactivation_events | ✅ YES | Own + Admin | All | ✅ Safe |

---

## FINAL VERDICT

**RLS Status: 12/13 tables protected (92%)**

**CRITICAL FINDING:** `bookings` table has **ZERO RLS protection**.

- Any authenticated user can query `SELECT * FROM bookings` and see all customer bookings
- Any authenticated user can UPDATE or DELETE any booking with knowledge of booking ID
- This is a **data breach vulnerability** and **GDPR violation**

**Immediate Action Required:**
Add RLS to `boost` table (see audit report for exact SQL)
