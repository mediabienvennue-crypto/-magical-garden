"use client";
import { useRouter } from "next/navigation";

interface PricingPlan {
  id: string; name: string; price: number; period: string; description: string; features: string[]; isPopular: boolean; buttonText: string;
}

export default function PricingPage() {
  const router = useRouter();
  const plans: PricingPlan[] = [
    {
      id: "p1", name: "الباقة الشهرية", price: 49, period: "شهر", description: "مثالية لتجربة المنصة ومتابعة تحسّن طفلك خطوة بخطوة.",
      features: ["أشجار تفاعلية لجميع المواد 🌳", "تحديات يومية غير محدودة 🧠", "دفتر متابعة نقاط القوة والضعف 📋", "فضاء متابعة خاص للوالدين 👨‍👩‍👦", "منصة آمنة 100% وبدون إعلانات 🛡️"],
      isPopular: false, buttonText: "اشترك شهرياً",
    },
    {
      id: "p2", name: "باقة النجاح السنوية", price: 399, period: "سنة", description: "الخيار الأفضل اقتصادياً لمرافقة طفلك طوال الموسم الدراسي.",
      features: ["كل مزايا الباقة الشهرية ✨", "توفير أكثر من 30% مقارنة بالدفع الشهري 💰", "دعم مباشر عبر واتساب 📱", "تقارير شهرية مفصّلة عبر البريد 📧"],
      isPopular: true, buttonText: "اشترك ووفّر 30%",
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--paper)] p-6 flex flex-col items-center">
      <header className="text-center max-w-xl my-10">
        <span className="text-4xl block mb-2">💎</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
          استثمر في مستقبل طفلك الدراسي
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          اختر الباقة المناسبة لفتح الحديقة التفاعلية الكاملة ومرافقة طفلك في مراجعته اليومية بأسلوب ممتع وآمن.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-[var(--fruit-100)] border border-[var(--fruit-500)]/20 px-4 py-2 rounded-2xl text-[var(--fruit-600)] text-xs font-bold">
          <span>💵</span>
          <span>لا تملك بطاقة بنكية؟ يمكنك الأداء نقداً عبر Cash Plus أو Wafacash.</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-8 border shadow-sm flex flex-col relative bg-white ${
              plan.isPopular ? "border-[var(--forest-500)] ring-2 ring-[var(--forest-500)]/20" : "border-slate-100"
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--fruit-500)] text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-sm">
                الأكثر توفيراً
              </span>
            )}
            <div className="mb-6 flex-1">
              <h3 className="text-lg font-bold text-[var(--ink)]">{plan.name}</h3>
              <p className="text-[11px] text-slate-500 mt-2 min-h-[32px]">{plan.description}</p>
              <div className="mt-5 flex items-baseline gap-1 text-[var(--ink)]">
                <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                <span className="text-sm font-bold text-slate-600">درهم</span>
                <span className="text-xs font-medium text-slate-500 mr-1">/ {plan.period}</span>
              </div>
              <div className="w-full h-px bg-slate-100 my-6" />
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="text-[var(--forest-500)] mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className={`w-full font-bold text-xs py-3.5 rounded-2xl shadow-sm active:scale-95 transition-all mt-6 text-white ${
                plan.isPopular ? "bg-[var(--forest-600)] hover:bg-[var(--forest-700)]" : "bg-[var(--dusk-800)] hover:opacity-90"
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <footer className="mt-10 text-center max-w-xl bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          🛡️ إذا لم تلاحظ أي تحسّن خلال أول 7 أيام، يمكنك طلب استرجاع أموالك بالكامل بلا تعقيد.
        </p>
        <div className="w-full h-px bg-slate-100" />
        <p className="text-[10px] text-[var(--dusk-800)] bg-[var(--dusk-100)] p-3 rounded-2xl leading-relaxed">
          🏪 للدفع عبر Cash Plus أو Wafacash: بعد إنشاء حسابك، تواصل معنا عبر واتساب وسنرسل لك بيانات الأداء.
        </p>
      </footer>
    </main>
  );
}