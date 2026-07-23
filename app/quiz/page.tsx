"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import { generateQuizQuestions } from "@/utils/gemini";

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface SubjectOption {
  treeId: string;
  slug: string;
  nameAr: string;
  baseColor: string;
}

type Stage = "loadingProfile" | "pickingSubject" | "loadingQuestions" | "quiz" | "finished";

export default function QuizPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("loadingProfile");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [levelNameAr, setLevelNameAr] = useState("السادس الابتدائي");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption | null>(null);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(35);
  const [isReading, setIsReading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/auth");
        return;
      }

      const { data: students } = await supabase
        .from("students")
        .select("id, first_name, level_id")
        .eq("parent_id", userData.user.id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (!students || students.length === 0) {
        router.replace("/onboarding");
        return;
      }

      const student = students[0];
      setStudentId(student.id);
      setStudentName(student.first_name);

      const { data: level } = await supabase
        .from("levels")
        .select("name_ar")
        .eq("id", student.level_id)
        .single();
      if (level) setLevelNameAr(level.name_ar);

      const { data: trees } = await supabase
        .from("student_trees_view")
        .select("id, subject_slug, subject_name_ar, base_color")
        .eq("student_id", student.id);

      setSubjects(
        (trees ?? []).map((t) => ({
          treeId: t.id,
          slug: t.subject_slug,
          nameAr: t.subject_name_ar,
          baseColor: t.base_color,
        }))
      );
      setStage("pickingSubject");
    }
    loadProfile();
  }, [router]);

  async function startQuiz(subject: SubjectOption) {
    setSelectedSubject(subject);
    setStage("loadingQuestions");
    try {
      const levelForPrompt = levelNameAr.replace(" الابتدائي", "");
      const fetched = await generateQuizQuestions(subject.nameAr, levelForPrompt);
      setQuestions(fetched);
      setCurrentQuestion(0);
      setScore(0);
      setTimeLeft(35);
      setStage("quiz");
    } catch {
      setError("تعذّر تحضير الأسئلة، يرجى المحاولة من جديد");
      setStage("pickingSubject");
    }
  }

  // فترة قراءة قبل بداية العداد التنازلي — تمنح الطفل وقتاً لقراءة السؤال بهدوء
  useEffect(() => {
    if (stage !== "quiz") return;
    setIsReading(true);
    const readingTimer = setTimeout(() => setIsReading(false), 8000);
    return () => clearTimeout(readingTimer);
  }, [stage, currentQuestion]);

  useEffect(() => {
    if (stage !== "quiz" || isReading) return;
    if (timeLeft === 0) {
      handleNextQuestion(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, stage, isReading]);

  async function handleNextQuestion(isCorrect: boolean) {
    const finalScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(finalScore);

    const next = currentQuestion + 1;
    if (next < questions.length) {
      setCurrentQuestion(next);
      setSelectedAnswer("");
      setTimeLeft(35);
      setShowHint(false);
      return;
    }

    setStage("finished");
    if (finalScore > 0 && selectedSubject) {
      setSavingResult(true);
      try {
        await supabase.from("tree_events").insert({
          tree_id: selectedSubject.treeId,
          event_type: "quiz_passed",
          xp_awarded: finalScore * 15,
        });
      } catch {
        // فشل الحفظ لا يمنع الطفل من رؤية نتيجته، لكن لن تُروى الشجرة هذه المرة
      } finally {
        setSavingResult(false);
      }
    }
  }

  function handleAnswerSubmit() {
    if (!selectedAnswer || !questions[currentQuestion]) return;
    handleNextQuestion(selectedAnswer === questions[currentQuestion].correctAnswer);
  }

  if (stage === "loadingProfile") {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <span className="text-3xl animate-pulse">🌱</span>
      </main>
    );
  }

  if (stage === "pickingSubject") {
    return (
      <main className="min-h-screen bg-[var(--paper)] p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[var(--forest-100)]">
          <header className="text-center mb-6">
            <span className="text-4xl block mb-2">🎯</span>
            <h1 className="font-display text-xl font-bold text-[var(--ink)]">
              اختر مادة التحدي يا {studentName || "بطل"}
            </h1>
            <p className="text-xs text-slate-500 mt-2">كل إجابة صحيحة تسقي شجرة هذه المادة</p>
          </header>

          {error && (
            <div className="p-3 rounded-xl text-xs font-bold mb-4 text-center bg-rose-50 text-rose-700 border border-rose-100">
              {error}
            </div>
          )}

          {subjects.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              لا توجد مواد مرتبطة بحسابك بعد. عد إلى الحديقة وأكمل الإعداد أولاً.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => startQuiz(s)}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-[var(--forest-100)] hover:border-[var(--forest-500)] transition-all text-center"
                >
                  <span
                    className="w-8 h-8 rounded-full inline-block mb-2"
                    style={{ backgroundColor: s.baseColor }}
                  />
                  <p className="text-xs font-bold text-slate-800">{s.nameAr}</p>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push("/garden")}
            className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700 mt-6"
          >
            العودة إلى الحديقة
          </button>
        </div>
      </main>
    );
  }

  if (stage === "loadingQuestions") {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center text-center p-6">
        <span className="text-5xl animate-spin block mb-4">🌳</span>
        <h2 className="font-display text-lg font-bold text-[var(--ink)]">جارٍ تحضير أسئلتك…</h2>
        <p className="text-xs text-slate-500 mt-2">يتم إعداد أسئلة مخصصة لمستواك الدراسي ✨</p>
      </main>
    );
  }

  if (stage === "finished") {
    return (
      <main className="min-h-screen bg-[var(--paper)] p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[var(--forest-100)] text-center">
          <span className="text-5xl block mb-4">🏆</span>
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            أحسنت يا {studentName}!
          </h2>
          <p className="text-xs text-slate-500 mt-3 max-w-xs mx-auto leading-relaxed">
            أجبت بشكل صحيح عن {score} من {questions.length} أسئلة في مادة {selectedSubject?.nameAr}.
            {score > 0 && !savingResult && " سقيت شجرتك للتو! 💧"}
            {savingResult && " جارٍ سقي شجرتك…"}
          </p>
          <button
            onClick={() => router.push("/garden")}
            className="w-full bg-[var(--forest-600)] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[var(--forest-700)] shadow-md mt-8"
          >
            العودة إلى الحديقة 🌳
          </button>
        </div>
      </main>
    );
  }

  const q = questions[currentQuestion];
  if (!q) return null;

  return (
    <main className="min-h-screen bg-[var(--paper)] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[var(--forest-100)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[var(--forest-500)]" />

        <header className="mb-4 flex justify-between items-center border-b pb-4 border-slate-100">
          <h1 className="text-sm font-bold text-[var(--ink)]">🎯 تحدي {selectedSubject?.nameAr}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isReading
                  ? "bg-[var(--water-100)] text-[var(--water-600)]"
                  : timeLeft <= 10
                  ? "bg-rose-100 text-rose-600 animate-pulse"
                  : "bg-[var(--fruit-100)] text-[var(--fruit-600)]"
              }`}
            >
              {isReading ? "📖 اقرأ السؤال" : `⏱ ${timeLeft}`}
            </span>
            <span className="text-xs bg-[var(--forest-100)] text-[var(--forest-700)] px-2.5 py-1 rounded-full font-bold">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
        </header>

        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isReading ? "bg-[var(--water-400)]" : timeLeft <= 10 ? "bg-rose-500" : "bg-[var(--fruit-500)]"
            }`}
            style={{ width: isReading ? "100%" : `${(timeLeft / 35) * 100}%` }}
          />
        </div>

        <h2 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-relaxed mb-6">
          {q.questionText}
        </h2>

        <div className="space-y-3">
          {q.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedAnswer(option)}
              className={`w-full text-right p-4 rounded-2xl border text-sm font-bold transition-all ${
                selectedAnswer === option
                  ? "border-[var(--forest-500)] bg-[var(--forest-100)] text-[var(--forest-700)] shadow-sm"
                  : "border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-[11px] font-bold text-[var(--fruit-600)] hover:opacity-80 bg-[var(--fruit-100)] px-3 py-1 rounded-full"
            >
              💡 هل تحتاج مساعدة؟
            </button>
          ) : (
            <div className="p-3 bg-[var(--water-100)] border border-[var(--water-400)]/30 rounded-2xl text-[11px] font-medium text-[var(--water-600)]">
              تلميح: تمعّن في السؤال جيداً، الإجابة الصحيحة من بين الخيارات المتاحة.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAnswerSubmit}
          disabled={!selectedAnswer}
          className="w-full bg-[var(--forest-600)] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[var(--forest-700)] shadow-md mt-6 transition-all disabled:opacity-40"
        >
          تأكيد الإجابة والمتابعة 🚀
        </button>
      </div>
    </main>
  );
}