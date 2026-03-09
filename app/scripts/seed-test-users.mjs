import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const userAEmail = process.env.TEST_USER_A_EMAIL || "ours_testa@example.org";
const userAPassword = process.env.TEST_USER_A_PASSWORD || "TestPass123!";
const userAName = process.env.TEST_USER_A_NAME || "Ava";

const userBEmail = process.env.TEST_USER_B_EMAIL || "ours_testb@example.org";
const userBPassword = process.env.TEST_USER_B_PASSWORD || "TestPass123!";
const userBName = process.env.TEST_USER_B_NAME || "Noah";

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 200) return null;
    page += 1;
  }
}

async function ensureUser(email, password, firstName) {
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName },
  });
  if (error) throw error;
  return data.user;
}

async function run() {
  const userA = await ensureUser(userAEmail, userAPassword, userAName);
  const userB = await ensureUser(userBEmail, userBPassword, userBName);

  await supabase.from("profiles").upsert([
    { id: userA.id, first_name: userAName, timezone: "America/New_York" },
    { id: userB.id, first_name: userBName, timezone: "America/New_York" },
  ]);

  const { data: couple } = await supabase
    .from("couples")
    .select("id, member1, member2")
    .or(`member1.eq.${userA.id},member2.eq.${userA.id}`)
    .limit(1)
    .maybeSingle();

  if (!couple) {
    await supabase.from("couples").insert({ member1: userA.id, member2: userB.id });
  } else {
    await supabase.from("couples").update({ member1: userA.id, member2: userB.id }).eq("id", couple.id);
  }

  console.log("✅ Seed complete");
  console.log(`User A: ${userAEmail} / ${userAPassword}`);
  console.log(`User B: ${userBEmail} / ${userBPassword}`);
}

run().catch((e) => {
  console.error("Seed failed:", e.message || e);
  process.exit(1);
});
