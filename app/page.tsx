"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-50 p-6 flex flex-col items-center justify-center text-center select-none text-right" dir="rtl">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-amber-400 to-sky-400" />
        
        <header className="mb-6">
          <span className="text-5xl block mb-2">🌳📚🏆</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">مَنَصَّة المُفِيد التَّعْلِيمِيَّة</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-bold mt-2 leading-relaxed">
            الرفيق البيداغوجي الذكي المطابق للمنهج الدراسي المغربي. البديل الاقتصادي لدروس الدعم والدروس الخصوصية في المنزل! 🇲🇦✨
          </p>
        </header>

        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-8 font-medium">
          عبر حديقة تفاعلية ومغامرات شيقة، يتعلم الطفل، ويراجع دروس المؤسسة الرسمية، وينجح في التحديات ليربح مكافآت سحرية تزيد من حماسه وتركيزه اليومي وبـ 49 درهم فقط في الشهر! 💵❌
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs px-6 py-4 rounded-2xl shadow-md hover:opacity-95 active:scale-95 transition-all"
          >
            🚀 اكتشف الباقات واشترك بالدرهم المغربي
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="bg-slate-900 text-white font-black text-xs px-6 py-4 rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            🔓 تسجيل الدخول لفضاء الآباء
          </button>
        </div>
      </div>
    </main>
  );
}
