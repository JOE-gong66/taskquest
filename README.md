> ⚠️ DRAFT — 待 Joe 本人审阅,尤其是叙事角度与个人经历部分

# ⚔️ TaskQuest — Turn Tasks into Quests

**An AI-powered game that breaks overwhelming schoolwork into tiny micro-steps — so K-12 students with ADHD can actually *start* instead of freeze.**

**[Try it live](https://lovely-conkies-70714e.netlify.app/)** — no sign-up, no API key, works instantly.

Built for **IncludAI 2026** (Track 1: AI for K-12 Neurodivergent Learners). Solo project by a neurodivergent (ADHD) developer.

---

## The Problem

For a neurodivergent kid, "write a book report" isn't one task. It's a wall.

ADHD and executive dysfunction cause **task-initiation freeze**: the brain knows what to do, it just cannot start. Traditional to-do apps assume a user who can plan — but the hard part isn't *knowing* the steps, it's taking the first one. Seeing all seven steps at once makes it worse: the wall gets higher, not lower.

The clock ticks. The cursor blinks. Nothing happens.

---

## Key Features

### AI Task Breakdown
Paste any overwhelming assignment. DeepSeek's LLM splits it into 4–7 micro-steps, each 2–15 minutes. The first step is always absurdly easy — "open your notebook" takes 2 minutes. Every step includes a warm, zero-judgment hint.

![](docs/breakdown.png)

### Recursive "Too Big" + Undo Split
Any step still feels too big? One click breaks it into 2–3 even tinier sub-steps. Changed your mind? "Undo split" puts the original step back — rewards reversed, no trace left behind.

![](docs/subdivide.png)

### Focus Mode (Default)
Only your next undone step is visible. Others collapse into slim bars with a "tap to reveal" hint. Because seeing seven things at once is why you froze in the first place. A progress indicator shows "Step 3 of 7" so you always know where you stand.

![](docs/focus-mode.png)

### Adaptive Step Sizing (★ Innovation)
The system learns *your* rhythm. A local-only user profile tracks which step lengths you complete, which verb types you start fastest with, and which task categories need extra breakdown. This profile is injected into the AI prompt — so the same input produces different results for different learners.

| New user | After 3 weeks |
|---|---|
| Generic 5 steps, mixed types | 7 steps, all physical-action starters, ~2 min each |

![](docs/adaptive-comparison.png)

You can view and edit your profile anytime. You can turn off any insight. You can clear everything. The system works *for* you — not the other way around.

### AI Coach
Stuck on a step? Open the coach panel. Click "Write a starter" or "Guide me with a question." The AI replies in 1–3 sentences, kid-friendly words, zero judgment. Chat history persists across sessions.

![](docs/coach.png)

### Accessibility
- **Voice input** — early readers say their task out loud (Web Speech API, Chrome/Edge/Safari)
- **OpenDyslexic font toggle** — one tap, entire page switches
- **Screen reader support** — `aria-live` regions announce step completion, XP, next steps, and errors
- **Full keyboard navigation** — every interactive element reachable via Tab/Enter
- **`prefers-reduced-motion` respected** — all animations disabled when OS says so
- **No bare emojis** — decorative emojis wrapped in `aria-hidden="true"`, informational ones have labels

### Pet Companion + Game Loop
Pick a pet, name it, watch it evolve at level 3. Completing steps triggers escalating sound effects (think: game kill-streak), particle bursts, and pet celebrations. Coins earned can buy dress-up accessories in the pet shop. Miss a day? Your pet says "You're back! I missed you!" — never guilt, never punishment.

![](docs/pet.png)

---

## How AI Is Used Meaningfully

This is not a ChatGPT wrapper. The AI does one thing — task breakdown — inside a closed loop that makes it *better over time*:

1. **Local behavior log** — every step completion, split, and undo is recorded (`stepEvents`) with timing, verb type, depth, and outcome
2. **On-device profile** — a pure-function statistical analysis (median, quartile, group counts — no ML, no server) computes your ideal step length, strongest verb types, chain length, and hardest categories
3. **Prompt injection** — the profile is rendered as natural language and injected into the breakdown system prompt, so the AI adapts its output to *your* data
4. **User-in-the-loop** — every profile insight is visible, editable, and toggleable. You are the final authority on how the system adapts

```
task input → AI breakdown → user actions → stepEvents log
                                              ↓
                              buildUserProfile() (local, pure function)
                                              ↓
                              renderProfileHint() → injected into next request
```

The same input ("write a book report") produces *different* breakdowns for different users — because the system has learned how *you* work.

---

## Accessibility & Design Decisions

### Why we show `bestStreak` instead of a streak that resets

ADHD brains are sensitive to rejection and shame (RSD — Rejection Sensitive Dysphoria). A streak that drops to zero after a missed day is a **punishment trigger**, not a motivator. It makes the user want to quit rather than come back.

`bestStreak` only goes up. It records your personal record — a celebration of what you *have* done, not a countdown since your last win. This is the same design principle behind Apple Fitness's "Longest Move Streak."

### Why the learning profile is editable and clearable

Many adaptive systems make decisions *about* the user without the user's knowledge or consent. For a neurodivergent learner — who may already feel labeled, tracked, or judged by systems — this is alienating.

TaskQuest's profile panel:
- Shows exactly what the system has inferred
- Lets you change any number ("no, I actually prefer 5-minute steps")
- Lets you turn off any insight ("stop using verb-type data")
- Includes a one-click "Clear all data" button

Agency is not optional. The user owns their data and their profile.

### Why all copy uses positive framing only

"You tend to abandon tasks over 6 minutes" is a shame trigger. "You start fastest with steps around 3 minutes" is useful information.

Every string in TaskQuest follows one rule: **describe what works, never what fails.** This applies to the profile panel, the coach, the hints, the toast messages, and every error state. ADHD users have heard enough about what's wrong with them. This tool tells them what's right.

---

## Built With

- **Vanilla HTML / CSS / JavaScript** — no framework, no build step, no npm install
- **DeepSeek API** — LLM for task breakdown, subdivide, and coach modes
- **Netlify Functions** — serverless API proxy (API key stays server-side, never exposed to client)
- **Web Speech API** — browser-native voice input, no external dependency
- **Web Audio API** — synthesized sound effects, no audio files
- **OpenDyslexic** — dyslexia-friendly webfont (SIL OFL license, served from jsDelivr CDN)

### Run locally

```bash
# 1. Start the local server (serves static files + proxies API calls)
python server.py
# 2. Open http://localhost:8765
# 3. Paste a DeepSeek or OpenAI API key, or click "Demo mode"
```

Zero build step. Zero `npm install`. The entire app is three files: `index.html`, `script.js`, `style.css`.

---

## Privacy

- **All data stays in your browser** (localStorage)
- **No accounts, no sign-up, no tracking, no ads**
- **Only your task text leaves your device** — sent to the DeepSeek API for breakdown
- **In production (Netlify), the API key is server-side** — users never see or enter it
- **You can export or delete all your data anytime** from the Learning Profile panel

---

## Future Work

### Disengagement Detection (sensing when a student is stuck)

The `stepEvents` log already tracks `shownAt` and `completedAt` timestamps. A natural next step is detecting **stall patterns**: when a step has been visible for significantly longer than the user's median time-to-first-action, the system could proactively offer:

- "Want me to break this into even smaller pieces?"
- "Here's a different way to think about this step."
- A gentle prompt to the AI Coach with context about the stall

This was **not implemented in the hackathon submission** because:
1. Reliable stall detection requires a larger event corpus than can be built in 3 days
2. False positives (offering help when the user is just thinking) are worse than no detection — they feel intrusive
3. We prioritized core experience quality and accessibility over speculative features

### Other planned improvements
- Parent/teacher dashboard (opt-in, shareable link)
- Multi-language support (prompt translation layer)
- Offline PWA with service-worker caching for the demo mode
- Integration with school LMS (Google Classroom, Canvas)

---

## Development Notes

This project was built solo between August 1–7, 2026, using AI-assisted
development (Claude Code with DeepSeek). All architecture decisions, the
adaptive-profiling design, the accessibility requirements, and every
user-facing string were specified and reviewed by me; AI accelerated
implementation.

Two decisions worth naming, because they came from lived experience rather
than from a model: replacing the streak counter with a best-streak counter
(a reset triggers the exact shame response the tool exists to avoid), and
rewriting all 65 user-facing strings to remove deficit framing.

No pre-existing code or assets were used.

---

## Acknowledgments

Built with ❤️ during the IncludAI 2026 Hackathon.

- **Testers** — [TODO: add names/handles of testers who provided feedback]
- **OpenDyslexic** by Abbie Gonzalez (SIL OFL)
- **DeepSeek** for the API that powers the AI breakdowns

---

*Nothing about us without us.*
