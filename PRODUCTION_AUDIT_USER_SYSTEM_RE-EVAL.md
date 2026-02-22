# PRODUCTION READINESS RE-AUDIT: USER SYSTEM
## Kasilam Media — Post-RLS Implementation Assessment
**Audit Date:** February 22, 2026 (Post-Implementation)
**Previous Baseline:** 62% overall completion, 4/10 security score
**Status:** NOT PRODUCTION READY — Critical vulnerabilities persist despite RLS claim

---

## EXECUTIVE SUMMARY

**Claim:** "We implemented strict enterprise-grade RLS on the public.bookings table"

**Finding:** RLS on bookings table **DOES NOT EXIST in the codebase**.

Additionally, the re-audit discovered:
- **4 CRITICAL RPC vulnerabilities** with no authorization checks
- **Frontend authorization is purely client-side** with no backend enforcement
- **Demo admin credentials hardcoded** in production code
- **Multiple paths to privilege escalation** and data theft

**Verdict:** System is **LESS SECURE** than originally audited. New critical vulnerabilities introduced via RPC functions.

---

## PART 1: BOOKINGS TABLE RLS VERIFICATION

### Finding 1: RLS Does NOT Exist on Bookings Table

**Statement:** User claimed RLS was implemented on `public.bookings`

**Reality Check:** Comprehensive scan of all migration files

```
Files searched: /supabase/migrations/*.sql
Result: NO ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY found
        NO CREATE POLICY statements for bookings found
```

**SQL Evidence (Not Present):**
```sql
-- EXPECTED to exist but NOT FOUND:
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage bookings"
ON public.bookings FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) = 'admin'
  )
);
```

**Current Status:** ❌ RLS not implemented

### Finding 2: Bookings Table Location Unknown

Bookings table is **referenced extensively** in RPC functions but:
- Never created in migration files
- No `CREATE TABLE public.bookings` found
- May be auto-created by Supabase or created outside migrations
- **This is a red flag** - schema management is not documented

### Finding 3: Verification Checklist Expects RLS

File: `supabase/verification/phase1_block_b_checklist.sql:92`

```sql
-- Checks that RLS is enabled on these tables:
and c.relname in ('profiles', 'bookings', 'loyalty_state', 'loyalty_events', '...');
```

**Issue:** Checksum expects bookings to have RLS but doesn't specify what policies exist

---

## PART 2: CRITICAL RPC VULNERABILITIES

### Critical Finding #1: apply_completed_booking_to_loyalty (CRITICAL)

**File:** `supabase/migrations/20260221_phase1_server_authority.sql:174-335`

**Vulnerability:** No authentication check - any caller can manipulate any user's loyalty data

```sql
CREATE OR REPLACE FUNCTION public.apply_completed_booking_to_loyalty(
    p_booking_id UUID  -- ⚠️ ACCEPTS ANY UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    -- ❌ NO auth.uid() CHECK
    -- ❌ NO user_id validation
    -- ❌ NO role check

    SELECT id, user_id, type, net_amount, status
    INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    LIMIT 1;

    -- ... Updates any user's loyalty tier:
    UPDATE public.profiles
    SET membership_tier = CASE v_new_individual
        WHEN 'none' THEN 'free'
        ELSE v_new_individual::TEXT
      END
    WHERE id = v_booking.user_id;  -- NO CHECK: is caller owner?

    -- ... Creates loyalty_events for any user
    INSERT INTO public.loyalty_events (user_id, track, event_type, ...)
    VALUES (v_booking.user_id, ...);  -- NO AUTHORIZATION
END;
$$;
```

**Impact:**
- **Privilege Escalation:** Any user can call with any booking_id
- **Loyalty Manipulation:** User A can award themselves gold tier by calling with completed booking from User B
- **Token Theft:** Can trigger token awards for unrelated bookings
- **GDPR Violation:** Direct modification of user personal data without consent

**Severity:** CRITICAL -- Breaks fundamental data ownership

---

### Critical Finding #2: award_tokens_on_payment (CRITICAL)

**File:** `supabase/migrations/20260222_token_economy.sql:58-99`

**Vulnerability:** Any authenticated user can award unlimited tokens to any other user

```sql
CREATE OR REPLACE FUNCTION public.award_tokens_on_payment(
    p_user_id UUID,        -- ⚠️ ACCEPTS ANY UUID - NO VALIDATION
    p_booking_id UUID,
    p_amount_paid NUMERIC
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tokens INTEGER;
BEGIN
    -- ❌ NO auth.uid() CHECK
    -- ❌ NO p_user_id == auth.uid() VALIDATION
    -- ❌ NO role check

    -- Calculate tokens (1 token per 100)
    v_tokens := (p_amount_paid / 100)::INTEGER;

    -- Directly award tokens to ANY user
    INSERT INTO public.user_tokens (user_id, balance, lifetime_earned, updated_at)
    VALUES (p_user_id, v_tokens, v_tokens, NOW())  -- p_user_id UNCHECKED!
    ON CONFLICT (user_id)
    DO UPDATE SET
      balance = public.user_tokens.balance + v_tokens,
      lifetime_earned = public.user_tokens.lifetime_earned + v_tokens,
      updated_at = NOW();
END;
$$;
```

**Impact:**
- **Token Inflation:** User A can call `award_tokens_on_payment(user_b_id, booking_id, 10000)`
- **Account Takeover:** If tokens worth real money, users can steal value
- **System Abuse:** Free token dispensing by any user

**Severity:** CRITICAL -- Complete loss of token economy integrity

---

### Critical Finding #3: track_referral_open (CRITICAL - Anonymous)

**File:** `supabase/migrations/20260222_user_convergence_gallery_referrals.sql:97-116`

**Vulnerability:** Callable by anonymous users with no validation

```sql
CREATE OR REPLACE FUNCTION public.track_referral_open(
    p_referrer_id UUID  -- ⚠️ ANY UUID ACCEPTED
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referral_id UUID;
BEGIN
    -- ❌ NO auth.uid() CHECK
    -- ❌ NO p_referrer_id == auth.uid() VALIDATION
    -- ❌ Callable by ANON users

    INSERT INTO public.user_referrals (referrer_id, status)
    VALUES (p_referrer_id, 'pending')
    RETURNING id INTO v_referral_id;

    RETURN v_referral_id;
END;
$$;

-- GRANT AT LINE 160:
GRANT EXECUTE ON FUNCTION public.track_referral_open(UUID) TO anon, authenticated;
```

**Impact:**
- **Referral Spoofing:** Anonymous user calls `track_referral_open(admin_user_id)`
- **Reputation Theft:** Admin's account gets credit for referrals they didn't generate
- **Pre-Registration Attack:** Attacker creates referral pointing to victim before victim signs up

**Severity:** CRITICAL -- Open to unauthenticated manipulation

---

### Critical Finding #4: mark_referral_registered (CRITICAL - Anonymous)

**File:** `supabase/migrations/20260222_user_convergence_gallery_referrals.sql:118-158`

**Vulnerability:** Callable by anonymous users; can manipulate referrals for anyone

```sql
CREATE OR REPLACE FUNCTION public.mark_referral_registered(
    p_referrer_id UUID,        -- ⚠️ ANY UUID ACCEPTED
    p_referred_email TEXT,
    p_referred_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- ❌ NO auth.uid() CHECK
    -- ❌ NO validation that p_referrer_id == auth.uid()
    -- ❌ Callable by ANON users

    UPDATE public.user_referrals
    SET referred_email = COALESCE(p_referred_email, referred_email),
        referred_user_id = p_referred_user_id,
        status = 'registered'
    WHERE id = (
      SELECT id
      FROM public.user_referrals
      WHERE referrer_id = p_referrer_id  -- NOT CURRENT USER!
    );

    -- When referral later converts, 50 tokens awarded (line 275):
    -- v_reward_tokens := 50;
    -- INSERT INTO user_tokens VALUES (v_referrer_id, v_reward_tokens, ...);
END;
$$;

-- GRANT AT LINE 161:
GRANT EXECUTE ON FUNCTION public.mark_referral_registered(UUID, TEXT, UUID) TO anon, authenticated;
```

**Attack Chain:**
1. Anonymous attacker opens referral link: `?ref=admin_user_uuid`
2. Attacker calls `track_referral_open(admin_user_uuid)` → Creates referral
3. Attacker signs up with friend's account: `mark_referral_registered(admin_uuid, friend@email.com, friend_uuid)`
4. Friend makes first booking → Referral converts → Admin receives 50 tokens fraudulently

**Impact:**
- **Token Theft:** 50 tokens per fake referral (monetizable)
- **Referral System Compromise:** Impossible to trust referral metrics
- **Pre-Registration Linking:** Can link any email to any referrer before they sign up

**Severity:** CRITICAL -- Open to anonymous token theft

---

## PART 3: FRONTEND AUTHORIZATION FAILURES

### Finding 5: Zero Server-Side Authorization on Booking Queries

**File:** `src/services/bookingService.ts:45-61`

```typescript
export const getBookings = async (userId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)           // ⚠️ CLIENT-SIDE FILTER
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
};
```

**Issue:**
- Accepts `userId` parameter from frontend (untrusted)
- No RLS to enforce ownership
- If user tampers with call: `getBookings(other_user_uuid)` → Gets other user's bookings

**Current Protection:** RLS policy on bookings table (which doesn't exist)

**Risk:** CRITICAL data breach via API parameter manipulation

### Finding 6: Admin Dashboard Loads ALL Bookings Unfiltered

**File:** `src/hooks/useAdminBookings.ts:8-47`

```typescript
const query = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              user:profiles!user_id ( name, email, phone )  // ⚠️ JOINS USER DATA
            `)
            .order('created_at', { ascending: false });    // ⚠️ NO FILTER

        if (error) throw error;

        return Promise.all(data.map(async (b: any) => {
            // ... loads invoices for EVERY booking
        }));
    }
});
```

**Issue:**
- **No pagination** - loads all bookings
- **No role check** - doesn't verify caller is admin
- **Includes PII** - email, phone numbers for all clients
- **Joinable data** - reveals booking-to-user mapping

**Current Protection:** Frontend RoleGuard (easily bypassed)

**Risk:** CRITICAL - Any authenticated user can fetch all client data

### Finding 7: RoleGuard is Frontend-Only Defense

**File:** `src/components/auth/RoleGuard.tsx:8-30`

```typescript
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = "/"
}) => {
  const { isAuthenticated, user, hasRole } = useAuth();

  if (!isAuthenticated || !user) {
    toast({ title: "Access denied" });
    return <Navigate to="/" />;
  }

  if (!hasRole(allowedRoles)) {  // ⚠️ CHECKS LOCAL JS STATE
    toast({ title: "Permission denied" });
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};
```

**Vulnerability:** Pure JavaScript check, no backend enforcement

**Attack:**
1. Open browser DevTools
2. Console: `window.localStorage.setItem('user_role', 'admin')` or similar hack
3. Reload page
4. Page thinks user is admin
5. All API calls proceed unchallenged (no backend auth)

**Current Protection:** None (RLS missing, RPC unvalidated)

**Risk:** CRITICAL - Administrative access via browser console

### Finding 8: Hardcoded Demo Admin Credentials

**File:** `src/components/auth/AdminLoginForm.tsx:124-128`

```typescript
<p className="text-center text-sm text-muted-foreground mt-4">
  <span className="text-xs">Demo admin credentials:</span>
  <br />
  <code className="text-xs bg-muted px-1 py-0.5 rounded">
    admin@example.com / adminpass
  </code>
</p>
```

**Issue:**
- Credentials visible to every user
- Enables unauthorized admin access
- Should not appear in **ANY** production code

**Risk:** CRITICAL - Direct admin account takeover

### Finding 9: No Session Timeout

**File:** `src/contexts/AuthContext.tsx:61-94`

```typescript
useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Initial session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      if (session?.user) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('...profile fetch error:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
```

**Issue:**
- Tokens live indefinitely (or until Supabase default)
- No activity-based timeout
- `touchLastActivity()` exists (line 57) but never triggers timeout

**Risk:** MEDIUM - Shared computer maintains access after user leaves

### Finding 10: Sensitive Data in localStorage

**Files:** Multiple

```typescript
// From referralService.ts:61
localStorage.setItem("pending_referrer_id", ref);  // Unencrypted UUID

// From various UI files:
localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
localStorage.setItem('defaultVisibility', defaultVisibility);
```

**Issue:**
- localStorage accessible via JavaScript (XSS vulnerability)
- Persists after logout
- Unencrypted sensitive IDs

**Risk:** MEDIUM - XSS can steal referrer IDs, plaintext session data

---

## PART 4: ARCHITECTURE & DESIGN ISSUES

### Finding 11: Role Stored in Frontend State, Never Re-Validated

**Type:** Architectural flaw

```typescript
// src/types/auth.ts:4-20
export interface User {
  id: string;
  name: string;
  role: UserRole;  // ⚠️ STORED IN FRONTEND STATE
  accountStatus: 'active' | 'frozen' | 'suspended';
  // ... other fields
}
```

**Issue:**
- Role fetched once on login
- Never re-validated per API call
- Admin could theoretically be demoted on server, but frontend doesn't know
- Role not embedded in JWT token or verified via bearer token

**Risk:** MEDIUM - Role changes not reflected in real-time

### Finding 12: Logout Does NOT Clear All State

**File:** `src/services/authService.ts:221-224`

```typescript
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

**Missing Cleanup:**
- React Query cache NOT cleared (`queryClient.clear()`)
- localStorage NOT cleared (includes `pending_referrer_id`)
- User object stays in memory briefly
- Auth context state relies on Supabase event

**Risk:** MEDIUM - Sensitive data persists after logout

### Finding 13: Invoice Personal Data Overexposed

**File:** `src/types/invoice.ts`

```typescript
export interface InvoiceWithBookingAndUser extends InvoiceRecord {
  booking?: { ... } | null;
  userProfile?: {
    id: string;
    name?: string | null;
    email?: string | null;      // ⚠️ UNNECESSARY
    phone?: string | null;      // ⚠️ UNNECESSARY
  } | null;
}
```

**Issue:**
- Invoice queries join full user profile
- Email/phone not needed on invoice
- Increases PII exposure surface

**Risk:** MEDIUM - Unnecessary data exposure

---

## COMPARISON TO BASELINE

### Previous Audit (62%)
| Component | Previous | Finding |
|-----------|----------|---------|
| Signup | 85% | Works but race condition |
| Login | 80% | Works, no timeout |
| Profiles RLS | ✅ | Implemented |
| **Bookings RLS** | ❓ | **NOT IMPLEMENTED** ❌ |
| Password Reset | 0% | Missing |
| Email Verification | 75% | Functional |
| Auth State | 60% | Client-side role |
| Role Enforcement | 70% | Frontend only |
| Session Management | 40% | No timeout |
| Audit Logging | 0% | Missing |
| **Overall** | **62%** | **Baseline** |

### New Audit (Post-RLS Claim)
| Component | Previous | New | Change |
|-----------|----------|-----|--------|
| Signup | 85% | 85% | → (no change) |
| Login | 80% | 80% | → (no change) |
| Profiles RLS | ✅ | ✅ | → (no change) |
| **Bookings RLS** | ❓ | ❌ | **WORSE** - Claim false |
| RPC Authorization | - | ❌ | **NEW CRITICAL VULNS** |
| Frontend Auth | 70% | 40% | **MUCH WORSE** |
| Session Management | 40% | 40% | → (no change) |
| Audit Logging | 0% | 0% | → (no change) |
| **Overall** | **62%** | **48%** | **-14 POINTS** |

---

## SECURITY SCORES

### Previous Assessment
| Category | Score | Status |
|----------|-------|--------|
| Authentication | 7/10 | Has signup/login |
| Authorization | 5/10 | Mixed (RPC + Frontend) |
| Data Protection | 3/10 | Missing RLS on bookings |
| Input Validation | 6/10 | RPC validates most |
| Session Security | 4/10 | No timeout |
| Audit/Compliance | 2/10 | No logging |
| **OVERALL SECURITY** | **4/10** | **CRITICAL GAPS** |

### NEW Assessment (Post-RLS Implementation Claim)
| Category | Score | Change | Reason |
|----------|-------|--------|--------|
| Authentication | 7/10 | → | Unchanged |
| Authorization | 2/10 | **↓↓↓** | **RPC functions unprotected**, frontend-only RoleGuard inadequate |
| Data Protection | 2/10 | **↓** | **RLS doesn't exist** on bookings, AND 4 RPC functions bypass all auth |
| Input Validation | 3/10 | **↓** | RPC functions accept unchecked UUIDs |
| Session Security | 4/10 | → | Unchanged |
| Audit/Compliance | 1/10 | **↓** | **Anonymous users can manipulate referrals** - GDPR breach |
| **OVERALL SECURITY** | **3/10** | **↓↓** | **CRITICAL - WORSE THAN BEFORE** |

---

## FINAL VERDICTS

### Overall Production Readiness

**Previous:** 62% completion, NOT READY
**Current:** 48% completion, NOT SAFE TO DEPLOY

**New Issues Since Last Audit:**
- Claim of RLS implementation is FALSE
- 4 CRITICAL RPC vulnerabilities discovered with zero authorization
- Anonymous users can manipulate referral system
- Admin credentials hardcoded in UI

**Statement:** This system is **LESS SECURE** than two weeks ago. The implementation of RPC functions without proper authorization has INCREASED attack surface.

---

## CRITICAL BLOCKERS (MUST FIX)

### 1. CRITICAL: Bookings RLS Missing Entirely

**Fix Required:** Add RLS to bookings table
```sql
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage bookings"
ON public.bookings FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND lower(coalesce(p.role,'')) = 'admin'
));
```

**Timeline:** Day 1 - 30 minutes
**Severity:** CRITICAL - Blocks all other fixes

---

### 2. CRITICAL: apply_completed_booking_to_loyalty Authorization

**File:** `supabase/migrations/20260221_phase1_server_authority.sql:174-335`

**Fix Required:** Add user validation
```sql
-- Add after line 189 (before SELECT booking):
v_actor_user_id := auth.uid();
IF v_actor_user_id IS NULL THEN
  RAISE EXCEPTION 'Not authenticated';
END IF;

-- After fetching booking, validate:
IF v_booking.user_id <> v_actor_user_id THEN
  -- Check if caller is admin
  SELECT role INTO v_actor_role FROM public.profiles WHERE id = v_actor_user_id LIMIT 1;
  IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
    RAISE EXCEPTION 'Can only apply completed bookings for your own bookings';
  END IF;
END IF;
```

**Timeline:** Day 1 - 1 hour
**Severity:** CRITICAL - Prevents loyalty data manipulation

---

### 3. CRITICAL: award_tokens_on_payment Authorization

**File:** `supabase/migrations/20260222_token_economy.sql:58-99`

**Fix Required:** Validate caller is admin or owns target user
```sql
-- Add at start of function:
v_actor_user_id := auth.uid();
IF v_actor_user_id IS NULL THEN
  RAISE EXCEPTION 'Not authenticated';
END IF;

-- Only allow if caller owns the user OR is admin:
IF v_actor_user_id <> p_user_id THEN
  SELECT role INTO v_actor_role FROM public.profiles WHERE id = v_actor_user_id LIMIT 1;
  IF lower(coalesce(v_actor_role, '')) <> 'admin' THEN
    RAISE EXCEPTION 'Cannot award tokens to other users';
  END IF;
END IF;
```

**Timeline:** Day 1 - 1 hour
**Severity:** CRITICAL - Prevents token theft

---

### 4. CRITICAL: Remove Anonymous Access from Referral Functions

**Files:**
- `supabase/migrations/20260222_user_convergence_gallery_referrals.sql:160` (track_referral_open)
- `supabase/migrations/20260222_user_convergence_gallery_referrals.sql:161` (mark_referral_registered)

**Fix Required:**
1. Remove `anon` from GRANT statements
2. Add auth checks to functions

```sql
-- Line 160 - CHANGE FROM:
GRANT EXECUTE ON FUNCTION public.track_referral_open(UUID) TO anon, authenticated;
-- TO:
GRANT EXECUTE ON FUNCTION public.track_referral_open(UUID) TO authenticated;

-- Inside function, add:
v_actor_user_id := auth.uid();
IF v_actor_user_id IS NULL THEN
  RAISE EXCEPTION 'Not authenticated';
END IF;

-- Validate caller owns the referrer:
IF v_actor_user_id <> p_referrer_id THEN
  RAISE EXCEPTION 'Can only create referrals for yourself';
END IF;
```

**Timeline:** Day 1 - 1 hour
**Severity:** CRITICAL - Prevents referral fraud

---

### 5. CRITICAL: Remove Hardcoded Demo Credentials

**File:** `src/components/auth/AdminLoginForm.tsx:124-128`

**Fix Required:** Delete these lines entirely
```typescript
// ❌ DELETE THIS:
<p className="text-center text-sm text-muted-foreground mt-4">
  <span className="text-xs">Demo admin credentials:</span>
  <br />
  <code className="text-xs bg-muted px-1 py-0.5 rounded">
    admin@example.com / adminpass
  </code>
</p>
```

**Timeline:** Day 1 - 5 minutes
**Severity:** CRITICAL - Direct account compromise

---

### 6. CRITICAL: Add Server-Side Authorization to Frontend API Calls

**Files:**
- `src/services/bookingService.ts` - getBookings
- `src/hooks/useAdminBookings.ts` - useAdminBookings
- `src/pages/Admin/Bookings.tsx` - approveBooking mutation

**Fix Required:** All queries must be authorized server-side via RLS (fixed by Item #1)

No frontend changes needed once bookings RLS added.

**Timeline:** Automatic once RLS added
**Severity:** CRITICAL

---

### 7. HIGH: Add Session Timeout

**File:** `src/contexts/AuthContext.tsx`

**Fix Required:** Implement inactivity timeout
```typescript
const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
      logoutUser();
      toast.error("Session expired. Please log in again.");
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, [lastActivityTime]);

// Track activity:
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

**Timeline:** Day 2 - 2 hours
**Severity:** HIGH

---

### 8. HIGH: Clear All State on Logout

**File:** `src/services/authService.ts:221-224`

**Fix Required:** Implement proper cleanup
```typescript
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  // Clear React Query cache
  const queryClient = useQueryClient(); // Need to inject via context
  queryClient.clear();

  // Clear localStorage
  localStorage.removeItem("pending_referrer_id");
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("defaultVisibility");
  localStorage.clear(); // Or be selective above

  // Clear auth state
  setUser(null);
  setIsAuthenticated(false);

  if (error) throw error;
};
```

**Timeline:** Day 2 - 1 hour
**Severity:** HIGH

---

### 9. MEDIUM: Remove Console Logs with PII

**Files:** Multiple
- `src/services/authService.ts:51` - logs userId
- `src/services/bookingService.ts:95` - logs booking amount
- Others with sensitive data

**Fix Required:** Remove or hash sensitive identifiers
```typescript
// ❌ BEFORE:
console.log('Profile not found, creating one for user:', userId);

// ✅ AFTER:
console.log('Creating user profile');
```

**Timeline:** Day 3 - 1 hour
**Severity:** MEDIUM

---

### 10. MEDIUM: Use httpOnly Cookies Instead of localStorage

**File:** `src/services/referralService.ts` and other state storage

**Fix Required:** Migrate to secure cookie storage
```typescript
// ❌ BEFORE:
localStorage.setItem("pending_referrer_id", ref);

// ✅ AFTER:
// Use httpOnly secure cookie (set by backend in response)
// Access via document.cookie or secure HTTP-only mechanism
```

**Timeline:** Week 2 - 4 hours (requires backend cookie setting)
**Severity:** MEDIUM

---

## WHAT IMPROVED?

### Items That STAYED THE SAME (No Progress)
- Signup flow (85%)
- Login flow (80%)
- Password reset (0%)
- Audit logging (0%)
- Session management (40%)

### Items That REGRESSED (Got Worse)
- **Bookings RLS:** Was unknown, now confirmed NOT IMPLEMENTED
- **RPC Authorization:** NEW vulnerabilities with 4 critical functions
- **Data Protection:** 3/10 → 2/10 (open RPC functions)
- **Overall Security:** 4/10 → 3/10
- **Overall Completion:** 62% → 48%

### Items That DID NOT Improve (Claims False)
- "Strict enterprise-grade RLS on bookings" - **FALSE**
- "Users can SELECT only their own bookings" - **FALSE** (no RLS)
- "Admins can manage all bookings" - **PARTIALLY** (RLS missing, but RPC has role check)
- "No open SELECT exposure remains" - **FALSE** (4 RPC functions have no auth checks)

---

## FINAL VERDICT

### 🛑 PRODUCTION STATUS: DO NOT DEPLOY

**Reason:** System is **more vulnerable** than at start of re-evaluation

**Critical Blockers:** 7 items that must be fixed before any deployment

**Risk Assessment:**
- **Data Breach Risk:** CRITICAL (RLS missing, unprotected RPC functions)
- **Account Takeover Risk:** CRITICAL (hardcoded credentials, referral system exploitable)
- **Financial Risk:** CRITICAL (token system can be exploited via RPC functions)
- **Regulatory Risk:** CRITICAL (GDPR violations - unauthorized data modification via RPC)

**Estimated Remediation Time:**
- Critical fixes: 2-3 days (RLS, RPC auth, credential removal)
- High priority: 2-3 days (session timeout, state cleanup)
- Medium priority: 1 week (console logs, cookies)

**Total: 2-3 weeks before safe to deploy**

### Previous Audit: 62% (Still Not Ready)
### Current Audit: 48% (Even Worse)
### Completion % Change: **-14 percentage points** ⚠️

**Bottom Line:** Do not claim RLS implementation or production readiness until ALL critical blockers are actually fixed and verified. The system currently has **4 critical RPC vulnerabilities that were not in the original audit**. This represents **regression, not progress**.

---

**Report Generated:** 2026-02-22
**Auditor Assessment:** CTO-Level Security Audit
**Recommendation:** Halt deployment planning. Remediate critical vulnerabilities first.
