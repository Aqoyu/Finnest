import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-6595e014/health", (c) => {
  return c.json({ status: "ok" });
});

// Register new user (admin API to auto-confirm email)
app.post("/make-server-6595e014/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email и пароль обязательны" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || "" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (e) {
    console.log(`Unexpected signup error: ${e}`);
    return c.json({ error: `Ошибка регистрации: ${e}` }, 500);
  }
});

// ── Gemini AI statement parser ────────────────────────────────────────────────
const GEMINI_PROMPT = `You are a financial transaction parser for a Kazakh family finance app.
Extract ALL transactions from this bank statement. Return ONLY valid JSON, no markdown, no explanation.

JSON structure:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "merchant or description, max 80 chars",
      "amount": 12345.00,
      "type": "expense or income",
      "category": "one from the list below"
    }
  ]
}

Categories (use exactly): Продукты, Рестораны, Транспорт, Здоровье, Коммунальные услуги, Развлечения, Образование, Покупки, Зарплата, Фриланс, Инвестиции, Другой доход, Другие расходы

Rules:
- amount is always a POSITIVE number
- type = "expense" if money left the account, "income" if money arrived
- dates must be YYYY-MM-DD; missing year → use 2026
- skip balance lines, headers, totals — only real transactions
- extract every single transaction you can find`;

app.post("/make-server-6595e014/ai/parse-statement", async (c) => {
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return c.json({ error: "GEMINI_API_KEY not configured" }, 500);

    const body = await c.req.json() as { text?: string; filename?: string };
    if (!body.text?.trim()) return c.json({ error: "No text provided" }, 400);

    const parts = [{ text: `${GEMINI_PROMPT}\n\nStatement text:\n"""\n${body.text.slice(0, 14000)}\n"""` }];

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Gemini error:", err);
      return c.json({ error: `Gemini API error: ${resp.status}` }, 502);
    }

    const data = await resp.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      return c.json(JSON.parse(jsonStr));
    } catch {
      console.error("JSON parse failed:", jsonStr.slice(0, 300));
      return c.json({ error: "Failed to parse Gemini response", raw: jsonStr.slice(0, 500) }, 502);
    }
  } catch (e) {
    console.error("parse-statement error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

Deno.serve(app.fetch);
