"""
TaskQuest local server — serves static files + proxies LLM API calls.
Supports 3 modes: breakdown (default), subdivide, coach.
Run: python server.py
"""
import http.server
import json
import urllib.request
import urllib.error
import os
import socketserver
import re

PORT = 8765
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

BREAKDOWN_PROMPT = """You are an ADHD-friendly task coach. Your job is to break down a big, overwhelming task into tiny, impossibly-easy micro-steps.

RULES:
- Each step should take 2-15 minutes. No step is too small.
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

Give 4-7 steps. The first step must be absurdly easy — something the user can do in under 3 minutes."""

SUBDIVIDE_PROMPT = """You are an ADHD-friendly task coach. A user has a single micro-step that still feels too big. Break it into 2-3 even tinier sub-steps.

RULES:
- Each sub-step must take 1-5 minutes. Make them absurdly easy to start.
- Language: warm, encouraging, zero judgment.
- Each sub-step needs a 1-sentence "hint".
- Output ONLY valid JSON. No markdown, no extra text.

FORMAT:
{
  "steps": [
    { "title": "...", "hint": "...", "minutes": 2 },
    { "title": "...", "hint": "...", "minutes": 3 }
  ]
}"""

COACH_SYSTEM = """You are an ADHD-friendly task coach helping a user work through a specific micro-step.

The user's current step is described below. Your job is to guide them warmly — ask questions, offer tiny nudges, brainstorm with them.

RULES:
- Keep responses VERY short: 1-3 sentences maximum. ADHD brains stop reading longer text.
- Warm, encouraging, zero judgment. Never say "just" or "simply."
- Guide with questions rather than giving orders.
- If they're stuck, offer ONE tiny concrete action — not a list.
- Match their energy. If they sound overwhelmed, be extra gentle.
- Use emoji occasionally for warmth."""


def parse_llm_response(content):
    """Parse JSON from LLM response, handling markdown wrapping."""
    json_str = content.strip()
    if json_str.startswith('```'):
        json_str = json_str.replace('```json', '').replace('```', '').strip()
    try:
        parsed = json.loads(json_str)
    except json.JSONDecodeError:
        match = re.search(r'\{[\s\S]*\}', json_str)
        if match:
            parsed = json.loads(match.group(0))
        else:
            raise ValueError('Could not parse AI response.')

    if 'steps' not in parsed or not isinstance(parsed['steps'], list):
        raise ValueError('AI response missing steps array.')

    return [
        {
            'id': f"step_{i}",
            'title': s.get('title', f'Step {i+1}'),
            'hint': s.get('hint', 'You got this.'),
            'minutes': max(1, min(60, int(s.get('minutes', 10)))),
        }
        for i, s in enumerate(parsed['steps'])
    ]


class TaskQuestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/api/questify':
            self.handle_questify()
        else:
            self.send_error(404)

    def handle_questify(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body)

        api_key = data.get('api_key', '')
        provider = data.get('provider', 'deepseek')
        mode = data.get('mode', 'breakdown')

        if not api_key:
            self.send_json(400, {'error': 'No API key provided.'})
            return

        # --- Coach mode ---
        if mode == 'coach':
            step_title = (data.get('step_title', '') or '').strip()
            if not step_title:
                self.send_json(400, {'error': 'No step_title provided.'})
                return

            messages = data.get('messages', [])
            msgs = [
                {'role': 'system', 'content': COACH_SYSTEM},
                {'role': 'system', 'content': f'Current step the user is working on: "{step_title}"'},
            ] + messages

            reply = self._call_llm(provider, api_key, 'deepseek-chat', msgs, temperature=0.8, max_tokens=400, raw=True)
            self.send_json(200, {'reply': reply})
            return

        # --- Breakdown / Subdivide mode ---
        task = (data.get('task', '') or '').strip()
        if not task:
            self.send_json(400, {'error': 'No task provided.'})
            return

        if mode == 'subdivide':
            system_prompt = SUBDIVIDE_PROMPT
            user_msg = f'This step still feels too big: "{task}". Break it into 2-3 even smaller sub-steps.'
        else:
            system_prompt = BREAKDOWN_PROMPT
            user_msg = f'Break down this task for me: "{task}"'

        msgs = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_msg},
        ]

        try:
            content = self._call_llm(provider, api_key, 'deepseek-chat', msgs)
            steps = parse_llm_response(content)
            self.send_json(200, {'steps': steps})
        except Exception as e:
            self.send_json(500, {'error': str(e)})

    def _call_llm(self, provider, api_key, model, messages, temperature=0.7, max_tokens=1000, raw=False):
        """Call LLM and return content string. If raw=True, return raw content without JSON parsing."""
        if provider == 'deepseek':
            url = 'https://api.deepseek.com/v1/chat/completions'
        else:
            url = 'https://api.openai.com/v1/chat/completions'
            if model == 'deepseek-chat':
                model = 'gpt-4o-mini'

        req_body = json.dumps({
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
        }).encode('utf-8')

        req = urllib.request.Request(url, data=req_body, headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        })

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw_data = json.loads(resp.read().decode('utf-8'))
                content = raw_data['choices'][0]['message']['content'].strip()
                if raw:
                    return content
                # Validate JSON parse for breakdown/subdivide
                parse_llm_response(content)
                return content
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='replace')
            try:
                err_json = json.loads(err_body)
                msg = err_json.get('error', {}).get('message', str(e))
            except Exception:
                msg = f'HTTP {e.code}: {err_body[:200]}'
            raise Exception(msg)
        except Exception as e:
            if isinstance(e, Exception) and 'parse' not in str(e).lower():
                raise
            raise e

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        if '/api/' in str(args):
            print(f"  -> API call: {args[0]}")
        else:
            pass


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), TaskQuestHandler) as httpd:
        print(f"""
  === TaskQuest Server ===
  Open: http://localhost:{PORT}
  Press Ctrl+C to stop
""")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == '__main__':
    main()
