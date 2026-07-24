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
}

interface ChildRow {
  id: string;
  first_name: string;
  levelNameAr: string;
  trees: TreeRow[];
}

const HEALTH_META: Record<TreeRow["health"], { label: string; badge: string }> = {
  healthy: { label: "بخير", badge: "bg-[var(--forest-100)] text-[var(--forest-700)]" },
  withering: { label: "تحتاج انتباهاً", badge: "bg-[var(--fruit-100)] text-[var(--fruit-600)]" },
  withered: { label: "تحتاج تدخلاً", badge: "bg-rose-100 text-rose-700" },
};

export default function ParentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState<ChildRow[]>([]);
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userData.user.id)
        .single();
      setParentName(profile?.full_name || "");

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, level_id")
        .eq("parent_id", userData.user.id)
        .order("created_at", { ascending: true });
      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      const enriched: ChildRow[] = [];
      for (const s of students) {
        const { data: level } = await supabase
          .from("levels")
          .select("name_ar")
          .eq("id", s.level_id)
          .single();

        const { data: trees } = await supabase
          .from("student_trees_view")
          .select("id, subject_slug, subject_name_ar, base_color, xp, health")
          .eq("student_id", s.id);

        enriched.push({
          id: s.id,
          first_name: s.first_name,
          levelNameAr: level?.name_ar ?? "",
          trees: trees ?? [],
        });
      }
      setChildren(enriched);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذّر تحميل بيانات الأبناء";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <span className="text-3xl animate-pulse">👨‍👩‍👧</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] pb-16">
      <header className="w-full bg-white border-b border-[var(--dusk-100)] px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--dusk-800)]">
            فضاء المتابعة {parentName ? `— ${parentName}` : ""} 👨‍👩‍👧
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">تابع تقدّم أبنائك الدراسي في الحديقة السحرية</p>
        </div>
        <button
          onClick={() => router.push("/pricing")}
          className="text-xs font-bold text-[var(--dusk-800)] bg-[var(--dusk-100)] px-3.5 py-2.5 rounded-xl hover:opacity-80 transition-colors"
        >
          💳 الاشتراك والدفع
        </button>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        {error && (
          <div className="p-4 rounded-xl text-xs font-bold mb-6 text-center bg-rose-50 text-rose-700 border border-rose-100">
            {error}
          </div>
        )}

        {children.length === 0 && !error ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[var(--dusk-100)]">
            <span className="text-5xl block mb-4">🌱</span>
            <p className="text-sm text-slate-600 font-bold mb-2">لا يوجد أبناء مسجّلون بعد</p>
            <p className="text-xs text-slate-500 mb-6">أضف طفلك الأول لتبدأ متابعة رحلته الدراسية</p>
            <button
              onClick={() => router.push("/onboarding")}
              className="bg-[var(--forest-600)] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[var(--forest-700)]"
            >
              إضافة طفل جديد
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {children.map((child) => {
              const weakSubjects = child.trees.filter((t) => t.health !== "healthy");
              return (
                <div key={child.id} className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--dusk-100)]">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-[var(--ink)]">{child.first_name}</h2>
                      {child.levelNameAr && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{child.levelNameAr}</p>
                      )}
                    </div>
                    <button
                      onClick={() => router.push("/report")}
                      className="text-[11px] font-bold text-[var(--water-600)] bg-[var(--water-100)] px-3 py-1.5 rounded-full hover:opacity-80"
                    >
                      📋 التقرير الكامل
                    </button>
                  </div>

                  {child.trees.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      لم يبدأ {child.first_name} أي تحدٍّ بعد.
                    </p>
                  ) : (
                    <>
                      {weakSubjects.length > 0 && (
                        <div className="mb-4 p-3 bg-[var(--fruit-100)] border border-[var(--fruit-500)]/20 rounded-2xl">
                          <p className="text-[11px] font-bold text-[var(--fruit-600)]">
                            ⚠️ {weakSubjects.length === 1 ? "مادة واحدة تحتاج" : `${weakSubjects.length} مواد تحتاج`} تشجيعاً
                            إضافياً: {weakSubjects.map((s) => s.subject_name_ar).join("، ")}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {child.trees.map((tree) => (
                          <div
                            key={tree.id}
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-center"
                          >
                            <p className="text-xs font-bold text-slate-800">{tree.subject_name_ar}</p>
                            <p className="text-[10px] text-slate-500 mt-1">XP {tree.xp}</p>
                            <span
                              className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${HEALTH_META[tree.health].badge}`}
                            >
                              {HEALTH_META[tree.health].label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}