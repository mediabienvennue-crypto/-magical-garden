import { createBrowserClient } from "@supabase/ssr";

// قراءة الروابط السرية لـ Supabase المجهزة في ملف البيئة المحلي
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * العميل البرمجي (Supabase Client) الموحد والآمن 
 * لّي غانستعملوه فـ كاع الصفحات للتسجيل وحفظ نقاط الأطفال
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
