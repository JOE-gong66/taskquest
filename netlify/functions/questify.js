/**
 * TaskQuest — Netlify serverless function
 * Proxies the DeepSeek API so the API key stays in Netlify's env vars
 * (never exposed to the browser). Also solves CORS.
 *
 * Set env var DEEPSEEK_API_KEY in Netlify dashboard.
 */
const SYSTEM_PROMPT = `You are an ADHD-friendly task coach. Your job is to break down a big, overwhelming task into tiny, impossibly-easy micro-steps.

RULES:
- Each step should take 2–15 minutes. No step is too small.
- Language: warm, encouraging, zero judgment. Never say "just" or "simply."
- Each step needs a 1-sentence "hint" — a tiny nudge that makes starting even easier.
- Output ONLY valid JSON. No markdown, no extra text.

FORMAT:
{
  "steps": [
    { "title": "Open Google Docs and name the file", "hint": "You don't need to write anything yet — just open it.", "minutes": 2 },
    { "title": "Write one messy sentence as your opening", "hint": "It can be terrible. Getting words on the page is the goal.", "minutes": 5 }
  ]
}

Give 4–7 steps. The first step must be absurdly easy — something the user can do in under 3 minutes.`;

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
  }));
}

exports.handler = async (event) => {
  // CORS headers (Netlify Functions handle preflight separately)
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

  const task = (body.task || '').toString().trim();
  if (!task) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No task provided.' }) };
  }

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Break down this task for me: "${task}"` },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
