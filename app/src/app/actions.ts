"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile, getMe, getMyCouple, getPartnerId, refreshSessionUnlock } from "@/lib/ours";
import { sendLoveNoteEmail, sendReassuranceRequestEmail, sendReassuranceMessageEmail, sendSessionUnlockedEmail } from "@/lib/email";
import crypto from "crypto";

async function trackEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  const supabase = await createClient();
  const user = await getMe();
  await supabase.from("analytics_events").insert({
    user_id: user?.id ?? null,
    event_name: eventName,
    metadata,
  });
}

function revalidateSessionPaths() {
  revalidatePath("/app");
  revalidatePath("/app/daily");
  revalidatePath("/app/weekly");
}

function readAttribution(formData: FormData, fallbackSource = "unknown") {
  return {
    source: String(formData.get("source") || fallbackSource),
    utm_source: String(formData.get("utm_source") || ""),
    utm_medium: String(formData.get("utm_medium") || ""),
    utm_campaign: String(formData.get("utm_campaign") || ""),
    utm_content: String(formData.get("utm_content") || ""),
    utm_term: String(formData.get("utm_term") || ""),
  };
}

export async function signUpAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const firstName = String(formData.get("first_name") || "");
  const timezone = String(formData.get("timezone") || "");
  const inviteToken = String(formData.get("invite_token") || "");
  const attribution = readAttribution(formData, inviteToken ? "invite" : "signup_direct");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name: firstName, timezone: timezone || undefined } },
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  await trackEvent("signup_completed", { method: "password", invite_token_present: Boolean(inviteToken), ...attribution });

  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }

  redirect("/app");
}

export async function loginAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const inviteToken = String(formData.get("invite_token") || "");
  const attribution = readAttribution(formData, inviteToken ? "invite" : "login_direct");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  await trackEvent("login_completed", { method: "password", invite_token_present: Boolean(inviteToken), ...attribution });

  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }

  redirect("/app");
}

export async function magicLinkAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?sent=1");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createCoupleAction() {
  const supabase = await createClient();
  const user = await ensureProfile();
  if (!user) redirect("/login");

  const existing = await getMyCouple();
  if (existing) return;

  await supabase.from("couples").insert({ member1: user.id });
  revalidatePath("/app");
}

export async function generateInviteAction() {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return { error: "Not signed in" };
  const couple = await getMyCouple();
  if (!couple) return { error: "Create your couple first" };

  const { data: existing } = await supabase
    .from("invites")
    .select("token, expires_at, used_at")
    .eq("couple_id", couple.id)
    .is("used_at", null)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && new Date(existing.expires_at).getTime() > Date.now()) {
    revalidatePath("/app");
    return { token: existing.token };
  }

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  await supabase.from("invites").insert({
    token,
    couple_id: couple.id,
    created_by: user.id,
    expires_at: expiresAt,
  });

  await trackEvent("partner_invite_sent");
  revalidatePath("/app");
  return { token };
}

export async function acceptInviteAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const user = await ensureProfile();
  const token = String(formData.get("token") || "");
  const attribution = readAttribution(formData, "invite_link");

  if (!user) redirect(`/login?error=${encodeURIComponent("Please log in first")}&invite=${encodeURIComponent(token)}`);
  if (!token) redirect(`/login?error=${encodeURIComponent("Missing invite token")}`);

  const { error } = await supabase.rpc("accept_invite", { invite_token: token });
  if (error) {
    redirect(`/invite/${token}?error=${encodeURIComponent(error.message)}`);
  }

  await trackEvent("partner_connected", { ...attribution, token_prefix: token.slice(0, 8) });
  redirect("/app/daily");
}

export async function saveResponseAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const sessionId = String(formData.get("session_id"));
  const stepIndex = Number(formData.get("step_index"));
  const responseText = String(formData.get("response_text") || "");

  await supabase.from("responses").upsert({
    session_id: sessionId,
    user_id: user.id,
    step_index: stepIndex,
    response_text: responseText,
  });

  const couple = await getMyCouple();
  if (couple) await refreshSessionUnlock(sessionId, couple);
  revalidateSessionPaths();
}

export async function saveSessionResponsesAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const sessionId = String(formData.get("session_id") || "");
  if (!sessionId) return;

  const entries: Array<{ session_id: string; user_id: string; step_index: number; response_text: string }> = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("step_")) continue;
    const stepIndex = Number(key.replace("step_", ""));
    if (!Number.isFinite(stepIndex)) continue;

    const responseText = String(value || "").trim();
    if (!responseText) continue;

    entries.push({
      session_id: sessionId,
      user_id: user.id,
      step_index: stepIndex,
      response_text: responseText,
    });
  }

  if (!entries.length) return;

  await supabase.from("responses").upsert(entries, { onConflict: "session_id,user_id,step_index" });

  const couple = await getMyCouple();
  if (couple) {
    const justUnlocked = await refreshSessionUnlock(sessionId, couple);
    if (justUnlocked && couple.member2) {
      const { data: session } = await supabase.from("sessions").select("type").eq("id", sessionId).single();
      const sessionType = (session?.type ?? "daily") as "daily" | "weekly";
      const { data: myProfile } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
      const fromName = myProfile?.first_name || "Your partner";
      const partnerId = getPartnerId(couple, user.id)!;
      // Notify both: the person who was waiting + the person who just completed it
      void sendSessionUnlockedEmail(user.id, fromName, sessionType);
      void sendSessionUnlockedEmail(partnerId, fromName, sessionType);
      // In-app notifications for both partners
      void supabase.from("notifications").insert([
        { couple_id: couple.id, to_user_id: user.id, type: "session_unlocked", payload: { session_type: sessionType } },
        { couple_id: couple.id, to_user_id: partnerId, type: "session_unlocked", payload: { session_type: sessionType } },
      ]);
    }
  }
  await trackEvent("session_submitted", { session_id: sessionId, responses_count: entries.length });

  revalidateSessionPaths();
}

export async function requestReassuranceAction() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple?.member2) return;

  const toUserId = getPartnerId(couple, user.id)!;

  await supabase.from("notifications").insert({
    couple_id: couple.id,
    to_user_id: toUserId,
    from_user_id: user.id,
    type: "reassurance_request",
    payload: { message: "Could you send me a quick grounding note?" },
  });

  const { data: myProfile } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
  void sendReassuranceRequestEmail(toUserId, myProfile?.first_name || "Your partner");

  revalidatePath("/app/reassurance");
  revalidatePath("/app");
}

export async function sendReassuranceMessageAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  const message = String(formData.get("message") || "");
  if (!user || !couple?.member2 || !message.trim()) return;

  const toUserId = getPartnerId(couple, user.id)!;

  await supabase.from("notifications").insert({
    couple_id: couple.id,
    to_user_id: toUserId,
    from_user_id: user.id,
    type: "reassurance_message",
    payload: { message },
  });

  const { data: myProfile } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
  void sendReassuranceMessageEmail(toUserId, myProfile?.first_name || "Your partner", message);

  revalidatePath("/app/reassurance");
  revalidatePath("/app");
}

export async function saveMoodAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const mood = Number(formData.get("mood_level"));
  const note = String(formData.get("note") || "");

  await supabase.from("moods").insert({
    couple_id: couple.id,
    user_id: user.id,
    mood_level: mood,
    note,
  });

  revalidatePath("/app/reassurance");
}

export async function saveSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user) return;

  const firstName = String(formData.get("first_name") || "");
  const timezone = String(formData.get("timezone") || "America/New_York");
  const nextVisitDate = String(formData.get("next_visit_date") || "");
  const relationshipStartDate = String(formData.get("relationship_start_date") || "");

  const today = new Date().toISOString().slice(0, 10);

  if (nextVisitDate && nextVisitDate < today) {
    return redirect("/app/settings?error=Next+visit+date+can%27t+be+in+the+past");
  }
  if (relationshipStartDate && relationshipStartDate > today) {
    return redirect("/app/settings?error=Relationship+start+date+can%27t+be+in+the+future");
  }

  await supabase.from("profiles").update({ first_name: firstName, timezone }).eq("id", user.id);

  if (couple) {
    await supabase
      .from("couples")
      .update({
        next_visit_date: nextVisitDate || null,
        relationship_start_date: relationshipStartDate || null,
      })
      .eq("id", couple.id);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
}

export async function requestPasswordResetAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  if (!email) redirect("/forgot-password?error=Please+enter+your+email");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  });

  if (error) redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!password || password.length < 6) {
    return redirect("/auth/reset-password?error=Password+must+be+at+least+6+characters");
  }
  if (password !== confirmPassword) {
    return redirect("/auth/reset-password?error=Passwords+do+not+match");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/app/settings?success=password");
}

export async function joinChallengeWaitlistAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  const firstName = String(formData.get("first_name") || "").trim();
  const attribution = readAttribution(formData, "challenge");
  const partnerEmail = String(formData.get("partner_email") || "").trim();

  if (!email) redirect("/challenge?error=Please%20enter%20an%20email");

  const { error } = await supabase.from("waitlist_leads").insert({
    email,
    first_name: firstName || null,
    partner_email: partnerEmail || null,
    source: attribution.source,
  });

  if (error) redirect(`/challenge?error=${encodeURIComponent(error.message)}`);

  await trackEvent("waitlist_joined", { ...attribution, partner_email_provided: Boolean(partnerEmail) });
  redirect("/challenge?success=1");
}

export async function answerWouldYouRatherAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const questionId = String(formData.get("question_id") || "");
  const choice = String(formData.get("choice") || "");
  const guess = String(formData.get("guess") || "");
  if (!questionId || !["a", "b"].includes(choice)) return;

  const row: Record<string, string> = { couple_id: couple.id, user_id: user.id, question_id: questionId, choice };
  if (["a", "b"].includes(guess)) row.guess = guess;

  await supabase.from("would_you_rather_answers").upsert(
    row,
    { onConflict: "couple_id,user_id,question_id" }
  );

  if (couple.member2) {
    const partnerId = getPartnerId(couple, user.id);
    if (partnerId) {
      void supabase.from("notifications").insert({
        couple_id: couple.id,
        to_user_id: partnerId,
        from_user_id: user.id,
        type: "game_answered",
        payload: { game: "Would You Rather", href: "/app/games/would-you-rather" },
      });
    }
  }

  revalidatePath("/app/games/would-you-rather");
}

export async function saveDrawingAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const promptId = String(formData.get("prompt_id") || "");
  const drawingData = String(formData.get("drawing_data") || "");
  if (!promptId || !drawingData) return;

  const MAX_DRAWING_SIZE = 500_000;
  if (!drawingData.startsWith("data:image/png;base64,") || drawingData.length > MAX_DRAWING_SIZE) return;

  const today = new Date().toISOString().slice(0, 10);

  await supabase.from("drawings").upsert(
    { couple_id: couple.id, user_id: user.id, prompt_id: promptId, drawing_data: drawingData, session_date: today },
    { onConflict: "couple_id,user_id,session_date" }
  );

  if (couple.member2) {
    const partnerId = getPartnerId(couple, user.id);
    if (partnerId) {
      void supabase.from("notifications").insert({
        couple_id: couple.id,
        to_user_id: partnerId,
        from_user_id: user.id,
        type: "game_answered",
        payload: { game: "Draw Together", href: "/app/games/draw" },
      });
    }
  }

  revalidatePath("/app/games/draw");
}

export async function answerThisOrThatAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const questionId = String(formData.get("question_id") || "");
  const choice = String(formData.get("choice") || "");
  const guess = String(formData.get("guess") || "");
  if (!questionId || !["a", "b"].includes(choice)) return;

  const row: Record<string, string> = { couple_id: couple.id, user_id: user.id, question_id: questionId, choice };
  if (["a", "b"].includes(guess)) row.guess = guess;

  await supabase.from("this_or_that_answers").upsert(
    row,
    { onConflict: "couple_id,user_id,question_id" }
  );

  if (couple.member2) {
    const partnerId = getPartnerId(couple, user.id);
    if (partnerId) {
      void supabase.from("notifications").insert({
        couple_id: couple.id,
        to_user_id: partnerId,
        from_user_id: user.id,
        type: "game_answered",
        payload: { game: "This or That", href: "/app/games/this-or-that" },
      });
    }
  }

  revalidatePath("/app/games/this-or-that");
}

export async function sendLoveNoteAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple?.member2) return;

  const message = String(formData.get("message") || "").trim();
  if (!message || message.length > 2000) return;

  const toUserId = getPartnerId(couple, user.id)!;

  await supabase.from("love_notes").insert({
    couple_id: couple.id,
    from_user_id: user.id,
    to_user_id: toUserId,
    message,
  });

  const { data: myProfile } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
  void sendLoveNoteEmail(toUserId, myProfile?.first_name || "Your partner");

  await trackEvent("love_note_sent");
  revalidatePath("/app/love-notes");
}

export async function markNoteReadAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const noteId = String(formData.get("note_id") || "");
  if (!noteId) return;

  await supabase.from("love_notes").update({ read_at: new Date().toISOString() }).eq("id", noteId).eq("to_user_id", user.id);
  revalidatePath("/app/love-notes");
}

export async function saveJournalEntryAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const content = String(formData.get("content") || "").trim();
  if (!content || content.length > 5000) return;

  await supabase.from("journal_entries").insert({
    couple_id: couple.id,
    user_id: user.id,
    content,
  });

  await trackEvent("journal_entry_created");
  revalidatePath("/app/journal");
}

export async function deleteJournalEntryAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const entryId = String(formData.get("entry_id") || "");
  if (!entryId) return;

  await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  revalidatePath("/app/journal");
}

export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return redirect("/login");

  const newPassword = String(formData.get("new_password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!newPassword || newPassword.length < 6) {
    return redirect("/app/settings?error=Password+must+be+at+least+6+characters");
  }
  if (newPassword !== confirmPassword) {
    return redirect("/app/settings?error=Passwords+do+not+match");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return redirect(`/app/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/settings?success=password");
}

export async function leavePartnerAction() {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return redirect("/login");

  const couple = await getMyCouple();
  if (!couple || !couple.member2) return;

  if (couple.member1 === user.id) {
    await supabase.from("couples").update({ member1: couple.member2, member2: null }).eq("id", couple.id);
  } else {
    await supabase.from("couples").update({ member2: null }).eq("id", couple.id);
  }

  await trackEvent("partner_left");
  revalidatePath("/app");
  redirect("/app");
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const dataUrl = String(formData.get("avatar_data_url") || "");
  if (!dataUrl.startsWith("data:image/")) return;

  // ~1.37 MB base64 ceiling for a 1 MB source image
  if (dataUrl.length > 1_400_000) return;

  await supabase.from("profiles").update({ avatar_url: dataUrl }).eq("id", user.id);
  revalidatePath("/app");
  revalidatePath("/app/settings");
}

export async function sendThinkingOfYouAction() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple?.member2) return;

  const toUserId = getPartnerId(couple, user.id)!;
  const { data: myProfile } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
  const fromName = myProfile?.first_name || "Your partner";

  await supabase.from("notifications").insert({
    couple_id: couple.id,
    to_user_id: toUserId,
    from_user_id: user.id,
    type: "thinking_of_you",
    payload: { from_name: fromName },
  });

  await trackEvent("thinking_of_you_sent");
  revalidatePath("/app");
}

export async function reactToNoteAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const noteId = String(formData.get("note_id") || "");
  const reaction = String(formData.get("reaction") || "");
  if (!noteId || !["💛", "🥹", "😂"].includes(reaction)) return;

  await supabase
    .from("love_notes")
    .update({ reaction })
    .eq("id", noteId)
    .eq("to_user_id", user.id);

  // Notify the sender
  const { data: note } = await supabase
    .from("love_notes")
    .select("from_user_id, couple_id")
    .eq("id", noteId)
    .single();

  if (note) {
    const { data: myProfile } = await supabase.from("profiles").select("first_name").eq("id", user.id).single();
    await supabase.from("notifications").insert({
      couple_id: note.couple_id,
      to_user_id: note.from_user_id,
      from_user_id: user.id,
      type: "note_reaction",
      payload: { reaction, from_name: myProfile?.first_name || "Your partner" },
    });
  }

  revalidatePath("/app/love-notes");
}

export async function addBucketItemAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const content = String(formData.get("content") || "").trim();
  if (!content || content.length > 500) return;

  await supabase.from("bucket_list_items").insert({
    couple_id: couple.id,
    created_by: user.id,
    content,
  });

  await trackEvent("bucket_item_added");
  revalidatePath("/app/bucket-list");
}

export async function toggleBucketItemAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return;

  const itemId = String(formData.get("item_id") || "");
  const completed = formData.get("completed") === "true";
  if (!itemId) return;

  await supabase
    .from("bucket_list_items")
    .update({ completed_at: completed ? null : new Date().toISOString() })
    .eq("id", itemId)
    .eq("couple_id", couple.id);

  revalidatePath("/app/bucket-list");
}

export async function deleteBucketItemAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const itemId = String(formData.get("item_id") || "");
  if (!itemId) return;

  await supabase
    .from("bucket_list_items")
    .delete()
    .eq("id", itemId)
    .eq("created_by", user.id);

  revalidatePath("/app/bucket-list");
}

export async function saveNotificationPrefsAction(formData: FormData) {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return;

  const prefs = {
    email_love_note: formData.get("email_love_note") === "on",
    email_reassurance: formData.get("email_reassurance") === "on",
    email_session_unlocked: formData.get("email_session_unlocked") === "on",
  };

  await supabase.from("profiles").update({ notification_prefs: prefs }).eq("id", user.id);
  revalidatePath("/app/settings");
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return redirect("/login");

  await supabase
    .from("profiles")
    .update({ first_name: "[deleted]", timezone: "UTC", last_active_at: null })
    .eq("id", user.id);

  const couple = await getMyCouple();
  if (couple) {
    if (couple.member1 === user.id && couple.member2) {
      await supabase.from("couples").update({ member1: couple.member2, member2: null }).eq("id", couple.id);
    } else if (couple.member2 === user.id) {
      await supabase.from("couples").update({ member2: null }).eq("id", couple.id);
    } else {
      await supabase.from("couples").delete().eq("id", couple.id);
    }
  }

  // Delete the auth user so credentials can't be reused after account deletion
  const admin = createAdminClient();
  if (admin) {
    await admin.auth.admin.deleteUser(user.id);
  }

  await supabase.auth.signOut();
  redirect("/");
}
