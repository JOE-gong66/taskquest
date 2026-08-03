> ⚠️ DRAFT — 待 Joe 本人审阅,尤其是叙事角度与个人经历部分
>
> All code in this project was written after August 1, 2026.
> No pre-existing code or assets were used.

# TaskQuest — Devpost Submission

**IncludAI 2026 · Track 1: AI for K-12 Neurodivergent Learners**

---

## 1. The Problem

For K-12 students with ADHD, the hardest part of any assignment isn't understanding it — it's **starting**.

"Write a book report" is not one task to a neurodivergent brain. It's an undifferentiated wall of sub-tasks (find the book, open a doc, read, take notes, outline, write, revise, format...) — all demanding to be held in working memory simultaneously. The brain overloads. The cursor blinks. Nothing happens.

Existing tools fall into two camps:
- **To-do apps** assume the user can already break down tasks — exactly the skill that's impaired
- **AI chatbots** can give advice, but don't close the loop: they don't learn from the user's behavior, and they don't present results in a way that's safe for an overwhelmed brain

TaskQuest bridges this gap: AI breaks the task down, game design makes starting irresistible, and a local-only adaptive profile makes the breakdowns *better every time you use it*.

---

## 2. Target Users

**Primary:** K-12 students with ADHD, executive dysfunction, or task-initiation difficulty.

**Secondary:** Any learner who freezes at large assignments — including students with anxiety, dyslexia, or autism spectrum traits that affect executive function.

**Design principle:** Built by a neurodivergent developer with ADHD. Every design decision — from the default focus mode to the "only goes up" streak to the ban on negative framing — comes from lived experience, not clinical assumptions.

---

## 3. How AI Is Used Meaningfully

TaskQuest uses AI in a **closed adaptive loop**, not as a one-shot oracle:

### The Loop
1. **Input** — User types or speaks a task ("write a book report about Charlotte's Web")
2. **AI Breakdown** — DeepSeek API splits it into 4–7 micro-steps with titles, hints, time estimates, and verb-type tags
3. **User Action** — Student completes steps, splits steps that feel too big, or undoes splits
4. **Local Logging** — Every action is recorded as a `stepEvent` with timing, verb type, depth, and outcome
5. **Profile Computation** — A pure JavaScript function (`buildUserProfile`) computes the user's ideal step length, strongest verb types, typical chain length, and hardest task categories — using only median/quartile/group-count statistics (no ML, no server)
6. **Prompt Injection** — The profile is rendered as natural language and injected into the next breakdown request, so the AI adapts its output

### What Makes This Innovative
- **Same input, different output** — "write a book report" produces 5 generic steps for a new user, but 7 physical-action steps at ~2 minutes each for a 3-week user
- **User-in-the-loop** — every profile insight is visible, editable, and toggleable. The user is the final authority
- **Local-first** — the profile never leaves the browser. Only the task text goes to the API
- **Zero-setup production** — the API key is server-side (Netlify env var). Users open the URL and it works

### Additional AI Features
- **AI Coach** — conversational helper for individual stuck steps (1–3 sentence replies, kid-friendly language)
- **Recursive Subdivide** — any step can be broken into 2–3 even smaller sub-steps
- **Demo mode** — works without any API key for testing and evaluation

---

## 4. Neurodivergent User Involvement in Design & Testing

### Design
The entire product is shaped by the developer's own ADHD experience:

- **Focus mode as default** — the developer knows firsthand that seeing all steps at once triggers freeze, not motivation
- **"Too big" button** — born from the experience of AI-generated steps still feeling overwhelming
- **Pet that never dies or guilts** — a direct rejection of Tamagotchi-style punishment mechanics that trigger RSD
- **Best streak, not current streak** — based on the insight that a dropped counter is an exit trigger, not a motivator
- **All positive framing** — every string audited for shame triggers; "you start best with X" never "you fail at Y"
- **Editable profile** — designed for users who hate being labeled by algorithms without consent

### Testing
[TODO: Joe to fill in after real testing sessions]
- [ ] Number of K-12 testers:
- [ ] Age range:
- [ ] Key findings:
- [ ] Changes made based on feedback:
- [ ] Quotes from testers (with permission):

### Pre-submission Validation
- [ ] Focus mode toggle tested: 5 cycles, consistent behavior, persists across refresh
- [ ] Screen reader walkthrough: Narrator, task input → step completion → XP announcement
- [ ] Demo profile contrast: "write a book report" — new user vs 3-week user
- [ ] Export/clear data tested
- [ ] All profile panel text audited for positive framing

---

## Technical Notes for Judges

- **100% vanilla JS** — no React, no build step, no npm. Three files: `index.html`, `script.js`, `style.css`
- **`script.js` is ~2100 lines** — single-file architecture chosen deliberately so a judge can read the entire application logic in one sitting
- **API proxy is serverless** — `netlify/functions/questify.js` (~200 lines) handles all LLM communication
- **No external analytics, no CDN except OpenDyslexic font** — privacy-respecting by design
- **GitHub**: https://github.com/JOE-gong66/taskquest
- **Live**: https://lovely-conkies-70714e.netlify.app/

---

## Screenshot Checklist (for Joe)

Place these in `docs/` before submitting:

- [ ] `docs/breakdown.png` — AI breakdown result: 7 steps cascading after Questify
- [ ] `docs/subdivide.png` — Before/after: a step split into 3 sub-steps, with the undo bar visible
- [ ] `docs/focus-mode.png` — Focus mode active: one step visible, others collapsed, "Step 3 of 7" visible
- [ ] `docs/adaptive-comparison.png` — Side-by-side: same input, new user (5 steps) vs demo user (7 steps, all physical)
- [ ] `docs/coach.png` — AI Coach panel open with a typed response visible
- [ ] `docs/pet.png` — Pet sanctuary with pet, name tag, speech bubble, and accessory
- [ ] `docs/profile-panel.png` — Learning profile panel open, showing metrics and editable fields
- [ ] `docs/full-app.png` — Full app screenshot: header stats, quest board, daily quests, pet, all visible
