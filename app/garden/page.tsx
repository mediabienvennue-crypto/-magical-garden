"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import SubjectTree from "@/components/garden/SubjectTree";

interface TreeRow {
  id: string;
  subject_slug: string;
  subject_name_ar: string;
  base_color: string;
  xp: number;
  health: "healthy" | "withering" | "withered";
}

export default function GardenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
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
        .select("id, first_name")
        .eq("parent_id", userData.user.id)
        .order("created_at", { ascending: true })
        .limit(1);
      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        router.replace("/onboarding");
        return;
      }

      setStudentName(students[0].first_name);

      const { data: treeRows, error: treesError } = await supabase
        .from("student_trees_view")
        .select("id, subject_slug, subject_name_ar, base_color, xp, health")
        .eq("student_id", students[0].id);
      if (treesError) throw treesError;

      setTrees(treeRows ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذّر تحميل الحديقة";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center">
        <span className="text-4xl animate-leaf-sway block mb-3">🌳</span>
        <p className="text-xs text-slate-500">جارٍ فتح حديقتك…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden pb-16">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #DCEFF7 0%, #EAF6EE 28%, var(--paper) 55%, var(--paper) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(120% 100% at 20% 100%, var(--forest-100) 0%, transparent 60%), radial-gradient(120% 100% at 80% 100%, var(--water-100) 0%, transparent 60%)",
        }}
      />
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[var(--fruit-100)] blur-2xl -z-10 opacity-70 sm:w-56 sm:h-56" />

      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-[var(--forest-100)] px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)]">
            حديقة {studentName || "البطل"} السحرية 🌳
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">اسقِ أشجارك بالتقدّم في دروسك اليومية</p>
        </div>
        <nav className="flex gap-2">
          <NavButton onClick={() => router.push("/subjects")} label="خريطة المواد" emoji="🗺️" />
          <NavButton onClick={() => router.push("/report")} label="تقريري" emoji="📋" />
          <NavButton onClick={() => router.push("/quiz")} label="تحدٍّ جديد" emoji="🎯" />
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        {error && (
          <div className="p-4 rounded-xl text-xs font-bold mb-6 text-center bg-rose-50 text-rose-700 border border-rose-100">
            {error}
          </div>
        )}

        {trees.length === 0 && !error ? (
          <div className="text-center py-16 sm:py-20">
            <span className="text-5xl block mb-4">🌱</span>
            <p className="text-sm text-slate-500 px-4">
              لم تُزرَع أي شجرة بعد. أكمل تحدياً في{" "}
              <button onClick={() => router.push("/subjects")} className="text-[var(--forest-600)] font-bold underline">
                خريطة المواد
              </button>{" "}
              لتظهر أول شجرة هنا.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {trees.map((tree) => (
              <SubjectTree
                key={tree.id}
                subjectName={tree.subject_name_ar}
                health={tree.health}
                xp={tree.xp}
                fruitColor={tree.base_color}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function NavButton({ onClick, label, emoji }: { onClick: () => void; label: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-bold text-[var(--dusk-800)] bg-[var(--dusk-100)] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl hover:bg-[var(--dusk-100)]/70 transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
    >
      <span>{emoji}</span><span>{label}</span>
    </button>
  );
}