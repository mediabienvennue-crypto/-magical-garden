"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Lesson {
  id: string; title: string; isLocked: boolean; isCompleted: boolean; rewardXp: number;
}

interface SubjectQuest {
  id: string; name: string; emoji: string; worldName: string; bgGradient: string; lessons: Lesson[];
}

export default function SubjectsPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("محمد");
  const [studentLevel, setStudentLevel] = useState("الثالث الابتدائي");

  const [subjects] = useState<SubjectQuest[]>([
    {
      id: "sub-math", name: "الرياضيات", emoji: "📐", worldName: "مملكة الأرقام السحرية 🏰", bgGradient: "from-amber-400 to-orange-500",
      lessons: [
        { id: "m1", title: "المهمة 1: أسرار جدول الضرب والقسمة 🧠", isLocked: false, isCompleted: true, rewardXp: 30 },
        { id: "m2", title: "المهمة 2: مغامرة الكسور والأعداد العشرية 🧮", isLocked: false, isCompleted: false, rewardXp: 40 },
        { id: "m3", title: "المهمة 3: لغز زوايا الأشكال الهندسية 📐", isLocked: true, isCompleted: false, rewardXp: 50 },
      ]
    },
    {
      id: "sub-sci", name: "العلوم", emoji: "🌿", worldName: "غابة الاستكشاف الحيوي 🌳", bgGradient: "from-emerald-400 to-teal-600",
      lessons: [
        { id: "s1", title: "المهمة 1: رحلة الدورة المائية في الطبيعة 💧", isLocked: false, isCompleted: false, rewardXp: 35 },
        { id: "s2", title: "المهمة 2: لغز مكونات النبتة السحرية 🌱", isLocked: true, isCompleted: false, rewardXp: 45 },
      ]
    },
    {
      id: "sub-ara", name: "اللغة العربية", emoji: "📘", worldName: "واحة الكلمات الذهبية 🌴", bgGradient: "from-sky-400 to-blue-600",
      lessons: [
        { id: "a1", title: "المهمة 1: إعراب جملة سقى البستاني الشجرة ✍️", isLocked: false, isCompleted: true, rewardXp: 30 },
        { id: "a2", title: "المهمة 2: رادار التمييز بين الفعل والفاعل 📘", isLocked: false, isCompleted: false, rewardXp: 35 },
      ]
    }
  ]);

  useEffect(() => {
    const savedData = localStorage.getItem("child_onboarding");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.name) setStudentName(parsed.name);
      if (parsed.academicLevel) setStudentLevel(parsed.academicLevel);
    }
  }, []);

  function handleStartLesson(lesson: Lesson, subjectName: string) {
    if (lesson.isLocked) {
      alert("🔒 هذه المهمة التعليمية مغلقة حالياً! أكمل التحدي السابق بنجاح لتفتح هذا المستوى!");
      return;
    }
    router.push("/quiz");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-sky-50 to-emerald-50 p-6 flex flex-col items-center select-none text-right" dir="rtl">
      
      {/* 🌟 التحديث التربوي الجديد في العبارات الفرعية والترحيبية */}
      <header className="w-full max-w-4xl text-center my-8 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">🗺️ خريطة مغامرات البطل(ة) {studentName}</h1>
          <p className="text-xs text-slate-600 font-bold mt-1">اختر المادة لّي بغيتي، كمل المهمة، وربح ماء سحري لتكبير حديقتك! 💦✨</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md">
          المستوى الحالي: {studentLevel} 🎒
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full px-2">
        {subjects.map((sub) => (
          <div key={sub.id} className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col overflow-hidden relative group">
            <div className={`w-full bg-gradient-to-r ${sub.bgGradient} p-4 rounded-2xl text-white relative mb-4 shadow-sm`}>
              <span className="text-3xl absolute -left-2 -bottom-2 opacity-20 transform scale-150">{sub.emoji}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{sub.emoji}</span>
                <h3 className="text-base font-black tracking-tight">{sub.name}</h3>
              </div>
              <p className="text-[10px] font-bold text-white/90 mt-1">{sub.worldName}</p>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-start">
              {sub.lessons.map((lesson) => {
                let borderClass = "border-slate-100 bg-slate-50/40 text-slate-700";
                let statusBadge = "🔒 مقفول";
                let badgeColor = "bg-slate-100 text-slate-500";

                if (lesson.isCompleted) {
                  borderClass = "border-emerald-200 bg-emerald-50/30 text-emerald-950";
                  statusBadge = "✅ مكتمل";
                  badgeColor = "bg-emerald-100 text-emerald-800";
                } else if (!lesson.isLocked) {
                  borderClass = "border-sky-200 bg-sky-50/40 text-sky-950 hover:bg-sky-50 transition-colors cursor-pointer shadow-sm animate-pulse [animation-duration:3s]";
                  statusBadge = "🔓 ابدأ المهمة";
                  badgeColor = "bg-sky-500 text-white";
                }

                return (
                  <div key={lesson.id} onClick={() => handleStartLesson(lesson, sub.name)} className={`p-3.5 rounded-2xl border text-xs font-bold flex justify-between items-center transition-all ${borderClass}`}>
                    <div className="flex-1 pl-2">
                      <p className="leading-tight">{lesson.title}</p>
                      <span className="text-[10px] font-black text-amber-600 mt-1 block">+{lesson.rewardXp} نقطة ماء 💧</span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>{statusBadge}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => router.push("/garden")} className="mt-10 bg-slate-900 text-white font-black text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-md">
        رجوع للحديقة السحرية 🌳
      </button>
    </main>
  );
}
