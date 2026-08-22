// ============================================================================
// generate-qotd
// ----------------------------------------------------------------------------
// Supabase Edge Function. Called once a day (see SETUP.md for the cron
// setup) to generate that day's Question of the Day via OpenRouter, and
// insert it into public.qotd.
//
// Deploy (Dashboard): create/edit the function named generate-qotd, paste
// this file in as index.ts, deploy.
// Secrets:  OPENROUTER_API_KEY=your-openrouter-key   (required)
//           OPENROUTER_MODEL=openai/gpt-4o-mini       (optional, this is the default)
//
// Get a key at https://openrouter.ai/settings/keys -- OpenRouter is a single
// API that proxies to whichever underlying model you pick (OpenAI, Gemini,
// Claude, Llama, DeepSeek, etc.), OpenAI-compatible request/response shape.
//
// This function uses the service role key (auto-injected by Supabase as
// SUPABASE_SERVICE_ROLE_KEY) to bypass RLS when inserting -- public.qotd has
// no insert policy for anon/authenticated on purpose (see supabase/schema.sql),
// so writes only ever happen from here.
// ============================================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const OPENROUTER_MODEL = Deno.env.get("OPENROUTER_MODEL") || "openai/gpt-4o-mini";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CATEGORIES = [
  "technology",
  "science",
  "space",
  "robotics",
  "AI",
  "design",
  "programming",
  "general trivia",
  "innovation history",
];

function todayIST() {
  // IST = UTC+5:30, no DST. Compute the calendar date as seen in IST.
  const now = new Date();
  const istMillis = now.getTime() + (5 * 60 + 30) * 60 * 1000;
  const ist = new Date(istMillis);
  return ist.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Pulls the first {...} block out of a string -- a safety net for models
// that ignore "JSON only" instructions and wrap the object in prose or a
// markdown fence anyway.
function extractJsonObject(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

async function generateQuestion() {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const prompt = `You write a single "Question of the Day" for a school technology/innovation club's website. Topic area: ${category}.

Rules:
- One engaging, thought-provoking question. Not multiple choice, not yes/no.
- Suitable for high-school students.
- Include a short (max 2 sentence) fun fact or context that would make sense to reveal AFTER someone answers.
- Return ONLY compact JSON, no markdown fences, in this exact shape:
{"question": "...", "category": "...", "fun_fact": "..."}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY ?? ""}`,
      // Optional but recommended by OpenRouter for attributing usage on their dashboard.
      "HTTP-Referer": "https://innovationclub.dpsnewtownkolkata.com",
      "X-Title": "Innovation Club QOTD",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`OpenRouter returned no content: ${JSON.stringify(data)}`);

  let parsed;
  try {
    parsed = JSON.parse(extractJsonObject(text));
  } catch {
    throw new Error(`OpenRouter response was not valid JSON: ${text}`);
  }
  if (!parsed.question) throw new Error("OpenRouter response missing 'question'");
  return {
    question: String(parsed.question).trim(),
    category: parsed.category ? String(parsed.category).trim() : category,
    fun_fact: parsed.fun_fact ? String(parsed.fun_fact).trim() : null,
  };
}

Deno.serve(async () => {
  if (!OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not set" }), { status: 500 });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Supabase service credentials missing" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const qdate = todayIST();

  // Idempotent: if today's question already exists (e.g. cron fired twice,
  // or this was triggered manually after the scheduled run), don't overwrite it.
  const { data: existing } = await supabase.from("qotd").select("id").eq("qdate", qdate).maybeSingle();
  if (existing) {
    return new Response(JSON.stringify({ skipped: true, reason: "already exists", qdate }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { question, category, fun_fact } = await generateQuestion();
    const { data, error } = await supabase
      .from("qotd")
      .insert({ qdate, question, category, fun_fact, model: OPENROUTER_MODEL })
      .select()
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, qotd: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
