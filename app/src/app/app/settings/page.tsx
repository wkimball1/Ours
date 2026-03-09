import { saveSettingsAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { getMe, getMyCouple } from "@/lib/ours";

const tzSuggestions = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user) return <p>Sign in first.</p>;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Settings</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Keep this simple: your name/timezone for daily timing, and optional relationship dates for context.</p>
      </div>

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

        <button className="min-h-11 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200">
          Save settings
        </button>
      </form>
    </section>
  );
}
