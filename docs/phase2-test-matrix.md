# Phase 2 Test Matrix: Core User Flows

Scope: Registration, Login, Booking, Profile Updates  
Goal: Validate end-to-end behavior and persistence before production readiness sign-off.

## Environment
- Frontend: current branch build (`npm run dev` or deployed preview)
- Backend: Supabase project with latest migrations applied
- Required tables/functions:
  - `profiles`
  - `bookings`
  - `loyalty_state`, `loyalty_events`
  - `create_secure_booking(...)`

## Readiness Criteria (Phase 2)
1. Every core flow writes expected records to database.
2. User-facing behavior is smooth and understandable on desktop/mobile.
3. No broken core navigation routes in tested flows.

## Block A Matrix

### 1) Registration Flow
| ID | Scenario | Steps | Expected UI Result | Persistence Checks |
|---|---|---|---|---|
| REG-01 | Register new user with email/password | Open auth dialog -> Sign Up -> submit valid form | Success toast or "check your email" confirmation | `profiles` row exists for user id; `email` and `name` populated |
| REG-02 | Register duplicate email | Submit existing email | Actionable error message shown | No duplicate `profiles.id`; no malformed records |
| REG-03 | Required fields validation | Submit empty/invalid form | Inline validation errors shown, no submit | No new auth/profile records |

SQL check pattern:
```sql
select id, email, name, created_at
from public.profiles
where email = '<test_email>';
```

### 2) Login Flow
| ID | Scenario | Steps | Expected UI Result | Persistence Checks |
|---|---|---|---|---|
| LOG-01 | Valid login | Enter valid credentials -> submit | User authenticated; menu/dashboard available | `last_activity_at` updated on profile |
| LOG-02 | Invalid password | Submit wrong password | Clear actionable error message | No profile corruption/updates except no-op |
| LOG-03 | Logout | Click logout | Session ends; protected content hidden | Session invalidated (auth state cleared) |

SQL check pattern:
```sql
select id, email, last_activity_at
from public.profiles
where email = '<test_email>';
```

### 3) Booking Flow
| ID | Scenario | Steps | Expected UI Result | Persistence Checks |
|---|---|---|---|---|
| BKG-01 | Create booking with standard service | Dashboard -> New Booking -> complete wizard -> submit | Success confirmation with booking reference id | New `bookings` row for user; server-calculated amounts set (`total_amount`, `net_amount`) |
| BKG-02 | Create booking with extras | Add extras and submit | Confirmation shown | `bookings` row created; totals reflect server pricing logic |
| BKG-03 | Booking list visibility | Open My Bookings after create | New booking visible in list | Record query returns created booking ordered by latest |

SQL check pattern:
```sql
select id, user_id, type, category, status, total_amount, net_amount, created_at
from public.bookings
where user_id = '<test_user_id>'
order by created_at desc
limit 5;
```

### 4) Profile Update Flow
| ID | Scenario | Steps | Expected UI Result | Persistence Checks |
|---|---|---|---|---|
| PRF-01 | Update basic profile fields | Dashboard -> Profile -> edit name/phone/bio -> save | Success toast; fields remain after refresh | `profiles` row updated with submitted fields |
| PRF-02 | Toggle business account | Enable business account switch -> save | Updated state visible after reload | `is_business_account` changed in DB |
| PRF-03 | Validation error handling | Enter invalid data if constraints apply | Actionable validation message | No partial/corrupt writes |

SQL check pattern:
```sql
select id, name, phone, whatsapp, bio, is_business_account, updated_at
from public.profiles
where id = '<test_user_id>';
```

## Navigation/UX Checks (Core Flow)
- Auth entry points open reliably from navbar/user menu.
- Dashboard routes used in this phase are reachable and non-broken:
  - `/dashboard`
  - `/dashboard/booking/new`
  - `/dashboard/bookings`
  - `/dashboard/profile`
- Mobile checks (375px width):
  - No clipped critical buttons
  - Forms remain usable without horizontal scroll
  - Primary CTAs remain visible

## Pass/Fail Rule
- PASS: all REG/LOG/BKG/PRF cases pass and persistence checks match expected writes.
- FAIL: any missing write, stale UI state after refresh, broken route, or blocking UX issue.
