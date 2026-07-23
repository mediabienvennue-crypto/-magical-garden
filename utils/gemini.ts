interface GeneratedQuestion { id: number; questionText: string; options: string[]; correctAnswer: string; }

export async function generateQuizQuestions(subject: string, level: string): Promise<GeneratedQuestion[]> {
  try {
    // 🚀 طلب الأسئلة من الجسر الآمن الداخلي ديال السيرفر
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, level }),
    });

    if (!response.ok) throw new Error("فشل الجسر الآمن");
    return await response.json();
  } catch (error) {
    console.error("خطأ محلي:", error);
    return [{ id: 1, questionText: `سؤال تجريبي فـ ${subject}: ما هي عاصمة المغرب؟`, options: ["الدار البيضاء", "الرباط", "مراكش", "فاس"], correctAnswer: "الرباط" }];
  }
}
