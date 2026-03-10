import { acceptInviteAction } from "@/app/actions";
import Link from "next/link";
import { getMe } from "@/lib/ours";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    error?: string;
    source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const user = await getMe();
  const error = sp.error ? decodeURIComponent(sp.error) : null;
  const source = sp.source || "invite_link";

  const query = new URLSearchParams({
    source,
    invite: token,
    utm_source: sp.utm_source || "",
    utm_medium: sp.utm_medium || "",
    utm_campaign: sp.utm_campaign || "",
    utm_content: sp.utm_content || "",
    utm_term: sp.utm_term || "",
  });

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">You’ve been invited to Ours</h1>
      <p className="mt-2 text-sm text-stone-600">When you’re ready, accept and connect.</p>

      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {user ? (
        <form action={acceptInviteAction} className="mt-6 space-y-3">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="utm_source" value={sp.utm_source || ""} />
          <input type="hidden" name="utm_medium" value={sp.utm_medium || ""} />
          <input type="hidden" name="utm_campaign" value={sp.utm_campaign || ""} />
          <input type="hidden" name="utm_content" value={sp.utm_content || ""} />
          <input type="hidden" name="utm_term" value={sp.utm_term || ""} />
          <button className="btn-accent w-full rounded-lg p-2">Accept invite</button>
        </form>
      ) : (
        <div className="mt-6 space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-sm text-stone-700">Create an account (or log in) first, then we’ll bring you right back to this invite.</p>
          <div className="flex gap-2">
            <Link className="btn-accent flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium" href={`/signup?${query.toString()}`}>
              Create account
            </Link>
            <Link className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-center text-sm font-medium text-stone-900" href={`/login?${query.toString()}`}>
              Log in
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
