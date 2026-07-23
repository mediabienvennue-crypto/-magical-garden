"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChildData {
  name: string;
  age: string;
  favoriteFruit: string;
  dreamJob: string;
}

interface CustomTask {
  id: string;
  text: string;
  xpReward: number;
}

export default function ParentsDashboard() {
  const router = useRouter();
  const [child, setChild] = useState<ChildData>({
    name: "محمد",
    age: "11",
    favoriteFruit: "الفراولة",
    dreamJob: "رائد فضاء",
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([
    { id: "c1", text: "حفظ سورة الملك كاملة 📑", xpReward: 25 },
    { id: "c2", text: "مراجعة تمارين الصفحة 44 فالرياضيات 📐", xpReward: 15 },
  ]);

  useEffect(() => {
    const savedData = localStorage.getItem("child_onboarding");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.name) setChild(parsed);
    }
    
    const savedTasks = localStorage.getItem("parent_custom_tasks");
    if (savedTasks) {
      setCustomTasks(JSON.parse(savedTasks));
    }
  }, []);

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: CustomTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      xpReward: 20,
    };

    const updatedTasks = [newTask, ...customTasks];
    setCustomTasks(updatedTasks);
    localStorage.setItem("parent_custom_tasks", JSON.stringify(updatedTasks));
    setNewTaskText("");
    alert("تمت إضافة المهمة بنجاح! غادي تبان عند الطفل فـ الحديقة ديالو 🌟");
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center select-none text-right" dir="rtl">
      
      <header className="w-full max-w-4xl bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">فضاء الآباء والأمهات 👨‍👩‍👦</h1>
          <p className="text-sm text-slate-500 mt-1">تتبع نمو الحديقة السحرية والتحصيل الدراسي ديال ولادك</p>
        </div>
        
        {/* 🌟 شريط الأزرار المطور لمراقبة مسار الطفل والتقرير التحليلي */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/subjects")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-4 py-3 rounded-2xl shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🗺️ معاينة خريطة الدروس</span>
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/report")}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs px-4 py-3 rounded-2xl shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>📊 دفتر الضعف والقوة الذكي</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* بطاقة الطفل */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">بطاقة الدخول للطفل 🪪</h2>
          <ul className="space-y-3 text-sm text-slate-700 flex-1">
            <li><strong className="text-slate-500">الاسم الكامل:</strong> {child.name}</li>
            <li><strong className="text-slate-500">العمر:</strong> {child.age} سنة</li>
            <li><strong className="text-slate-500">الفاكهة المفضلة:</strong> {child.favoriteFruit}</li>
            <li><strong className="text-slate-500">حلم المستقبل:</strong> <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold">{child.dreamJob}</span></li>
          </ul>
        </div>

        {/* رادار التحذيرات البيداغوجية */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">رادار الانتباه والتحذيرات ⚠️</h2>
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <h4 className="text-xs font-bold text-amber-800">مادة العلوم محتاجة دعم!</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">شجرة مكونات النبتة واصلة لـ 45% فقط ومحتاجة سقي.</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
              <h4 className="text-xs font-bold text-rose-800">تنبيه: درس الكسور مهمل 🍂</h4>
              <p className="text-[11px] text-rose-700 mt-0.5">محمد تعثر فـ كويز الكسور اليوم. يرجى تشجيعه على إعادة المحاولة.</p>
            </div>
          </div>
        </div>

        {/* إضافة مهمة جديدة */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">إضافة مهمة منزلية/دراسية ➕</h2>
          <form onSubmit={handleAddTask} className="space-y-3">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="مثال: مراجعة نص القراءة الصباحي"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50"
            />
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">إرسال المهمة للحديقة 🚀</button>
          </form>

          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-500">المهام النشطة حالياً:</h4>
            {customTasks.map((task) => (
              <div key={task.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <span className="text-slate-800 font-medium">{task.text}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">+{task.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
