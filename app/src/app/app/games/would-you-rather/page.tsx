import { createClient } from "@/lib/supabase/server";
import { getMe, getMyCouple, getPartnerId } from "@/lib/ours";
import { WouldYouRatherCard } from "@/components/would-you-rather-card";

export default async function WouldYouRatherPage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const { data: questions } = await supabase
    .from("would_you_rather_questions")
    .select("*")
    .eq("is_active", true)
    .order("day_index");

  if (!questions?.length) {
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Would You Rather</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">New questions are on the way! Check back soon for your first Would You Rather.</p>
      </section>
    );
  }

  const todaysQuestion = questions[(dayOfYear - 1) % questions.length];
  const partnerId = await getPartnerId(couple, user.id);

  const { data: myAnswer } = await supabase
    .from("would_you_rather_answers")
    .select("choice, guess")
    .eq("couple_id", couple.id)
    .eq("user_id", user.id)
    .eq("question_id", todaysQuestion.id)
    .maybeSingle();

  const { data: partnerAnswer } = partnerId
    ? await supabase
        .from("would_you_rather_answers")
        .select("choice, guess")
        .eq("couple_id", couple.id)
        .eq("user_id", partnerId)
        .eq("question_id", todaysQuestion.id)
        .maybeSingle()
    : { data: null };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Would You Rather</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Today&apos;s question. Answer honestly — no peeking.</p>
      </div>

      <WouldYouRatherCard
        question={todaysQuestion}
        myChoice={myAnswer?.choice ?? null}
        myGuess={myAnswer?.guess ?? null}
        partnerChoice={partnerAnswer?.choice ?? null}
        partnerGuess={partnerAnswer?.guess ?? null}
        hasPartner={!!partnerId}
      />
    </section>
  );
}
