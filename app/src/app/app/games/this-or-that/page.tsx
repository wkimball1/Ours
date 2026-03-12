import { createClient } from "@/lib/supabase/server";
import { getMyData, getPartnerId } from "@/lib/ours";
import { ThisOrThatGame } from "@/components/this-or-that-game";

export default async function ThisOrThatPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { data: questions } = await supabase
    .from("this_or_that_questions")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("created_at");

  if (!questions?.length) {
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">This or That</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">New questions are coming soon! Check back shortly to start playing This or That together.</p>
      </section>
    );
  }

  const partnerId = getPartnerId(couple, user.id);

  const [{ data: myAnswers }, { data: partnerAnswers }] = await Promise.all([
    supabase.from("this_or_that_answers").select("question_id, choice, guess").eq("couple_id", couple.id).eq("user_id", user.id),
    partnerId
      ? supabase.from("this_or_that_answers").select("question_id, choice, guess").eq("couple_id", couple.id).eq("user_id", partnerId)
      : Promise.resolve({ data: [] }),
  ]);

  const myMap = Object.fromEntries((myAnswers ?? []).map((a) => [a.question_id, a.choice]));
  const myGuessMap = Object.fromEntries((myAnswers ?? []).filter((a) => a.guess).map((a) => [a.question_id, a.guess]));
  const partnerMap = Object.fromEntries((partnerAnswers ?? []).map((a) => [a.question_id, a.choice]));
  const partnerGuessMap = Object.fromEntries((partnerAnswers ?? []).filter((a) => a.guess).map((a) => [a.question_id, a.guess]));

  const totalAnswered = Object.keys(myMap).length;
  const totalQuestions = questions.length;
  const matchCount = Object.entries(myMap).filter(([qId, choice]) => partnerMap[qId] === choice).length;
  const bothAnsweredCount = Object.keys(myMap).filter((qId) => partnerMap[qId]).length;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">This or That</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Quick picks. No wrong answers — just fun ones.</p>
      </div>

      {bothAnsweredCount > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Compatibility so far</p>
          <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-stone-100">
            {Math.round((matchCount / bothAnsweredCount) * 100)}%
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
            You matched on {matchCount} of {bothAnsweredCount} questions both answered
          </p>
        </div>
      )}

      <p className="text-sm text-stone-500 dark:text-stone-400">{totalAnswered} of {totalQuestions} answered</p>

      <ThisOrThatGame
        questions={questions}
        myAnswers={myMap}
        myGuesses={myGuessMap}
        partnerAnswers={partnerMap}
        partnerGuesses={partnerGuessMap}
        hasPartner={!!partnerId}
      />
    </section>
  );
}
