import { createClient } from "@/lib/supabase/server";
import { getMyData, getPartnerId, getDayOfYear, getSubscriptionInfo } from "@/lib/ours";
import { ThisOrThatGame } from "@/components/this-or-that-game";
import { DailyPickCard } from "@/components/daily-pick-card";
import { PaywallGate } from "@/components/paywall-gate";

export default async function ThisOrThatPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { premium } = await getSubscriptionInfo(couple.id);
  if (!premium) return <PaywallGate feature="This or That" />;

  const { data: allQuestions } = await supabase
    .from("this_or_that_questions")
    .select("*")
    .eq("is_active", true)
    .order("day_index", { nullsFirst: false })
    .order("category")
    .order("created_at");

  if (!allQuestions?.length) {
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">This or That</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">New questions are coming soon! Check back shortly to start playing.</p>
      </section>
    );
  }

  // Today's featured question: pick from daily-indexed questions using day-of-year rotation
  const dailyQuestions = allQuestions.filter((q) => q.day_index != null);
  const catalogQuestions = allQuestions.filter((q) => q.day_index == null);
  const dayOfYear = getDayOfYear();
  const todaysQuestion = dailyQuestions.length > 0 ? dailyQuestions[(dayOfYear - 1) % dailyQuestions.length] : null;

  const partnerId = getPartnerId(couple, user.id);

  const [{ data: myAnswers }, { data: partnerAnswers }, { data: partnerProfile }] = await Promise.all([
    supabase.from("this_or_that_answers").select("question_id, choice, guess").eq("couple_id", couple.id).eq("user_id", user.id),
    partnerId
      ? supabase.from("this_or_that_answers").select("question_id, choice, guess").eq("couple_id", couple.id).eq("user_id", partnerId)
      : Promise.resolve({ data: [] }),
    partnerId
      ? supabase.from("profiles").select("first_name").eq("id", partnerId).single()
      : Promise.resolve({ data: null }),
  ]);

  const myMap = Object.fromEntries((myAnswers ?? []).map((a) => [a.question_id, a.choice]));
  const myGuessMap = Object.fromEntries((myAnswers ?? []).filter((a) => a.guess).map((a) => [a.question_id, a.guess]));
  const partnerMap = Object.fromEntries((partnerAnswers ?? []).map((a) => [a.question_id, a.choice]));
  const partnerGuessMap = Object.fromEntries((partnerAnswers ?? []).filter((a) => a.guess).map((a) => [a.question_id, a.guess]));

  const partnerName = partnerProfile?.first_name || "Your partner";

  const totalAnswered = Object.keys(myMap).length;
  const totalQuestions = allQuestions.length;
  const matchCount = Object.entries(myMap).filter(([qId, choice]) => partnerMap[qId] === choice).length;
  const bothAnsweredCount = Object.keys(myMap).filter((qId) => partnerMap[qId]).length;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">This or That</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Preferences, hypotheticals, and the occasional curveball.</p>
      </div>

      {bothAnsweredCount > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Compatibility so far</p>
          <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-stone-100">
            {Math.round((matchCount / bothAnsweredCount) * 100)}%
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            You matched on {matchCount} of {bothAnsweredCount} questions both answered
          </p>
        </div>
      )}

      {todaysQuestion && (
        <DailyPickCard
          question={todaysQuestion}
          myChoice={myMap[todaysQuestion.id] ?? null}
          myGuess={myGuessMap[todaysQuestion.id] ?? null}
          partnerChoice={partnerMap[todaysQuestion.id] ?? null}
          partnerName={partnerName}
          hasPartner={!!partnerId}
        />
      )}

      <p className="text-sm text-stone-500 dark:text-stone-400">{totalAnswered} of {totalQuestions} answered</p>

      <ThisOrThatGame
        questions={catalogQuestions}
        myAnswers={myMap}
        myGuesses={myGuessMap}
        partnerAnswers={partnerMap}
        partnerGuesses={partnerGuessMap}
        hasPartner={!!partnerId}
      />
    </section>
  );
}
