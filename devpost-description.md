# TaskQuest — Devpost Submission Description

> **Tagline**: AI turns overwhelming schoolwork into tiny quests — with a pet companion that grows as you go.

---

## 🎯 The Problem

For a neurodivergent K-12 student, "write a book report" isn't one task. It's a wall.

ADHD and executive dysfunction turn large assignments into paralysis: the brain knows what to do but physically cannot start. A 10-year-old stares at a blank page for three hours — not from laziness, but from task-initiation freeze. Traditional to-do apps assume the user already knows how to plan. But for ND kids, the hard part isn't knowing *what* to do. It's *starting*.

Existing tools miss the mark in at least one critical way:

- **Goblin.tools** does AI task breakdown beautifully — but has zero gamification, no K-12 design, no voice input, and no accessibility features for young readers.
- **Habitica** gamifies productivity with RPG mechanics — but uses punishment-based systems (lost health, damaged party members) that backfire for rejection-sensitive ADHD brains, and has no AI breakdown.
- **Finch** offers gentle pet-based self-care — but no AI task breakdown, no K-12 focus, and its busy interface can overstimulate ND users.
- **Sprout** adds a guilt-free pet to task management — but limited AI features, adult-focused design, no voice input, no dyslexia accommodations.

**No existing tool combines AI task breakdown, child-safe gamification, and K-12 accessibility features in one product.**

---

## ✨ The Solution

TaskQuest does four things at once:

### 1. AI Breaks It Down
Type — or just say — any overwhelming task. DeepSeek's LLM splits it into 4–7 micro-steps of 2–15 minutes each. The first step is always absurdly easy: *"Open a blank document. You don't have to write anything yet."* Every step gets a warm, one-sentence hint. No judgment, no "just" or "simply."

### 2. Game Mechanics Reward Starting
XP, coins, and a streak that **only goes up** — never resets to zero, never punishes. Escalating sound effects (C-major pentatonic, Valorant-style) turn step completion into a dopamine hit. Complete the whole quest and the screen erupts in confetti, particles, and a pet celebration. Undo is instant and fully reverses rewards — zero shame.

### 3. A Pet Grows With You
Choose a companion (dragon, cat, plant, or mystic), name it, and watch it evolve through three stages as you level up. The pet sways, bounces, blinks, and celebrates every win with hearts. It says encouraging things. It **never dies, never shames**, and welcomes you back warmly after a break: *"You're back! I missed you! Let's go! ⚡"*

### 4. Designed for Actual K-12 Kids
- 🎤 **Voice input** (Web Speech API): early readers say their task out loud — it questifies instantly. No typing needed.
- 🅰️ **One-tap dyslexia font** (OpenDyslexic, SIL OFL license): persisted preference, works everywhere.
- 🔎 **Focus mode** (default): only the next step is visible. Others collapse into slim bars. Tap one to reveal *just that one* — never the whole intimidating wall.
- 💬 **AI Coach**: 1–3 sentence replies, simple vocabulary, guiding questions. Prompt explicitly told "Your user is a K-12 student."
- ⏱️ **2-minute first steps**: engineered into the AI prompt. The hardest part of any task is starting.

---

## 🤖 How AI Is Used Meaningfully

TaskQuest uses DeepSeek's LLM in three modes, each with carefully prompt-engineered constraints for K-12 ADHD brains:

| Mode | What It Does | K-12 Constraint |
|---|---|---|
| **Questify** | Full task → 4–7 micro-steps | First step ≤3 min, no "just"/"simply", 2–15 min each |
| **Too Big** | One step → 2–3 tinier sub-steps | 1–5 min each, "absurdly easy to start" |
| **AI Coach** | Conversational support per step | 1–3 sentences max, simple words, guiding questions not orders, explicitly told user is K-12 |

AI isn't a chatbot bolted on as an afterthought. It's the engine that makes the entire product adaptive to *any* assignment a student faces — math homework, book reports, science projects, reading goals.

All API keys stay server-side (Netlify Functions). The student never sees a prompt, a configuration screen, or a single mention of "LLM."

---

## 🧠 Neurodivergent User Involvement

> ⚠️ *Section to update after real K-12 testing — see note at bottom.*

TaskQuest is built by a neurodivergent (ADHD) developer who has lived the exact task-initiation paralysis this tool addresses. The core design decisions — micro-steps, focus mode, single-step reveal, pet-based motivation, zero-penalty streak — come from firsthand experience, not assumptions.

A structured child-perspective usability walkthrough (simulating a 10-year-old with ADHD interacting with the deployed product) surfaced critical friction points, all addressed before submission:

| Finding | Fix |
|---|---|
| Pet modal auto-popup at 0.8s blocked the first interaction | Moved to after first completed step — earn the reward, then meet your companion |
| "Tap to reveal" in focus mode expanded ALL steps at once | Now reveals only the clicked step — safe exploration, no wall of text |
| Pet evolution at level 4 felt too far for day-one motivation | Lowered to level 3 — ~1.5 quests to see your pet grow |
| Speech bubbles disappeared too fast for slow readers | Extended from 3s to 4.5s |
| "Unfreezable" is a confusing made-up word | Replaced with "tiny steps you can actually start" |
| No voice input — early readers can't type fluently | Added native Web Speech API: speak → quest, instantly |
| No dyslexia-friendly reading option | Added one-tap OpenDyslexic font toggle (persisted) |

> **[FILL IN AFTER TESTING]**: We tested TaskQuest with [NAME], a [GRADE]-grade student with [ADHD / dyslexia / autism]. They [specific observation: what surprised them, what confused them, what delighted them]. Their feedback directly led to [specific change made]. The most important thing we learned: [one sentence insight].

---

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS — zero dependencies, zero build step, 1,700 lines
- **AI**: DeepSeek API (deepseek-chat), prompt-engineered for K-12 ADHD
- **Backend**: Netlify Functions (serverless proxy — API key never reaches the browser)
- **Accessibility**: Web Speech API (voice input), OpenDyslexic webfont (jsDelivr CDN), `prefers-reduced-motion` full coverage, keyboard-navigable all interactive elements
- **Persistence**: localStorage (no account, no tracking, no ads — all data stays on the student's device)

---

## 🚀 Try It Now

**Live**: [https://lovely-conkies-70714e.netlify.app/](https://lovely-conkies-70714e.netlify.app/)
**Source**: [https://github.com/JOE-gong66/taskquest](https://github.com/JOE-gong66/taskquest)

No sign-up. No API key. Works instantly. Voice input on Chrome/Edge/Safari.

---

## 🔮 What's Next

- Real K-12 classroom pilot with neurodivergent students
- Teacher/parent dashboard with progress visibility
- Multi-language voice input (Mandarin, Spanish, Arabic)
- Curriculum-aligned quest templates
- Optional cloud sync (with explicit guardian consent)
