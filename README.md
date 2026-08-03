# ⚔️ TaskQuest — Turn Tasks into Quests

**Built for IncludAI — The Neurodiversity Hackathon (with Stanford NNEA), 2026.**

TaskQuest is an AI-powered game that breaks overwhelming schoolwork into tiny, impossibly-easy micro-steps — so a K-12 student with ADHD or executive dysfunction can actually *start* instead of freezing at the assignment.

XP, coins, streaks, a growing pet companion, and escalating "kill-streak" sound effects turn homework into a quest a kid actually wants to begin.

> Built by a neurodivergent learner, for neurodivergent learners. Nothing about us without us.

---

## 🎯 The Problem

People with ADHD and executive dysfunction often experience **task-initiation freeze**: facing a large assignment ("write my book report", "finish my math homework", "read 20 pages"), the brain simply cannot start. Traditional to-do apps assume a user who can plan — but the hard part for neurodivergent K-12 students isn't *knowing* what to do, it's *starting*.

## ✨ The Solution

1. **AI task breakdown** — paste any overwhelming task, and DeepSeek's LLM splits it into 4–7 micro-steps, each 2–15 minutes, with a warm zero-judgment hint. The first step is always absurdly easy (open the document, no writing).
2. **Game mechanics for dopamine** — each completed step grants XP, coins, and a streak multiplier. Complete steps in a row and the sound escalates like a Valorant kill-streak: single pop → double → triple → full fanfare. The brain gets immediate, escalating reward.
3. **Zero punishment** — miss a day? Streak resets, nothing bad happens. Undo is instant. The design never shames — ADHD responds to reward, not punishment.

## 🎮 Features

- AI-powered micro-task breakdown (DeepSeek) — any assignment becomes 4–7 steps of 2–15 minutes
- **"Too big" button** — one click breaks any still-overwhelming step into even tinier sub-steps
- **AI Coach** — chat with a warm ADHD coach about a stuck step; short 1–3 sentence replies that don't overwhelm
- **Growing pet companion** — pick a pet, name it, and watch it evolve as you level up
- **Focus mode** (default) — shows only your next step, so the path never looks scary
- XP / level system with progress bar + "X to next level" countdown
- Coin rewards + streak multiplier (a missed day resets the streak — nothing bad happens)
- Escalating kill-streak sound effects (3 volume levels, respects reduce-motion)
- Daily quests — 3 tiny tasks per day, no decisions needed
- Click-to-complete with instant undo (rewards fully reversed)
- All data stays in the browser (localStorage) — no account, no tracking, no ads

## 🛠 Tech Stack

- Vanilla HTML / CSS / JS (no build step)
- DeepSeek API (LLM task breakdown)
- Netlify Functions (serverless API proxy — key stays server-side)
- Netlify (hosting)

## 🚀 Live Demo

**[Try TaskQuest live](https://lovely-conkies-70714e.netlify.app/)** — no sign-up, no API key needed, works instantly.

## 🧠 Designed With Real Neurodivergent Users

This project is designed and validated by a neurodivergent (ADHD) learner. The core insight — that task initiation, not task understanding, is the real barrier — comes from lived experience. *(Expand with K-12 user testing notes.)*

## 📄 Submission Materials

- Demo video: [link]
- Devpost: [link]

## 🏁 Quick Start (local dev)

```bash
# 1. Serve static files + local API proxy
python server.py
# 2. Open http://localhost:8765
```

## 📬 Contact

Built with ❤️ during the IncludAI 2026 hackathon.
