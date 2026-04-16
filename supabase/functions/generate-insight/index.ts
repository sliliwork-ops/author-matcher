import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK_TEXT =
  "Спасибо за ответы.\n\nПо вашим ответам видно, что у вас есть сильный потенциал для участия в книге.\n\nМы уже анализируем, какая концепция подойдёт вам лучше всего.\n\nНапишите нам, и мы поможем подобрать оптимальный формат участия и тему главы.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, forceBookId } = await req.json();

    // Load book concepts from DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: books, error: dbError } = await supabase
      .from("book_concepts")
      .select("*");

    // Filter to specific book if forceBookId provided
    const filteredBooks = forceBookId
      ? books.filter((b: Record<string, string>) => b.id === forceBookId)
      : books;

    if (dbError || !filteredBooks || filteredBooks.length === 0) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ insight: FALLBACK_TEXT, fromFallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ insight: FALLBACK_TEXT, fromFallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build books description for prompt
    const booksDescription = filteredBooks
      .map(
        (b: Record<string, string>) => `
--- КНИГА: ${b.title} ---
Аудитория: ${b.audience || "—"}
Проблемы: ${b.problems || "—"}
Подходящие темы: ${b.suitable_topics || "—"}
Не подходит для: ${b.not_suitable_for || "—"}
Обещание книги: ${b.promise || "—"}
Тип автора: ${b.author_type || "—"}
Тип главы: ${b.chapter_type || "—"}
Тон: ${b.tone || "—"}
Эмоциональные триггеры: ${b.emotional_triggers || "—"}
Ключевые слова совпадения: ${b.match_keywords || "—"}
Приоритетные сигналы: ${b.priority_signals || "—"}
Исключающие ключевые слова: ${b.exclude_keywords || "—"}
CTA: ${b.cta || "—"}
Угол примера: ${b.sample_output_angle || "—"}
`
      )
      .join("\n");

    // Format user answers
    const sphere = Array.isArray(answers.q1) ? answers.q1.join(", ") : answers.q1 || "не указана";
    const requests = Array.isArray(answers.q2) ? answers.q2.join(", ") : answers.q2 || "не указаны";
    const clientResult = answers.q3 || "не указан";
    const format = Array.isArray(answers.q4) ? answers.q4.join(", ") : answers.q4 || "не указан";
    const audience = Array.isArray(answers.q5) ? answers.q5.join(", ") : answers.q5 || "не указана";
    const methodology = Array.isArray(answers.q6) ? answers.q6.join(", ") : answers.q6 || "не указан";
    const goals = Array.isArray(answers.q7) ? answers.q7.join(", ") : answers.q7 || "не указаны";

    const systemPrompt = `Ты анализируешь ответы пользователя квиза и сравниваешь их с концепциями книг из базы данных.

Твоя задача:
1. определить, какая книга подходит пользователю лучше всего;
2. при необходимости выбрать одну запасную книгу;
3. объяснить выбор простым, убедительным и персональным языком;
4. предложить сильный тип главы;
5. предложить конкретный угол темы;
6. показать следующий практический шаг;
7. сгенерировать 3 варианта темы главы — конкретных, живых, основанных на реальных ответах пользователя.

Правила:
- опирайся на реальные ответы пользователя;
- учитывай audience, problems, suitable_topics, not_suitable_for, author_type, chapter_type, tone, emotional_triggers, match_keywords, priority_signals, exclude_keywords, cta, sample_output_angle;
- не перечисляй все книги подряд;
- выбирай одну основную книгу;
- запасную книгу показывай только если есть близкое второе совпадение;
- если совпадение слабое, честно скажи, что нужен ручной подбор;
- не пиши общими фразами;
- не пиши слишком длинно;
- тон должен быть экспертный, понятный, тёплый, но без воды.

Формат ответа — строго JSON со следующими полями:
{
  "whoYouAre": "Кто вы сейчас — 1-2 предложения о профиле пользователя",
  "primaryBookTitle": "Точное название основной книги из базы",
  "whyThisBook": "Почему именно она — 2-3 предложения",
  "chapterType": "Тип главы — одна фраза",
  "topicAngle": "Сильный угол темы — одна конкретная фраза",
  "nextStep": "Что делать дальше — 1-2 предложения",
  "alternativeBookTitle": "Название запасной книги или null если нет близкого совпадения",
  "alternativeReason": "Краткое обоснование запасной книги или null",
  "topics": [
    {
      "title": "Первый вариант темы главы — конкретная формулировка под профиль пользователя, усиливает экспертность",
      "labelColor": "expert"
    },
    {
      "title": "Второй вариант темы главы — с акцентом на пользу для клиентов или конкретный результат",
      "labelColor": "client"
    },
    {
      "title": "Третий вариант темы главы — с акцентом на личный бренд, PR или узнаваемость автора",
      "labelColor": "brand"
    }
  ]
}

Правила для поля topics:
- Все 3 темы должны быть конкретными, живыми, основанными на реальных ответах пользователя
- labelColor: "expert" — для темы, усиливающей экспертность; "client" — для темы, привлекающей клиентов; "brand" — для темы, работающей на личный бренд и PR
- Темы не должны быть абстрактными шаблонами — используй реальные детали из ответов
- Каждая тема — готовая формулировка для главы книги`;

    const userPrompt = `Вот концепции книг из базы данных:

${booksDescription}

Ответы пользователя квиза:
- Сфера экспертности: ${sphere}
- Запросы клиентов: ${requests}
- Результат клиентов: ${clientResult}
- Формат работы: ${format}
- Целевая аудитория: ${audience}
- Подход/система: ${methodology}
- Цели участия в книге: ${goals}

Проанализируй ответы, сравни с концепциями книг и верни JSON-ответ в указанном формате.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1200,
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway status:", response.status);
      return new Response(
        JSON.stringify({ insight: FALLBACK_TEXT, fromFallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return new Response(
        JSON.stringify({ insight: FALLBACK_TEXT, fromFallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ insight: FALLBACK_TEXT, fromFallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find matching book from DB by title
    const primaryBook = books.find(
      (b: Record<string, string>) =>
        b.title.toLowerCase().includes(((parsed.primaryBookTitle as string) || "").toLowerCase()) ||
        ((parsed.primaryBookTitle as string) || "").toLowerCase().includes(b.title.toLowerCase())
    );

    const alternativeBook = parsed.alternativeBookTitle
      ? books.find(
          (b: Record<string, string>) =>
            b.title.toLowerCase().includes(((parsed.alternativeBookTitle as string) || "").toLowerCase()) ||
            ((parsed.alternativeBookTitle as string) || "").toLowerCase().includes(b.title.toLowerCase())
        )
      : null;

    // Validate and normalise topics
    const rawTopics = Array.isArray(parsed.topics) ? parsed.topics : [];
    const topics = rawTopics.slice(0, 3).map((t: Record<string, string>) => ({
      title: t.title || "",
      labelColor: ["expert", "client", "brand"].includes(t.labelColor) ? t.labelColor : "expert",
    }));

    return new Response(
      JSON.stringify({
        whoYouAre: parsed.whoYouAre || null,
        primaryBookTitle: primaryBook?.title || parsed.primaryBookTitle || null,
        publishDate: primaryBook?.publish_date || null,
        entryDeadline: primaryBook?.entry_deadline || null,
        whyThisBook: parsed.whyThisBook || null,
        chapterType: parsed.chapterType || null,
        topicAngle: parsed.topicAngle || null,
        nextStep: parsed.nextStep || null,
        alternativeBookTitle: alternativeBook?.title || parsed.alternativeBookTitle || null,
        alternativeReason: parsed.alternativeReason || null,
        topics,
        fromFallback: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-insight error:", error);
    return new Response(
      JSON.stringify({ insight: FALLBACK_TEXT, fromFallback: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
