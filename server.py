"""
TaskQuest local server — serves static files + proxies LLM API calls.
This solves CORS (no more "blocked by CORS policy" errors).
Run: python server.py
"""
import http.server
import json
import urllib.request
import urllib.error
import os
import socketserver

PORT = 8765
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))


class TaskQuestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/api/questify':
            self.handle_questify()
        else:
            self.send_error(404)

    def handle_questify(self):
        # Read request body
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body)

        task = data.get('task', '')
        api_key = data.get('api_key', '')
        provider = data.get('provider', 'deepseek')  # 'deepseek' or 'openai'

        if not api_key:
            self.send_json(400, {'error': 'No API key provided.'})
            return

        if not task:
            self.send_json(400, {'error': 'No task provided.'})
            return

        # Route to the right provider
        if provider == 'deepseek':
            result = self.call_deepseek(task, api_key)
        else:
            result = self.call_openai(task, api_key)

        self.send_json(200 if 'steps' in result else 500, result)

    def call_deepseek(self, task, api_key):
        """DeepSeek API — OpenAI-compatible endpoint"""
        return self._call_llm(
            url='https://api.deepseek.com/v1/chat/completions',
            api_key=api_key,
            model='deepseek-chat',
            task=task,
        )

    def call_openai(self, task, api_key):
        """OpenAI API"""
        return self._call_llm(
            url='https://api.openai.com/v1/chat/completions',
            api_key=api_key,
            model='gpt-4o-mini',
            task=task,
        )

    def _call_llm(self, url, api_key, model, task):
        system_prompt = get_system_prompt()

        req_body = json.dumps({
            'model': model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f'Break down this task for me: "{task}"'},
            ],
            'temperature': 0.7,
            'max_tokens': 1000,
        }).encode('utf-8')

        req = urllib.request.Request(url, data=req_body, headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        })

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = json.loads(resp.read().decode('utf-8'))
                content = raw['choices'][0]['message']['content'].strip()
                steps = parse_llm_response(content)
                return {'steps': steps}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='replace')
            try:
                err_json = json.loads(err_body)
                msg = err_json.get('error', {}).get('message', str(e))
            except Exception:
                msg = f'HTTP {e.code}: {err_body[:200]}'
            return {'error': msg}
        except Exception as e:
            return {'error': str(e)}

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        # Quieter logs
        if '/api/' in str(args):
            print(f"  → API call: {args[0]}")
        else:
            pass  # suppress static file logs


def get_system_prompt():
    return """You are an ADHD-friendly task coach. Your job is to break down a big, overwhelming task into tiny, impossibly-easy micro-steps.

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

Give 4–7 steps. The first step must be absurdly easy — something the user can do in under 3 minutes."""


def parse_llm_response(content):
    """Parse JSON from LLM response, handling markdown wrapping."""
    json_str = content.strip()
    if json_str.startswith('```'):
        json_str = json_str.replace('```json', '').replace('```', '').strip()
    try:
        parsed = json.loads(json_str)
    except json.JSONDecodeError:
        # Try to extract JSON object from text
        import re
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


def main():
    # Allow address reuse (avoid "Address already in use" on restart)
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(("", PORT), TaskQuestHandler) as httpd:
        print(f"""
  === TaskQuest Server ===
  Open: http://localhost:{PORT}
  APIs: DeepSeek / OpenAI
  Press Ctrl+C to stop
""")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped.")


if __name__ == '__main__':
    main()
