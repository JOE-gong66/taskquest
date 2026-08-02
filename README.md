# ⚔️ TaskQuest — Turn Tasks into Quests

**Built for IncludAI — The Neurodiversity Hackathon (with Stanford NNEA), 2026.**

TaskQuest breaks overwhelming tasks into tiny, impossibly-easy micro-steps and wraps them in game mechanics — XP, coins, streaks, and escalating "kill-streak" sound effects — so a frozen ADHD brain can actually *start*.

> Built by a neurodivergent learner, for neurodivergent learners. Nothing about us without us.

---

## 🎯 The Problem

People with ADHD and executive dysfunction often experience **task-initiation freeze**: facing a large task ("write my essay", "clean my room"), the brain simply cannot start. Traditional to-do apps assume a user who can plan — but the hard part for us isn't *knowing* what to do, it's *starting*.

## ✨ The Solution

1. **AI task breakdown** — paste any overwhelming task, and DeepSeek's LLM splits it into 4–7 micro-steps, each 2–15 minutes, with a warm zero-judgment hint. The first step is always absurdly easy (open the document, no writing).
2. **Game mechanics for dopamine** — each completed step grants XP, coins, and a streak multiplier. Complete steps in a row and the sound escalates like a Valorant kill-streak: single pop → double → triple → full fanfare. The brain gets immediate, escalating reward.
3. **Zero punishment** — miss a day? Streak resets, nothing bad happens. Undo is instant. The design never shames — ADHD responds to reward, not punishment.

## 🎮 Features

- AI-powered micro-task breakdown (DeepSeek)
- XP / level system with progress bar
- Coin rewards + streak multiplier
- Escalating kill-streak sound effects (3 volume levels)
- Daily quests — 3 tiny tasks per day, no decisions needed
- Click-to-complete with instant undo (rewards fully reversed)
- All data stays in the browser (localStorage) — no account, no tracking

## 🛠 Tech Stack

- Vanilla HTML / CSS / JS (no build step)
- DeepSeek API (LLM task breakdown)
- Netlify Functions (serverless API proxy — key stays server-side)
- Netlify (hosting)

## 🚀 Live Demo

[Live Demo Link]

## 🧠 Designed With Real Neurodivergent Users

This project is designed and validated by a neurodivergent (ADHD) learner. The core insight — that task initiation, not task understanding, is the real barrier — comes from lived experience. *(Expand with user testing notes.)*

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
