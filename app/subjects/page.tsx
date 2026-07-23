"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

interface TreeRow {
  id: string;
  subject_slug: string;
  subject_name_ar: string;
  base_color: string;
  xp: number;
  health: "healthy" | "withering" | "withered";
  current_streak_days: number;
}

const XP_CAP = 500;

const HEALTH_LABEL: Record<TreeRow["health"], string> = {
  healthy: "🌳 مزدهرة",
  withering: "🍂 تحتاج سقياً",
  withered: "🥀 ذابلة، أنقذها!",
};

export default function SubjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [levelNameAr, setLevelNameAr] = useState("");
  const [trees, setTrees] = useState<TreeRow[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/auth");
        return;
      }

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, level_id")
        .eq("parent_id", userData.user.id)
        .order("created_at", { ascending: true })
        .limit(1);
      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        router.replace("/onboarding");
        return;
      }

      setStudentName(students[0].first_name);

      const { data: level } = await supabase
        .from("levels")
        .select("name_ar")
        .eq("id", students[0].level_id)
        .single();
      if (level) setLevelNameAr(level.name_ar);

      const { data: treeRows, error: treesError } = await supabase
        .from("student_trees_view")
        .select("id, subject_slug, subject_name_ar, base_color, xp, health, current_streak_days")
        .eq("student_id", students[0].id);
      if (treesError) throw treesError;

      setTrees(treeRows ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذّر تحميل المواد";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <span className="text-3xl animate-pulse">🗺️</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] pb-16">
      <header className="w-full bg-white border-b border-[var(--forest-100)] px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)]">
            🗺️ خريطة مغامرات {studentName || "البطل"}
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            اختر مادة وابدأ تحدياً جديداً لتسقي شجرتها
          </p>
        </div>
        {levelNameAr && (
          <span className="text-xs font-bold bg-[var(--dusk-100)] text-[var(--dusk-800)] px-3.5 py-2 rounded-xl self-start sm:self-auto">
            المستوى الحالي: {levelNameAr} 🎒
          </span>
        )}
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        {error && (
          <div className="p-4 rounded-xl text-xs font-bold mb-6 text-center bg-rose-50 text-rose-700 border border-rose-100">
            {error}
          </div>
        )}

        {trees.length === 0 && !error ? (
          <p className="text-center text-sm text-slate-500 py-16">
            لا توجد مواد مرتبطة بحسابك بعد.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {trees.map((tree) => {
              const progress = Math.min(100, Math.round((tree.xp / XP_CAP) * 100));
              return (
                <div
                  key={tree.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-[var(--forest-100)] flex flex-col"
                >
                  <div
                    className="w-full p-4 rounded-2xl text-white mb-4 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${tree.base_color}, ${tree.base_color}CC)`,
                    }}
                  >
                    <h3 className="text-base font-black">{tree.subject_name_ar}</h3>
                    <p className="text-[11px] font-bold text-white/90 mt-1">
                      {HEALTH_LABEL[tree.health]}
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-1.5">
                      <span>XP {tree.xp}</span>
                      {tree.current_streak_days > 0 && (
                        <span className="text-[var(--fruit-600)]">🔥 {tree.current_streak_days} يوم متتالٍ</span>
                      )}
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: tree.base_color }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/quiz?subject=${tree.subject_slug}`)}
                    className="w-full mt-4 bg-[var(--forest-600)] text-white font-bold text-xs py-3 rounded-xl hover:bg-[var(--forest-700)] transition-colors"
                  >
                    ابدأ تحدياً جديداً 🎯
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="text-center mt-10">
        <button
          type="button"
          onClick={() => router.push("/garden")}
          className="bg-[var(--dusk-800)] text-white font-bold text-xs px-6 py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          رجوع للحديقة السحرية 🌳
        </button>
      </div>
    </main>
  );
}