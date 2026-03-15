import { saveSettingsAction, changePasswordAction, deleteAccountAction, leavePartnerAction, saveNotificationPrefsAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { ThemePicker } from "@/components/theme-picker";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { AvatarUpload } from "@/components/avatar-upload";
import { ConfirmDangerAction } from "@/components/confirm-danger-action";
import { SubmitButton } from "@/components/submit-button";

const tzSuggestions = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createClient();
  const { user, couple } = await getMyData();
  if (!user) return <p>Sign in first.</p>;

  const params = await searchParams;
  const { data: profile } = await supabase.from("profiles").select("*, notification_prefs").eq("id", user.id).single();
  const notifPrefs = (profile?.notification_prefs ?? {}) as Record<string, boolean>;

  const partnerId = couple
    ? couple.member1 === user.id ? couple.member2 : couple.member1
    : null;
  const { data: partnerProfile } = partnerId
    ? await supabase.from("profiles").select("first_name, avatar_url").eq("id", partnerId).single()
    : { data: null };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Settings</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Keep this simple: your name/timezone for daily timing, and optional relationship dates for context.</p>
      </div>

      {params.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {params.error}
        </div>
      )}
      {params.success === "password" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Password updated successfully.
        </div>
      )}

      <DarkModeToggle />

      <ThemePicker />

      <AvatarUpload currentAvatarUrl={profile?.avatar_url ?? null} />

      <form action={saveSettingsAction} className="space-y-4">
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Profile</h3>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">First name</span>
            <input
              name="first_name"
              defaultValue={profile?.first_name ?? ""}
              placeholder="e.g., Will"
              autoComplete="given-name"
              className="w-full rounded-lg border px-3 py-2.5 text-[16px]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Timezone</span>
            <input
              name="timezone"
              list="tz-options"
              defaultValue={profile?.timezone ?? "America/New_York"}
              placeholder="e.g., America/New_York"
              className="w-full rounded-lg border px-3 py-2.5 text-[16px]"
            />
            <datalist id="tz-options">
              {tzSuggestions.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
            <p className="text-xs text-stone-500 dark:text-stone-400">Use IANA timezone format (example: America/New_York).</p>
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Relationship dates (optional)</h3>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Relationship start date</span>
            <input
              name="relationship_start_date"
              type="date"
              defaultValue={couple?.relationship_start_date ?? ""}
              className="w-full rounded-lg border px-3 py-2.5 text-[16px]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Next visit date</span>
            <input
              name="next_visit_date"
              type="date"
              defaultValue={couple?.next_visit_date ?? ""}
              className="w-full rounded-lg border px-3 py-2.5 text-[16px]"
            />
            <p className="text-xs text-stone-500 dark:text-stone-400">Shown on your dashboard as a gentle countdown anchor.</p>
          </label>
        </div>

        <button className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold btn-accent transition">
          Save settings
        </button>
      </form>

      <form action={saveNotificationPrefsAction} className="space-y-4 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Email notifications</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">Choose which email notifications you receive. You'll always see everything in-app.</p>
        {[
          { name: "email_love_note", label: "Love notes", description: "When your partner leaves you a note" },
          { name: "email_reassurance", label: "Reassurance", description: "Care requests and comforting messages" },
          { name: "email_session_unlocked", label: "Session unlocked", description: "When your daily or weekly session unlocks" },
        ].map((pref) => (
          <label key={pref.name} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name={pref.name}
              defaultChecked={notifPrefs[pref.name] !== false}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 accent-[var(--accent)] dark:border-stone-600"
            />
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{pref.label}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{pref.description}</p>
            </div>
          </label>
        ))}
        <SubmitButton
          pendingText="Saving…"
          className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold btn-accent transition"
        >
          Save notification preferences
        </SubmitButton>
      </form>

      <form action={changePasswordAction} className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Change password</h3>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-800 dark:text-stone-200">New password</span>
          <input
            name="new_password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className="w-full rounded-lg border px-3 py-2.5 text-[16px]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Confirm new password</span>
          <input
            name="confirm_password"
            type="password"
            required
            minLength={6}
            placeholder="Type it again"
            autoComplete="new-password"
            className="w-full rounded-lg border px-3 py-2.5 text-[16px]"
          />
        </label>
        <button className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold btn-accent transition">
          Update password
        </button>
      </form>

      {couple?.member2 && (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-card p-5 shadow-sm dark:border-amber-800">
          <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400">Leave partner</h3>
          {partnerProfile?.avatar_url ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partnerProfile.avatar_url} alt={partnerProfile.first_name ?? "Partner"} className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-200 dark:ring-amber-700" />
              <p className="text-sm text-stone-600 dark:text-stone-300">Currently linked with <strong>{partnerProfile.first_name || "your partner"}</strong>.</p>
            </div>
          ) : (
            <p className="text-sm text-stone-600 dark:text-stone-300">Currently linked with <strong>{partnerProfile?.first_name || "your partner"}</strong>.</p>
          )}
          <p className="text-sm text-stone-600 dark:text-stone-300">You&apos;ll be unlinked from this shared space. Your account stays — you can start a new space or join a new one with a fresh invite.</p>
          <ConfirmDangerAction
            buttonLabel="Leave partner"
            confirmLabel="Yes, leave"
            action={leavePartnerAction}
            variant="amber"
          />
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-red-200 bg-card p-5 shadow-sm dark:border-red-800">
        <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Delete account</h3>
        <p className="text-sm text-stone-600 dark:text-stone-300">This will remove your profile and unlink you from your shared space. Your partner will keep access to shared memories and content.</p>
        <ConfirmDangerAction
          buttonLabel="Delete my account"
          confirmLabel="Permanently delete"
          requireTyping="DELETE"
          action={deleteAccountAction}
          variant="red"
        />
      </div>
    </section>
  );
}
