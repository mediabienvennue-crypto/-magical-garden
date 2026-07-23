"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PricingPlan {
  id: string; name: string; price: number; period: string; description: string; features: string[]; isPopular: boolean; buttonText: string; colorClass: string;
}

export default function PricingPage() {
  const router = useRouter();
  const plans: PricingPlan[] = [
    {
      id: "p1", name: "الباقة السحرية الشهرية", price: 49, period: "شهر", description: "مثالية لتجربة المنصة وتتبع تحسن طفلك خطوة بخطوة.",
      features: ["أشجار تفاعلية لـ 4 مواد أساسية 🌳", "تحديات يومية لا نهائية من المعلم الخاص 🧠", "الوصول الكامل للمتجر السحري للزينة 🛒", "دفتر الضعف والقوة التكيفي المحدث 📋", "فضاء مراقبة خاص ومحمي للآباء 👨‍👩‍👦", "منصة آمنة 100% وبدون أي إعلانات 🛡️"],
      isPopular: false, buttonText: "اشترك الآن شهرياً 🚀", colorClass: "border-slate-200 bg-white"
    },
    {
      id: "p2", name: "باقة النجاح السنوية", price: 399, period: "سنة", description: "الخيار الأفضل والاقتصادي لمرافقة طفلك طيلة الموسم الدراسي.",
      features: ["كاع مميزات الباقة الشهرية بالكامل ✨", "توفير كثر من 30% مقارنة بالدفع الشهري 💰", "دعم فني خاص ومباشر للآباء عبر الواتساب 📱", "مكافآت وحيوانات نادرة حصرية في المتجر 🦄", "تقارير شهرية معمقة تُرسل لإيميل الأب 📧", "تحديثات دورية مجانية للمقرر الدراسي 📚"],
      isPopular: true, buttonText: "اشترك ووفر 30% فوراً 🏆", colorClass: "border-indigo-500 bg-white ring-2 ring-indigo-500/20"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-50 p-6 flex flex-col items-center select-none text-right" dir="rtl">
      <header className="text-center max-w-xl my-10 animate-fadeIn">
        <span className="text-4xl block mb-2">💎✨</span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">استثمر في مستقبل طفلك الدراسي</h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">اختر الباقة المناسبة وفك القفل على \"معلم طفلك الخاص\" والحديقة التفاعلية لزيادة حماس وتركيز طفلك في المراجعة اليومية بشكل ممتع وآمن وعبر الدفع بالدرهم المغربي 🇲🇦.</p>
        
        {/* 💵 شارة الدفع كاش الجديدة للتسهيل على الآباء */}
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-amber-800 text-xs font-bold shadow-sm">
          <span>💵</span>
          <span><strong>ملاحظة مهمة للآباء:</strong>  ما عندكش بطاقة مصرفية؟ يمكن ليك تخلص نقدا عبر أقرب الوكالات التالية :كاش بليس،  وفاكاش، أو عبر تحويل بنكي بكل سهولة.!</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full px-4 items-stretch">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-3xl p-8 border shadow-md flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.colorClass}`}>
            {plan.isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-sm">🔥 العرض الأكثر طلباً وتوفيراً</span>}
            <div className="mb-6 flex-1">
              <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
              <p className="text-[11px] text-slate-500 mt-2 min-h-[32px]">{plan.description}</p>
              <div className="mt-5 flex items-baseline gap-1 text-slate-950">
                <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                <span className="text-sm font-bold text-slate-600">درهم</span>
                <span className="text-xs font-medium text-slate-500 mr-1">/ {plan.period}</span>
              </div>
              <div className="w-full h-px bg-slate-100 my-6" />
              <ul className="space-y-3.5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                    <span className="text-emerald-500 mt-0.5 text-sm">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={() => router.push("/auth")} className={`w-full font-black text-xs py-4 rounded-2xl shadow-md active:scale-95 transition-all mt-8 ${plan.isPopular ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-95" : "bg-slate-900 text-white hover:bg-slate-800"}`}>{plan.buttonText}</button>
          </div>
        ))}
      </div>

      {/* 🤝 تحديث التذييل بضمان الثقة وتفاصيل الدفع كاش عبر الوكالات المغربية */}
      <footer className="mt-12 text-center max-w-xl bg-white/80 backdrop-blur-sm border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3">
        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">🛡️ <strong>ضمان الثقة والأمان:</strong> جرب المنصة مع طفلك بكل راحة! إذا لم تلاحظ أي تحسن في تركيزه أو رغبته في المراجعة خلال أول 7 أيام، يمكنك طلب استرجاع أموالك بالكامل فوراً وبدون تعقيدات.</p>
        <div className="w-full h-px bg-slate-100" />
        <p className="text-[10px] text-indigo-900 font-black bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100/50 leading-relaxed">
          🏪 <strong>كيفاش تخلص كاش؟</strong> بعد إنشاء حسابك، إلا بغيتي تخلص عبر <strong>Cash Plus</strong> أو <strong>Wafacash</strong>، تواصل معنا ديريكت فـ الواتساب الخاص بالدعم، غانصيفطوا ليك معلومات الحساب، وغاتفعل ليك الحديقة ديال ولدك فـ قل من 5 ديال الدقائق!
        </p>
      </footer>
    </main>
  );
}
