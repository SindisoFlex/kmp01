import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const envFile = path.join(root, ".env.local");

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function stamp() {
  return new Date().toISOString();
}

function result(name, passed, detail = "") {
  return { name, passed, detail, at: stamp() };
}

async function tryLogin(supabase, loginEmail, loginPassword) {
  const signIn = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
  if (signIn.error || !signIn.data.user) {
    return { ok: false, reason: signIn.error?.message || "No user in login response" };
  }
  return { ok: true, user: signIn.data.user };
}

loadLocalEnv(envFile);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const runId = Date.now();
const emailDomain = process.env.VITE_E2E_EMAIL_DOMAIN || "gmail.com";
const email = `phase2.e2e.${runId}@${emailDomain}`;
const password = `Phase2!${runId}`;
const displayName = `Phase2 E2E ${runId}`;
const profileName = `Phase2 Updated ${runId}`;
const phone = `+1-555-${String(runId).slice(-4)}`;

const checks = [];
let userId = null;
let bookingId = null;
let activeLoginEmail = null;

try {
  // REGISTRATION
  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
        role: "CLIENT",
      },
    },
  });

  if (signUp.error) {
    checks.push(result("REG-01 register", false, signUp.error.message));
    if (!signUp.error.message.toLowerCase().includes("rate limit")) {
      throw new Error("Registration failed");
    }
  } else {
    userId = signUp.data.user?.id || null;
    checks.push(result("REG-01 register", Boolean(userId), userId ? "User id returned" : "No user id returned"));
  }

  // LOGIN (first with newly registered user)
  let loginAttempt = await tryLogin(supabase, email, password);

  if (!loginAttempt.ok) {
    checks.push(result("LOG-01 login with newly registered user", false, loginAttempt.reason));

    const fallbackCandidates = [];
    if (process.env.VITE_E2E_LOGIN_EMAIL && process.env.VITE_E2E_LOGIN_PASSWORD) {
      fallbackCandidates.push({
        email: process.env.VITE_E2E_LOGIN_EMAIL,
        password: process.env.VITE_E2E_LOGIN_PASSWORD,
        label: "env credentials",
      });
    }
    fallbackCandidates.push({ email: "admin@example.com", password: "adminpass", label: "demo admin" });
    fallbackCandidates.push({ email: "staff@example.com", password: "staffpass", label: "demo staff" });

    for (const candidate of fallbackCandidates) {
      loginAttempt = await tryLogin(supabase, candidate.email, candidate.password);
      if (loginAttempt.ok) {
        activeLoginEmail = candidate.email;
        checks.push(result("LOG-01 login fallback", true, `Authenticated with ${candidate.label}`));
        break;
      }
    }
  } else {
    activeLoginEmail = email;
    checks.push(result("LOG-01 login", true, "Authenticated with newly registered user"));
  }

  if (!loginAttempt.ok || !loginAttempt.user) {
    throw new Error("No confirmed login available. Set VITE_E2E_LOGIN_EMAIL / VITE_E2E_LOGIN_PASSWORD for a confirmed test account.");
  }

  userId = loginAttempt.user.id;

  const profileRead = await supabase
    .from("profiles")
    .select("id, email, name, phone, bio, is_business_account")
    .eq("id", userId)
    .single();

  if (profileRead.error || !profileRead.data) {
    checks.push(result("REG-01 persistence profile row", false, profileRead.error?.message || "No profile row"));
    throw new Error("Profile row missing after login");
  }

  checks.push(result("REG-01 persistence profile row", true, "Profile row exists"));

  const originalProfile = { ...profileRead.data };

  // PROFILE UPDATE
  const profileUpdate = await supabase
    .from("profiles")
    .update({
      name: profileName,
      phone,
      bio: "Phase 2 E2E profile update verification",
      is_business_account: true,
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, name, phone, bio, is_business_account")
    .single();

  if (profileUpdate.error || !profileUpdate.data) {
    checks.push(result("PRF-01 update profile", false, profileUpdate.error?.message || "No update payload"));
    throw new Error("Profile update failed");
  }

  const profileUpdatedCorrectly =
    profileUpdate.data.name === profileName &&
    profileUpdate.data.phone === phone &&
    profileUpdate.data.is_business_account === true;

  checks.push(
    result(
      "PRF-01 persistence profile write",
      profileUpdatedCorrectly,
      profileUpdatedCorrectly ? "Profile values persisted" : "Profile values mismatch"
    )
  );

  // Restore fallback account profile to avoid polluting shared seed accounts.
  if (activeLoginEmail !== email) {
    await supabase
      .from("profiles")
      .update({
        name: originalProfile.name,
        phone: originalProfile.phone,
        bio: originalProfile.bio,
        is_business_account: originalProfile.is_business_account,
      })
      .eq("id", userId);
  }

  // BOOKING CREATE
  const bookingCreate = await supabase.rpc("create_secure_booking", {
    p_service_type: "photography",
    p_category: "portrait",
    p_extras: ["prints"],
    p_date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    p_location: "E2E Test Studio",
    p_notes: "Phase 2 automated booking test",
  });

  if (bookingCreate.error || !bookingCreate.data?.id) {
    checks.push(result("BKG-01 create booking", false, bookingCreate.error?.message || "No booking id returned"));
    throw new Error("Booking create failed");
  }

  bookingId = bookingCreate.data.id;
  checks.push(result("BKG-01 create booking", true, `Booking id: ${bookingId}`));

  // BOOKING PERSISTENCE
  const bookingRead = await supabase
    .from("bookings")
    .select("id, user_id, type, category, status, total_amount, net_amount")
    .eq("id", bookingId)
    .single();

  if (bookingRead.error || !bookingRead.data) {
    checks.push(result("BKG-01 persistence booking row", false, bookingRead.error?.message || "Booking not found"));
    throw new Error("Booking persistence check failed");
  }

  const bookingOwned = bookingRead.data.user_id === userId;
  const bookingAmountsValid = Number(bookingRead.data.total_amount) > 0 && Number(bookingRead.data.net_amount) > 0;

  checks.push(
    result(
      "BKG-01 persistence booking fields",
      bookingOwned && bookingAmountsValid,
      bookingOwned && bookingAmountsValid ? "Booking persisted with totals" : "Ownership or totals check failed"
    )
  );

  const signOut = await supabase.auth.signOut();
  checks.push(result("LOG-03 logout", !signOut.error, signOut.error?.message || "Session terminated"));
} catch (err) {
  checks.push(result("RUN", false, err instanceof Error ? err.message : String(err)));
}

const failed = checks.filter((c) => !c.passed);
const summary = {
  runId,
  executedAt: stamp(),
  email,
  activeLoginEmail,
  userId,
  bookingId,
  passed: failed.length === 0,
  checks,
};

const reportDir = path.join(root, "artifacts");
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `phase2-block-b-report-${runId}.json`);
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

console.log(JSON.stringify({ reportPath, passed: summary.passed, failedChecks: failed.map((f) => f.name) }, null, 2));
process.exitCode = summary.passed ? 0 : 2;
