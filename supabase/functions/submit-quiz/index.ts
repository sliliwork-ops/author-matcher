import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Telegram credentials not configured");
    }

    const text = `📋 *Новая заявка из квиза*

👤 *Имя:* ${esc(body.name)}
📱 *Telegram:* ${esc(body.telegramwhatsapp || "—")}
📲 *MAX/WhatsApp/Телефон:* ${esc(body.maxwhatsapp || "—")}
📧 *Email:* ${esc(body.email || "—")}

📚 *Книга:* ${esc(body.selectedbook)}
📝 *Тема:* ${esc(body.selectedtopic)}

*Ответы на вопросы:*
1️⃣ Сфера: ${esc(body.question1)}
2️⃣ Запросы клиентов: ${esc(body.question2)}
3️⃣ Формат экспертности: ${esc(body.question3)}
4️⃣ Целевая аудитория: ${esc(body.question4)}
5️⃣ Результат клиентов: ${esc(body.question5)}
6️⃣ Цель участия: ${esc(body.question6)}

💬 *Комментарий:* ${esc(body.comment || "—")}

✅ Согласие на обработку данных: ${body.consentpersonaldata ? "Да" : "Нет"}
📣 Согласие на рассылку: ${body.consentmarketing ? "Да" : "Нет"}`;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("Telegram API error:", JSON.stringify(data));
      throw new Error(data.description || "Telegram send failed");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("submit-quiz error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function esc(s: string): string {
  if (!s) return "—";
  return s.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}
