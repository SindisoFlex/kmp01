# PRODUCTION READINESS AUDIT: USER SYSTEM
## Kasilam Media — CTO-Level Assessment
**Audit Date:** February 22, 2026
**Scope:** Full user system, authentication, authorization, RLS, data ownership
**Verdict:** NOT PRODUCTION READY — Critical security gaps must be remediated before launch

---

## WHERE WE ARE

### Current State Summary

Kasilam Media has a **hybrid-strength user system**: excellent backend security practices with **severe frontend/RLS exposure gaps**.

**What Works:**
- ✅ Server-side pricing authority (RPC SECURITY DEFINER pattern implemented correctly)
- ✅ Loyalty system properly audited and synced via stored procedures
- ✅ Token economy with transactional integrity
- ✅ Most sensitive tables have RLS enabled
- ✅ Password hashing via Supabase auth (bcrypt)
- ✅ Admin operations protected via role checks in RPC functions
- ✅ ON DELETE CASCADE relationships maintain referential integrity

**What's Broken:**
- ❌ **CRITICAL:** No RLS on `profiles` table — all authenticated users can read ALL user profiles
- ❌ **CRITICAL:** No RLS on `bookings` table — all authenticated users can enumerate all bookings
- ❌ **CRITICAL:** `reactivate_frozen_account()` RPC unprotected — any user can unfreeze ANY frozen account
- ❌ **CRITICAL:** `updateMembershipTier()` is client-side only — users can claim any tier in memory
- ❌ **HIGH:** Race condition in profile creation via retry loop (arbitrary 800ms delays)
- ❌ **HIGH:** No audit logging on sensitive operations (admin actions, account changes)
- ❌ **HIGH:** No session timeout — relying on Supabase token defaults
- ❌ **HIGH:** Guest user implementation creates front-end-only users with broken state
- ❌ **MEDIUM:** Field name mismatches (`avatar` ↔ `profilePic`)
- ❌ **MEDIUM:** Auth logic scattered across 5+ files with duplicate checks
- ❌ **MEDIUM:** No input validation on RPC array parameters

### Completeness Assessment

| Component | Completion | Status |
|-----------|-----------|--------|
| Signup Flow | 85% | Works but race condition risk |
| Login Flow | 80% | Works but no session timeout |
| Logout | 95% | Simple implementation, no issues |
| Profile Management | 60% | Missing validation, no RLS |
| Password Reset | 0% | NOT IMPLEMENTED |
| Email Verification | 75% | Supabase handles, but no token re-send |
| Role-Based Access | 70% | Frontend guards + RPC checks, but incomplete RLS |
| Booking Ownership | 50% | Client-side filtering only, no RLS |
| Audit Logging | 0% | NOT IMPLEMENTED |
| Session Management | 40% | Auth state tracking only, no timeout |
| **OVERALL** | **62%** | **Not production ready** |

---

## SECURITY SCORES

**Out of 10 (10 = production-grade security)**

| Category | Score | Reasoning |
|----------|-------|-----------|
| **Authentication** | 7/10 | Signup/login works, but no session timeout or audit trail. Missing password reset flow. |
| **Authorization** | 5/10 | Mixed: RPCs hardened with role checks, but frontend RoleGuard alone insufficient. Missing RLS on core tables. |
| **Data Protection** | 3/10 | **CRITICAL:** Missing RLS on profiles and bookings. Any authenticated user can read all data. |
| **Input Validation** | 6/10 | RPC functions validate most inputs, but array parameters (extras[]) lack null checks. |
| **Session Security** | 4/10 | No timeout, no explicit token revocation, guest users create inconsistent state. |
| **Audit/Compliance** | 2/10 | No audit logs. Cannot trace who changed what. Regulatory liability. |
| **OVERALL SECURITY** | **4/10** | **CRITICAL GAPS. Not safe for production.** |

---

## ARCHITECTURE SCORES

**Out of 10 (10 = enterprise-grade)**

| Category | Score | Reasoning |
|----------|-------|-----------|
| **Modularity** | 5/10 | Auth logic scattered. 4 different login functions. RoleGuard duplicates role checks. |
| **Reusability** | 6/10 | Custom hooks (useAuth) exist but inconsistently used. No middleware layer. |
| **Consistency** | 4/10 | `.select("*")` vs selective fields. `.single()` vs `.maybeSingle()` used inconsistently. Field naming mismatches (avatar/profilePic). |
| **Coupling** | 5/10 | Tight: services call services, components directly query Supabase. No abstraction layer. |
| **Error Handling** | 3/10 | Scattered try-catch blocks. Generic error messages. No centralized error handler. |
| **Testing** | 1/10 | No visible unit/integration tests for auth flows, RLS, or race conditions. |
| **OVERALL ARCHITECTURE** | **4/10** | **Needs refactoring before production.** |

---

## PRODUCTION READINESS SCORES

**Out of 10 (10 = deployed to production safely)**

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Uptime Readiness** | 6/10 | No obvious crashes, but race conditions could cause errors under load. |
| **Data Integrity** | 4/10 | Missing RLS means accidental data breaches. No validation on bulk updates. |
| **Regulatory Compliance** | 2/10 | No audit logs. GDPR/compliance violations. |
| **Load Handling** | 5/10 | RPC bottlenecks possible with no rate limiting. Retry loops could cascade. |
| **Recovery** | 6/10 | Cascading deletes in place. Backups assumed via Supabase. |
| **Security Incidents** | 1/10 | No audit trail to detect breaches. No rate limiting on login. |
| **OVERALL PRODUCTION READINESS** | **4/10** | **DO NOT DEPLOY.** |

---

## SCALABILITY & MAINTAINABILITY

| Category | Score | Reasoning |
|----------|-------|-----------|
| **Scalability** | 6/10 | RPC pattern scales well. But missing RLS will become audit nightmare at scale. |
| **Maintainability** | 3/10 | Auth logic scattered across authService, AuthContext, 3 login forms. Future devs will miss edge cases. Field mismatches (avatar/profilePic) create confusion. |
| **Documentation** | 3/10 | No inline docs on auth flows, RLS policies, or role requirements. |
| **Testability** | 2/10 | Tight Supabase coupling makes unit tests hard. No visible test suite. |

---

## CRITICAL FIXES (MUST DO BEFORE PRODUCTION)

### Issue #1: CRITICAL — Missing RLS on `profiles` Table

**Severity:** CRITICAL — Data Breach Risk
**Location:** `supabase_setup.sql:6` enables RLS but creates no policies
**Impact:** Any authenticated user can `SELECT * FROM profiles` and read all user emails, names, phone numbers, bios

**Current Code (Broken):**
```sql
-- supabase_setup.sql:6
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- No CREATE POLICY statements for profiles!
```

**Fix:**
```sql
-- Add to supabase/migrations/[timestamp]_profiles_rls.sql

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
```

**Why This Matters:**
Launching with no RLS on profiles = GDPR violation. Users can enumerate all customers, see email addresses, personal info.

---

### Issue #2: CRITICAL — Missing RLS on `bookings` Table

**Severity:** CRITICAL — Business Logic Breach
**Location:** `bookingService.ts:47` filters client-side, no RLS backup
**Impact:** Any authenticated user can query all bookings (past, present, future) even if not their own

**Current Code (Broken):**
```typescript
// src/services/bookingService.ts:47-49
const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .eq("user_id", userId);  // CLIENT-SIDE FILTER ONLY
```

**Why This Matters:**
- Users can see pricing history of competitors
- Users can access invoices/amounts for other bookings
- No RLS = filter is optional, not enforced

**Fix:**
```sql
-- Add to migrations/[timestamp]_bookings_rls.sql

CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (
  (SELECT lower(role) FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
```

---

### Issue #3: CRITICAL — Unprotected `reactivate_frozen_account()` RPC

**Severity:** CRITICAL — Account Takeover Risk
**Location:** `supabase/migrations/20260222_lifecycle_warnings.sql:115-153`
**Impact:** Any authenticated user can unfreeze any frozen account (including admin accounts)

**Current Code (Broken):**
```sql
-- 20260222_lifecycle_warnings.sql:145-153
CREATE OR REPLACE FUNCTION public.reactivate_frozen_account(p_target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  -- NO ROLE CHECK — CRITICAL BUG
  UPDATE public.profiles
  SET account_status = 'active'
  WHERE id = p_target_user_id;  -- ANY ACCOUNT
  -- ...
END;
$$;
```

**Called From:**
```typescript
// src/services/accountLifecycleService.ts:23-30
export const reactivateAccount = async (userId: string) => {
  const result = await supabase.rpc("reactivate_frozen_account", {
    p_target_user_id: userId,  // Can be ANY user_id
  });
  // ...
};
```

**Attack Scenario:**
1. Admin freezes malicious user account
2. Malicious user calls `reactivateAccount(admin_user_id)` via frontend
3. Admin account unfrozen, malicious user gains access

**Fix:**
```sql
-- Add role check at top of function
DECLARE
  v_actor_role text;
BEGIN
  -- Required: Caller must be admin
  SELECT lower(role) INTO v_actor_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_actor_role <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can reactivate accounts';
  END IF;

  -- Then proceed with update...
```

---

### Issue #4: HIGH — No Session Timeout

**Severity:** HIGH — Shared Computer Risk
**Location:** `src/contexts/AuthContext.tsx` (missing timeout logic)
**Impact:** Tokens live indefinitely (or until Supabase default expires). Shared/public computers retain access.

**Current Code (Broken):**
```typescript
// AuthContext.tsx:64-88
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session) {
        // Token accepted, but no max-age check
        refreshUser();
      }
    },
  );
  return () => subscription.unsubscribe();
}, []);
```

**Fix: Add explicit timeout:**
```typescript
const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
      logoutUser(); // Auto-logout after inactivity
      toast.error("Session expired. Please log in again.");
    }
  }, 60000); // Check every minute
  return () => clearInterval(interval);
}, [lastActivityTime]);

// Track activity
useEffect(() => {
  const handleActivity = () => setLastActivityTime(Date.now());
  window.addEventListener("mousemove", handleActivity);
  window.addEventListener("keypress", handleActivity);
  return () => {
    window.removeEventListener("mousemove", handleActivity);
    window.removeEventListener("keypress", handleActivity);
  };
}, []);
```

---

### Issue #5: HIGH — Race Condition in Profile Creation

**Severity:** HIGH — Inconsistent State Under Load
**Location:** `src/services/authService.ts:55-76`
**Impact:** Rapid signup requests can create duplicate partial profiles

**Current Code (Broken):**
```typescript
// authService.ts:55-76
for (let i = 0; i < 10; i++) {
  try {
    const newProfile = await supabase.from("profiles").insert([...]);
    return newProfile.data?.[0];
  } catch (createError) {
    if (i < 9) {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Dumb retry
    }
  }
}
return null; // Silent failure
```

**Why This Fails:**
- Two simultaneous requests both pass auth
- Both try INSERT, second conflicts with UNIQUE constraint
- Retry loop wastes 8 seconds
- If second succeeds but is delayed, both exist briefly (race condition)

**Fix: Use UPSERT:**
```typescript
const { data, error } = await supabase
  .from("profiles")
  .upsert(
    {
      id: user.id,
      email: user.email,
      name: data.name || "",
      role: "client",
      created_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  )
  .select()
  .single();

if (error) throw error;
return data;
```

**Or use database trigger:** Trigger auto-creates profile on `auth.users` INSERT, eliminating race condition entirely.

---

### Issue #6: HIGH — No Audit Logging on Admin Operations

**Severity:** HIGH — Compliance & Breach Detection Failure
**Location:** Missing entirely (affects `admin_mark_booking_paid`, `reactivate_frozen_account`, profile updates)
**Impact:** Cannot detect unauthorized changes, no compliance trail

**Required Fix:**
```sql
-- Create audit table
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS: Only admins can view
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Log all admin actions
INSERT INTO audit_log (actor_user_id, action, table_name, record_id, new_values)
VALUES (auth.uid(), 'mark_booking_paid', 'bookings', p_booking_id, ...);
```

---

### Issue #7: HIGH — `updateMembershipTier()` is Client-Side Only

**Severity:** HIGH — Users Can Falsely Claim Higher Tier
**Location:** `src/contexts/AuthContext.tsx:165-170`
**Impact:** Users can trigger tier benefits in UI without actual loyalty score

**Current Code (Broken):**
```typescript
// AuthContext.tsx:165-170
const updateMembershipTier = useCallback((tier: string) => {
  setUser((prev) =>
    prev
      ? { ...prev, membership_tier: tier }
      : null
  );
  // TODO: "In production, sync this to Supabase 'profiles' table"
  // NEVER SYNCED!
}, []);
```

**Why This Matters:**
- User sets tier to "vip" in memory
- UI shows VIP discounts
- When booking is created, server uses actual tier from DB (free tier prices)
- User sees discount applied but is charged full price
- Chargeback/dispute risk

**Mitigation (Already in Place):**
```sql
-- create_secure_booking() ignores client tier:
SELECT base_price INTO v_base_price
FROM public.loyalty_tier_config
WHERE tier = (
  SELECT membership_tier FROM public.profiles WHERE id = auth.uid()
);
-- Uses DB truth, not client claim
```

**But Still Fix This:**
```typescript
const updateMembershipTierServer = async (tier: string) => {
  const { error } = await supabase
    .from("profiles")
    .update({ membership_tier: tier })
    .eq("id", user!.id);

  if (error) throw error;

  setUser((prev) =>
    prev ? { ...prev, membership_tier: tier } : null
  );
};
```

---

## WHAT MUST BE DONE BEFORE PRODUCTION

**Blocking Issues (Stop Everything):**

- [ ] Add RLS policy to `profiles` table (users can only view own)
- [ ] Add RLS policy to `bookings` table (users can only view own)
- [ ] Add role check to `reactivate_frozen_account()` RPC — add admin-only guard
- [ ] Add role check to `admin_mark_booking_paid()` RPC — verify call is admin
- [ ] Implement session timeout (15-minute inactivity logout)
- [ ] Create `audit_log` table and log all admin actions
- [ ] Fix profile creation race condition (use UPSERT or database trigger)
- [ ] Fix guest user implementation (either remove or persist properly)
- [ ] Add input validation to RPC functions (null checks on array parameters like `p_extras`)

**High Priority (Fix This Week):**

- [ ] Add password reset flow (currently missing entirely)
- [ ] Add email verification token re-send endpoint
- [ ] Add rate limiting on login attempts (prevent brute force)
- [ ] Consolidate authentication logic (4 login functions → 1)
- [ ] Add comprehensive error logging (centralized handler)
- [ ] Fix field name mapping issues (`avatar` ↔ `profilePic`)
- [ ] Remove or fix guest user implementation
- [ ] Add unit tests for auth flows

**Medium Priority (Before Launch):**

- [ ] Remove admin/staff roles from client dashboard access
- [ ] Add CSRF protection if serving from same origin
- [ ] Implement role-based dashboard redirects
- [ ] Add phone number verification (optional but recommended)
- [ ] Document RLS policies for future developers

---

## NICE-TO-HAVE IMPROVEMENTS

**Security Enhancements:**
- [ ] Two-factor authentication (TOTP)
- [ ] IP-based anomaly detection on login
- [ ] Device fingerprinting to flag suspicious sessions
- [ ] Email notifications on sensitive account changes
- [ ] Login attempt logging (track failed attempts per user)

**User Experience:**
- [ ] "Remember device" option (with security token)
- [ ] Single sign-on (Google, Apple, custom SAML)
- [ ] Social login linking (attach multiple auth providers to one account)
- [ ] Account recovery codes (for lost 2FA device)

**Operations:**
- [ ] Admin dashboard showing active sessions per user
- [ ] Ability to force-logout a user from admin panel
- [ ] User activity heatmap (login times, booking patterns)
- [ ] Automated backups with point-in-time recovery

**Compliance:**
- [ ] Data export endpoint (GDPR right to be forgotten)
- [ ] Account deletion audit trail
- [ ] Consent tracking for marketing emails
- [ ] Privacy policy acceptance versioning

---

## SPECIFIC CODE LOCATIONS & FIXES

### RLS on profiles (Missing)
**Add to:** `supabase/migrations/[timestamp]_add_profiles_rls.sql`

**Reason:** `supabase_setup.sql:6` enables RLS but doesn't create policies.

### Session Timeout (Missing)
**Add to:** `src/contexts/AuthContext.tsx`

**Hook suggested:** Track last activity, check every 60 seconds, logout if idle > 15 minutes.

### Reactivate Account RPC Guard (Missing)
**Fix:** `supabase/migrations/20260222_lifecycle_warnings.sql:115-153`

**Add before UPDATE:** Role check that raises exception if not admin.

### Profile Race Condition (Wrong Pattern)
**Fix:** `src/services/authService.ts:55-76`

**Replace:** Retry loop with UPSERT or add database trigger to auto-create profile.

### Audit Logging (Missing)
**Add to:** New migration file

**Create:** `audit_log` table with triggers on sensitive tables.

### Guest User (Broken)
**Either:**
1. Remove guest role entirely from codebase
2. Persist guest as real user with `is_guest = true` in profiles

**Currently:** Guest created in memory only, state lost on refresh.

---

## TESTING REQUIREMENTS (BEFORE PRODUCTION)

**Must Add:**

```
tests/auth.test.ts
  ✓ Signup creates profile with correct role
  ✓ Login rejects unverified email
  ✓ Logout clears session
  ✓ RLS prevents reading other user profiles
  ✓ RLS prevents reading other user bookings
  ✓ Admin can view all profiles via RLS
  ✓ Guest user either removed or properly persisted

tests/rls.test.ts
  ✓ Each RLS policy allows intended access
  ✓ Each RLS policy denies unintended access
  ✓ Bypassing filters via direct query still blocked by RLS

tests/race-conditions.test.ts
  ✓ Simultaneous profile creation doesn't cause conflict
  ✓ Simultaneous booking creation handles concurrency
  ✓ Loyalty state updates are atomic

tests/authorization.test.ts
  ✓ Only admins can reactivate frozen accounts
  ✓ Only admins can mark bookings paid
  ✓ Users can only update own profile
```

---

## FINAL VERDICT

### GO / NO-GO: **🛑 NO-GO — DO NOT DEPLOY**

**Reason:** Critical security gaps expose user data and allow privilege escalation.

### Key Sentence
*This system exhibits strong server-side security (SECURITY DEFINER, server-side pricing, RPC hardening) but completely fails at the data access layer (missing RLS on core tables) and lacks audit compliance. Deploying this handles real payments while exposing all customer data to each other. This is not acceptable.*

### By The Numbers

| Metric | Score | Acceptable? |
|--------|-------|------------|
| Security | 4/10 | ❌ No |
| Architecture | 4/10 | ❌ No |
| Production Readiness | 4/10 | ❌ No |
| Test Coverage | 1/10 | ❌ No |
| Audit Compliance | 2/10 | ❌ No |

### Estimated Time to Fix

**Blocking Issues:** 2-3 days (RLS, RPCs, session timeout, race condition)
**High Priority:** 3-5 days (password reset, email verification, error handling, consolidation)
**Medium Priority:** 1-2 weeks (CSRF, tests, documentation, nice-to-haves)

**Total: 2-3 weeks minimum before safe production launch.**

### Risk Assessment If Deployed As-Is

| Risk | Severity | Likelihood |
|------|----------|------------|
| GDPR Data Breach (missing RLS on profiles) | CRITICAL | Very High |
| Account Takeover (unprotected reactivate RPC) | CRITICAL | Medium-High |
| Data Integrity Issues (race condition on profile creation) | HIGH | Medium |
| Undetected Breach (no audit logs) | HIGH | High |
| User Frustration (no password reset) | HIGH | Very High |
| Session Hijacking (no timeout) | MEDIUM | Medium |

### Path Forward

1. **This week:** Fix RLS, RPC guards, session timeout, race condition
2. **Next week:** Password reset, email verification, error handling, consolidation
3. **Week 3:** Testing, documentation, deployment readiness review
4. **Then:** Deploy with confidence

**Do not merge to production branch until all items in "WHAT MUST BE DONE" are completed and tested.**

---

## APPENDIX: COMMAND CHECKLIST FOR REMEDIATION

```bash
# 1. Create RLS migrations
touch supabase/migrations/$(date +%s)_add_profiles_rls.sql
touch supabase/migrations/$(date +%s)_add_bookings_rls.sql

# 2. Create audit log table
touch supabase/migrations/$(date +%s)_add_audit_log.sql

# 3. Fix RPC guards
# Edit supabase/migrations/20260222_lifecycle_warnings.sql
# Edit supabase/migrations/20260221_invoices_manual_payment.sql

# 4. Test locally
npm run lint
npm test  # (after creating test files above)

# 5. Deploy to staging
supabase link --project-ref [staging-ref]
supabase db push
npm run dev

# 6. Manual testing checklist
# - Try to read another user's profile (should fail)
# - Try to read another user's bookings (should fail)
# - Try to reactivate another user's account as non-admin (should fail)
# - Create profile via rapid signup (should not duplicate)
# - Idle for 15+ minutes (should auto-logout)

# 7. Deploy to production
git merge --no-ff -m "fix: production hardening - RLS, auth, audit logging"
git push origin production
```

---

**END OF REPORT**

*This assessment represents a CTO-level code review for production deployment. All findings are based on static code analysis. Dynamic testing (penetration testing, load testing) recommended post-remediation.*
