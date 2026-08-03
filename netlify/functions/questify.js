/**
 * TaskQuest — Netlify serverless function
 * Proxies the DeepSeek API. Supports 3 modes:
 *   breakdown (default) — full task → micro-steps
 *   subdivide — one step → even smaller sub-steps
 *   coach     — conversational ADHD coach for a specific step
 *
 * Set env var `ds` in Netlify dashboard with your DeepSeek API key.
 */
const BREAKDOWN_PROMPT = `You are an ADHD-friendly task coach. Your job is to break down a big, overwhelming task into tiny, impossibly-easy micro-steps.

RULES:
- Each step should take 2–15 minutes. No step is too small.
- Language: warm, encouraging, zero judgment. Never say "just" or "simply."
- Each step needs a 1-sentence "hint" — a tiny nudge that makes starting even easier.
- Output ONLY valid JSON. No markdown, no extra text.

FORMAT:
{
  "steps": [
    { "title": "Open Google Docs and name the file", "hint": "You don't need to write anything yet — just open it.", "minutes": 2, "verbType": "physical" },
    { "title": "Write one messy sentence as your opening", "hint": "It can be terrible. Getting words on the page is the goal.", "minutes": 5, "verbType": "creative" }
  ]
}

verbType must be one of: "physical" | "cognitive" | "social" | "creative".
- physical = opening / getting / sitting / clicking — an observable body action
- cognitive = thinking / planning / organizing / remembering — a mental action
- social = asking / texting / showing — involving another person
- creative = writing / drawing / building — producing something new

Give 4–7 steps. The first step must be absurdly easy — something the user can do in under 3 minutes.`;

const SUBDIVIDE_PROMPT = `You are an ADHD-friendly task coach. A user has a single micro-step that still feels too big. Break it into 2–3 even tinier sub-steps.

RULES:
- Each sub-step must take 1–5 minutes. Make them absurdly easy to start.
- Language: warm, encouraging, zero judgment.
- Each sub-step needs a 1-sentence "hint".
- Output ONLY valid JSON. No markdown, no extra text.

FORMAT:
{
  "steps": [
    { "title": "...", "hint": "...", "minutes": 2, "verbType": "physical" },
    { "title": "...", "hint": "...", "minutes": 3, "verbType": "cognitive" }
  ]
}

verbType must be one of: "physical" | "cognitive" | "social" | "creative".`;

const COACH_SYSTEM = `You are an ADHD-friendly task coach helping a user work through a specific micro-step.

The user's current step is described below. Your job is to guide them warmly — ask questions, offer tiny nudges, brainstorm with them.

RULES:
- Your user is a K-12 student. Use simple words — if a word is hard, pick an easier one.
- Keep responses VERY short: 1–3 sentences maximum. ADHD brains stop reading longer text.
- Warm, encouraging, zero judgment. Never say "just" or "simply."
- Guide with questions rather than giving orders.
- If they're stuck, offer ONE tiny concrete action — not a list.
- Match their energy. If they sound overwhelmed, be extra gentle.
- Use emoji occasionally for warmth.`;

function parseLLMResponse(content) {
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error('Could not parse AI response');
  }
  if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error('AI returned no steps');
  }
  return parsed.steps.map((s, i) => ({
    id: `step_${i}`,
    title: (s.title || `Step ${i + 1}`).toString(),
    hint: (s.hint || 'You got this.').toString(),
    minutes: Math.max(1, Math.min(60, parseInt(s.minutes) || 10)),
    verbType: ['physical','cognitive','social','creative'].includes(s.verbType) ? s.verbType : 'cognitive',
  }));
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ds;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server missing ds env var.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad JSON body' }) };
  }

  const mode = body.mode || 'breakdown';

  try {
    let systemPrompt, userMessage, maxTokens;

    if (mode === 'coach') {
      // --- Coach mode: conversational ---
      const stepTitle = (body.step_title || '').toString().trim();
      if (!stepTitle) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No step_title provided.' }) };
      }
      systemPrompt = COACH_SYSTEM;
      const messages = body.messages || [];
      const msgs = [
        { role: 'system', content: COACH_SYSTEM },
        { role: 'system', content: `Current step the user is working on: "${stepTitle}"` },
        ...messages,
      ];
      maxTokens = 400;
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: 'deepseek-chat', messages: msgs, temperature: 0.8, max_tokens: maxTokens }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return { statusCode: res.status, headers, body: JSON.stringify({ error: `DeepSeek API error: ${errText.slice(0, 200)}` }) };
      }
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ reply: data.choices[0].message.content }) };
    }

    // --- Breakdown / Subdivide mode: return structured steps ---
    const task = (body.task || '').toString().trim();
    if (!task) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No task provided.' }) };
    }

    if (mode === 'subdivide') {
      systemPrompt = SUBDIVIDE_PROMPT;
      userMessage = `This step still feels too big: "${task}". Break it into 2–3 even smaller sub-steps.`;
    } else {
      // default: breakdown
      systemPrompt = BREAKDOWN_PROMPT;
      userMessage = `Break down this task for me: "${task}"`;
    }
    maxTokens = 1000;

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: res.status, headers, body: JSON.stringify({ error: `DeepSeek API error: ${errText.slice(0, 200)}` }) };
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    const steps = parseLLMResponse(content);
    return { statusCode: 200, headers, body: JSON.stringify({ steps }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Server error' }) };
  }
};
