"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

type Method = "email" | "phone";
type Step = "form" | "verifyPhone";

export default function AuthPage() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(true);
  const [method, setMethod] = useState<Method>("email");
  const [step, setStep] = useState<Step>("form");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const isError = message.startsWith("تعذّر") || message.startsWith("خطأ");

  function toE164(raw: string) {
    // يقبل 06XXXXXXXX أو 07XXXXXXXX المغربي ويحوّله لصيغة دولية +212
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("212")) return `+${digits}`;
    if (digits.startsWith("0")) return `+212${digits.slice(1)}`;
    return `+${digits}`;
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setMessage("تم إنشاء حسابك بنجاح. سيتم تحويلك لإعداد ملف طفلك…");
        setTimeout(() => router.push("/onboarding"), 1500);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("مرحباً بعودتك. جارٍ فتح لوحة المتابعة…");
        setTimeout(() => router.push("/parents"), 1200);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "تعذّر الاتصال بالخادم حالياً";
      setMessage(`تعذّر إتمام العملية: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: toE164(phone),
        options: isSignUp ? { data: { full_name: fullName } } : undefined,
      });
      if (error) throw error;
      setMessage("أرسلنا رمز تحقق مكوّناً من 6 أرقام إلى هاتفك عبر رسالة نصية.");
      setStep("verifyPhone");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "تعذّر إرسال رمز التحقق";
      setMessage(`تعذّر إتمام العملية: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: toE164(phone),
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      setMessage("تم التحقق بنجاح.");
      setTimeout(() => router.push(isSignUp ? "/onboarding" : "/parents"), 1000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "رمز التحقق غير صحيح";
      setMessage(`تعذّر إتمام العملية: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[var(--dusk-100)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[var(--dusk-600)]" />

        <header className="text-center mb-7">
          <span className="text-4xl block mb-2">🌳</span>
          <h1 className="font-display text-2xl font-bold text-[var(--dusk-800)]">
            {isSignUp ? "إنشاء حساب ولي الأمر" : "تسجيل الدخول إلى حسابك"}
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {isSignUp
              ? "أنشئ حسابك في دقيقة واحدة لتبدأ رحلة طفلك في الحديقة السحرية"
              : "أهلاً بعودتك إلى فضاء المتابعة الخاص بك"}
          </p>
        </header>

        {/* اختيار طريقة التسجيل */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[var(--dusk-100)] rounded-2xl">
          <button
            type="button"
            onClick={() => { setMethod("email"); setStep("form"); setMessage(""); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              method === "email" ? "bg-white text-[var(--dusk-800)] shadow-sm" : "text-slate-500"
            }`}
          >
            البريد الإلكتروني
          </button>
          <button
            type="button"
            onClick={() => { setMethod("phone"); setStep("form"); setMessage(""); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              method === "phone" ? "bg-white text-[var(--dusk-800)] shadow-sm" : "text-slate-500"
            }`}
          >
            رقم الهاتف
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold mb-6 text-center ${
              isError
                ? "bg-rose-50 text-rose-700 border border-rose-100"
                : "bg-[var(--forest-100)] text-[var(--forest-700)] border border-[var(--forest-500)]/20"
            }`}
          >
            {message}
          </div>
        )}

        {method === "email" && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <Field label="اسم ولي الأمر">
                <input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد العلمي"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="البريد الإلكتروني">
              <input
                type="email" required value={email} dir="ltr"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@email.com"
                className={inputClass}
              />
            </Field>
            <Field label="كلمة المرور">
              <input
                type="password" required minLength={6} value={password} dir="ltr"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </Field>
            <SubmitButton loading={loading} isSignUp={isSignUp} />
          </form>
        )}

        {method === "phone" && step === "form" && (
          <form onSubmit={handlePhoneRequestCode} className="space-y-4">
            {isSignUp && (
              <Field label="اسم ولي الأمر">
                <input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد العلمي"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="رقم الهاتف">
              <input
                type="tel" required value={phone} dir="ltr"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0612345678"
                className={inputClass}
              />
            </Field>
            <SubmitButton loading={loading} isSignUp={isSignUp} label="إرسال رمز التحقق" />
          </form>
        )}

        {method === "phone" && step === "verifyPhone" && (
          <form onSubmit={handlePhoneVerify} className="space-y-4">
            <Field label="رمز التحقق المُرسَل عبر رسالة نصية">
              <input
                type="text" required value={otp} dir="ltr" inputMode="numeric" maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className={`${inputClass} text-center tracking-[0.5em] font-bold`}
              />
            </Field>
            <SubmitButton loading={loading} isSignUp={isSignUp} label="تأكيد الرمز" />
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
            >
              تعديل رقم الهاتف
            </button>
          </form>
        )}

        <div className="mt-7 text-center border-t pt-4 border-slate-100">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setStep("form"); setMessage(""); }}
            className="text-xs font-bold text-[var(--forest-600)] hover:text-[var(--forest-700)]"
          >
            {isSignUp ? "لديك حساب بالفعل؟ سجّل الدخول من هنا" : "ليس لديك حساب؟ أنشئ واحداً الآن"}
          </button>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full text-sm p-3.5 rounded-xl border border-slate-200 outline-none focus:border-[var(--forest-500)] bg-slate-50/50 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SubmitButton({
  loading, isSignUp, label,
}: { loading: boolean; isSignUp: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[var(--forest-600)] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[var(--forest-700)] shadow-md mt-6 disabled:opacity-50 transition-colors"
    >
      {loading ? "جارٍ المعالجة…" : label ?? (isSignUp ? "إنشاء الحساب" : "تسجيل الدخول")}
    </button>
  );
}
