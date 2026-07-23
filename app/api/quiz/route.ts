import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 🔐 الساروت مخبي فـ السيرفر بأمان وبلا NEXT_PUBLIC_
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { subject, level } = await request.json();

    const prompt = `أنت أستاذ خبير في التعليم الابتدائي المغربي. قم بتوليد 3 أسئلة تفاعلية من نوع اختيار من متعدد (MCQ) لمادة "${subject}" المخصصة للمستوى الدراسي "${level} الابتدائي" باللغة العربية الفصحى المبسطة والمشوقة للأطفال. يجب أن تتبع البنية البرمجية التالية بالضبط بدون أي نصوص زائدة خارج مصفوفة الـ JSON: [{"id": 1, "questionText": "نص السؤال هنا؟", "options": ["الاختيار الأول", "الاختيار الثاني", "الاختيار الثالث", "الاختيار الرابع"], "correctAnswer": "الكلمة الصحيحة مطابقة تماما لأحد الاختيارات"}]`;
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const questions = JSON.parse(response.text || "[]");
    return NextResponse.json(questions);
  } catch (error) {
    console.error("خطأ أمني في السيرفر أثناء الاتصال بـ Gemini:", error);
    return NextResponse.json([
      {
        id: 1,
        questionText: "سؤال حماية: ما هي عاصمة المملكة المغربية؟",
        options: ["الدار البيضاء", "الرباط", "مراكش", "طنجة"],
        correctAnswer: "الرباط"
      }
    ]);
  }
}