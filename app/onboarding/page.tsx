"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

const FRUITS = [
  { name: "التفاح", emoji: "🍏" },
  { name: "الموز", emoji: "🍌" },
  { name: "البرتقال", emoji: "🍊" },
  { name: "العنب", emoji: "🍇" },
  { name: "الفراولة", emoji: "🍓" },
];

const LEVELS = [
  { slug: "primary-1", label: "الأول الابتدائي" },
  { slug: "primary-2", label: "الثاني الابتدائي" },
  { slug: "primary-3", label: "الثالث الابتدائي" },
  { slug: "primary-4", label: "الرابع الابتدائي" },
  { slug: "primary-5", label: "الخامس الابتدائي" },
  { slug: "primary-6", label: "السادس الابتدائي" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [favoriteFruit, setFavoriteFruit] = useState("");
  const [dreamJob, setDreamJob] = useState("");
  const [levelSlug, setLevelSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth");
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  function describeError(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null) {
      const e = err as { message?: string; details?: string; hint?: string; code?: string };
      const parts = [e.code, e.message, e.details, e.hint].filter(Boolean);
      if (parts.length > 0) return parts.join(" | ");
      return JSON.stringify(err);
    }
    return "تعذّر حفظ البيانات، يرجى المحاولة من جديد";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !age || !favoriteFruit || !dreamJob || !levelSlug) {
      setError("يرجى إكمال جميع الحقول قبل المتابعة");
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const parentId = userData.user?.id;
      if (!parentId) throw new Error("انتهت الجلسة، يرجى تسجيل الدخول من جديد");

      const { data: level, error: levelError } = await supabase
        .from("levels")
        .select("id")
        .eq("slug", levelSlug)
        .single();

      if (levelError || !level) {
        throw new Error(
          `تعذّر تحديد المستوى: ${levelError ? describeError(levelError) : "لا توجد نتيجة"} (slug: ${levelSlug})`
        );
      }

      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert({ parent_id: parentId, level_id: level.id, first_name: name })
        .select("id")
        .single();
      if (studentError || !student) throw studentError ?? new Error("تعذّر إنشاء ملف الطالب");

      const { error: onboardingError } = await supabase
        .from("onboarding_responses")
        .insert({
          student_id: student.id,
          age: Number(age),
          favorite_fruit: favoriteFruit,
          dream_job: dreamJob,
        });
      if (onboardingError) throw onboardingError;

      router.push("/garden");
    } catch (err: unknown) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <span className="text-3xl animate-pulse">🌱</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[var(--forest-100)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[var(--forest-500)]" />

        <header className="text-center mb-8">
          <span className="text-4xl block mb-2">🌱</span>
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">
            هيّئ حديقتك السحرية
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            أجب عن هذه الأسئلة القصيرة لتبدأ رحلة التعلّم واللعب
          </p>
        </header>

        {error && (
          <div className="p-3 rounded-xl text-xs font-bold mb-5 text-center bg-rose-50 text-rose-700 border border-rose-100 break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="ما اسمك أيها البطل؟ ✨">
            <input
              type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: محمد أو مريم"
              className={inputClass}
            />
          </Field>

          <Field label="كم عمرك الآن؟ 🎂">
            <input
              type="number" required min={5} max={13} value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="مثال: 10"
              className={inputClass}
            />
          </Field>

          <Field label="في أي مستوى دراسي أنت؟ 🎒">
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.slug} type="button"
                  onClick={() => setLevelSlug(lvl.slug)}
                  className={`p-3 rounded-xl border text-[11px] font-bold transition-all text-center ${
                    levelSlug === lvl.slug
                      ? "border-[var(--water-600)] bg-[var(--water-100)] text-[var(--water-600)] shadow-sm"
                      : "border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="ماذا تحب أن تصبح في المستقبل؟ 🚀">
            <input
              type="text" required value={dreamJob}
              onChange={(e) => setDreamJob(e.target.value)}
              placeholder="مثال: مهندس، طبيبة، رائد فضاء"
              className={inputClass}
            />
          </Field>

          <Field label="اختر ثمرتك السحرية المفضلة 🍓">
            <div className="flex gap-2 flex-wrap justify-center">
              {FRUITS.map((f) => (
                <button
                  key={f.name} type="button"
                  onClick={() => setFavoriteFruit(f.name)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    favoriteFruit === f.name
                      ? "border-[var(--forest-500)] bg-[var(--forest-100)] text-[var(--forest-700)] shadow-sm"
                      : "border-slate-100 bg-slate-50/30 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{f.emoji}</span><span>{f.name}</span>
                </button>
              ))}
            </div>
          </Field>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-[var(--forest-600)] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[var(--forest-700)] shadow-lg active:scale-[0.98] transition-all mt-6 disabled:opacity-50"
          >
            {submitting ? "جارٍ إنشاء الحديقة…" : "افتح حديقتي وابدأ اللعب 🌳"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full text-sm p-3.5 rounded-xl border border-slate-200 outline-none focus:border-[var(--forest-500)] bg-slate-50/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}