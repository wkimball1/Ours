import { saveSettingsAction, changePasswordAction, deleteAccountAction, leavePartnerAction, uploadAvatarAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { ThemePicker } from "@/components/theme-picker";

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
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const partnerId = couple
    ? couple.member1 === user.id ? couple.member2 : couple.member1
    : null;
  const { data: partnerProfile } = partnerId
    ? await supabase.from("profiles").select("first_name, avatar_url").eq("id", partnerId).single()
    : { data: null };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
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

      <ThemePicker />

      <form action={uploadAvatarAction} encType="multipart/form-data" className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Your photo</h3>
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="Your photo" className="h-16 w-16 rounded-full object-cover ring-2 ring-stone-200 dark:ring-stone-700" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-2xl dark:bg-stone-800">🤍</div>
          )}
          <div className="flex-1">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">Upload a new photo</span>
              <input name="avatar" type="file" accept="image/*" className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-stone-400 dark:file:bg-stone-700 dark:file:text-stone-200" />
            </label>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Max 1 MB. Your partner will see this on their home screen.</p>
          </div>
        </div>
        <button className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold btn-accent transition">Save photo</button>
      </form>

      <form action={saveSettingsAction} className="space-y-4">
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
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

        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
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

      <form action={changePasswordAction} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
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
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-800 dark:bg-stone-900">
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
          <form action={leavePartnerAction}>
            <button
              type="submit"
              className="min-h-11 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-stone-800 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              Leave partner
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-800 dark:bg-stone-900">
        <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Delete account</h3>
        <p className="text-sm text-stone-600 dark:text-stone-300">This will remove your profile and unlink you from your shared space. Your partner will keep access to shared memories and content.</p>
        <form action={deleteAccountAction}>
          <button
            type="submit"
            className="min-h-11 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-700 dark:bg-stone-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete my account
          </button>
        </form>
      </div>
    </section>
  );
}
