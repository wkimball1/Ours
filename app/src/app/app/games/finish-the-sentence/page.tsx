import { createClient } from "@/lib/supabase/server";
import { getMyData, getPartnerId, getDayOfYear, getSubscriptionInfo } from "@/lib/ours";
import { FinishTheSentenceForm } from "@/components/finish-the-sentence-form";
import { PaywallGate } from "@/components/paywall-gate";

export default async function FinishTheSentencePage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { premium } = await getSubscriptionInfo(couple.id);
  if (!premium) return <PaywallGate feature="Finish the Sentence" />;

  const { data: prompts } = await supabase
    .from("finish_sentence_prompts")
    .select("*")
    .eq("is_active", true)
    .order("day_index");

  if (!prompts?.length) {
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Finish the Sentence</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">New prompts are coming soon! Check back shortly.</p>
      </section>
    );
  }

  const dayOfYear = getDayOfYear();
  const todaysPrompt = prompts[(dayOfYear - 1) % prompts.length];
  const today = new Date().toISOString().slice(0, 10);
  const partnerId = getPartnerId(couple, user.id);

  const [{ data: myAnswer }, { data: partnerAnswer }, { data: partnerProfile }, { data: myProfile }] = await Promise.all([
    supabase
      .from("finish_sentence_answers")
      .select("answer_text")
      .eq("couple_id", couple.id)
      .eq("user_id", user.id)
      .eq("session_date", today)
      .maybeSingle(),
    partnerId
      ? supabase
          .from("finish_sentence_answers")
          .select("answer_text")
          .eq("couple_id", couple.id)
          .eq("user_id", partnerId)
          .eq("session_date", today)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    partnerId
      ? supabase.from("profiles").select("first_name").eq("id", partnerId).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
  ]);

  const partnerName = partnerProfile?.first_name || "Your partner";
  const myName = myProfile?.first_name || "You";
  const bothAnswered = !!myAnswer && !!partnerAnswer;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Finish the Sentence</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Complete the thought. Your partner can&apos;t see yours until they write theirs.</p>
      </div>

      {bothAnswered && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Both answered — here&apos;s what you both wrote.</p>
        </div>
      )}

      <FinishTheSentenceForm
        promptId={todaysPrompt.id}
        promptText={todaysPrompt.prompt_text}
        myAnswer={myAnswer?.answer_text ?? null}
        partnerAnswer={bothAnswered ? partnerAnswer!.answer_text : null}
        partnerName={partnerName}
        myName={myName}
        hasPartner={!!partnerId}
      />
    </section>
  );
}
