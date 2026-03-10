import { saveSettingsAction, changePasswordAction, deleteAccountAction } from "@/app/actions";
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
