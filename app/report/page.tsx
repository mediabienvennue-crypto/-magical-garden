"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SubjectSkill {
  subjectName: string;
  topic: string;
  status: "strong" | "weak";
  accuracy: number;
  emoji: string;
}

export default function ReportPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("محمد");
  
  // 🌟 إضافة حالة تحديد جنس الطفل (افتراضياً ولد "male") لتبديل صورة المعلم والمعلمة
  const [studentGender, setStudentGender] = useState<"male" | "female">("male");

  const [skills] = useState<SubjectSkill[]>([
    { subjectName: "الرياضيات", topic: "جدول الضرب (7 و 8)", status: "strong", accuracy: 90, emoji: "📐" },
    { subjectName: "الرياضيات", topic: "الأعداد العشرية والكسور", status: "weak", accuracy: 35, emoji: "🧮" },
    { subjectName: "العلوم", topic: "الدورة المائية ف الطبيعة", status: "strong", accuracy: 85, emoji: "💧" },
    { subjectName: "اللغة العربية", topic: "إعراب الفاعل والمفعول به", status: "weak", accuracy: 40, emoji: "📘" },
    { subjectName: "اللغة الفرنسية", topic: "Conjugaison (Présent)", status: "strong", accuracy: 75, emoji: "📝" },
  ]);

  useEffect(() => {
    const savedData = localStorage.getItem("child_onboarding");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.name) setStudentName(parsed.name);
      
      // 🌟 محاولة ذكية لمعرفة جنس الطفل من اسمه أو تحديدها لاحقاً
      const nameStr = parsed.name || "";
      if (nameStr.endsWith("ة") || nameStr.includes("فاطمة") || nameStr.includes("خديجة") || nameStr.includes("مريم") || nameStr.includes("زينب")) {
        setStudentGender("female");
      } else {
        setStudentGender("male");
      }
    }
  }, []);

  const strongPoints = skills.filter((s) => s.status === "strong");
  const weakPoints = skills.filter((s) => s.status === "weak");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 p-6 flex flex-col items-center select-none text-right" dir="rtl">
      
      <header className="w-full max-w-3xl bg-white p-6 rounded-3xl shadow-sm border border-slate-100/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950">دفتر الضعف والقوة التكيفي 🧠📋</h1>
          <p className="text-xs text-slate-500 mt-1">المرافق التربوي الذكي كايحلل تحصيل الطفل الدراسي ويقترح خطة دعم</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-xs font-bold text-indigo-800">
          تقرير التلميذ: {studentName} 🎒
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-emerald-100/40">
          <h2 className="text-base font-black text-emerald-950 mb-4 flex items-center gap-2"><span>🚀 نُقط القوة والتميز (متقن برافو!)</span></h2>
          <div className="space-y-3">
            {strongPoints.map((skill, index) => (
              <div key={index} className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{skill.emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">{skill.topic}</h4>
                    <p className="text-[10px] text-emerald-700/80 mt-0.5">المادة: {skill.subjectName}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">{skill.accuracy}% إتقان</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md border border-rose-100/40">
          <h2 className="text-base font-black text-rose-950 mb-4 flex items-center gap-2"><span>🍂 نقط الضعف (محتاجة دعم وسقي)</span></h2>
          <div className="space-y-3">
            {weakPoints.map((skill, index) => (
              <div key={index} className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{skill.emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950">{skill.topic}</h4>
                    <p className="text-[10px] text-rose-700/80 mt-0.5">المادة: {skill.subjectName}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-800 bg-rose-100/60 px-2 py-0.5 rounded-full">{skill.accuracy}% محتاج تركيز</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 التحديث الجديد: تبديل صورة المعلم والمعلمة تلقائياً ف الخلفية والعنوان حسب جنس الطفل */}
      <section className="w-full max-w-3xl bg-indigo-950 text-white p-6 rounded-3xl shadow-xl mt-8 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-7xl opacity-10">
          {studentGender === "female" ? "👩‍🏫" : "👨‍🏫"}
        </div>
        
        <h3 className="text-sm sm:text-base font-black mb-2 flex items-center gap-2">
          <span className="text-xl">{studentGender === "female" ? "👩‍🏫" : "👨‍🏫"}</span>
          <span>ملخص وتوجيه معلمك الخاص</span>
        </h3>
        
        <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium mt-3">
          "برافو يا {studentName}! نتا قوي وممتاز بزاف فـ {strongPoints.map(s => s.topic).slice(0, 1)} وعمر الشجرة ديالها ما غاتيبس. ولكن رادار الانتباه لاحظ باللي عندك شوية العرقلة فـ <span className="text-amber-400 font-bold">{weakPoints.map(w => w.topic).join(' و ')}</span>. متقلقش نهائياً، غدا إن شاء الله فاش تفتح كويز التحدي، غادي نوجد ليك تمارين سهلة ومشوقة بزاف فـ هاد الدروس باش تسقي أشجارك وتفرح والديك!"
        </p>
      </section>

      <button type="button" onClick={() => router.push("/garden")} className="mt-8 bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-md">
        رجوع للحديقة السحرية 🌳
      </button>
    </main>
  );
}
