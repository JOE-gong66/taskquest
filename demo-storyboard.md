# TaskQuest Demo Video — Director's Treatment

**Director's note**: This isn't a feature walkthrough. It's a 3-minute story about one moment — the freeze, and the unfreeze. Every frame either builds empathy or shows the solution. No bullet points. No "and then, and then." Just one clean emotional arc.

**Tone**: Warm, calm, sincere. Think *Khan Academy* voiceover, not tech pitch. No hype words. Let the product speak.

**Music**: Soft lo-fi beat under ACT 1–2. It drops out during ACT 3 (let the sound effects carry). Returns gently for ACT 5.

**Total runtime target**: 2:50 (10s buffer for YouTube intro/outro).

---

## ACT 1 — THE FREEZE (0:00 – 0:30)

**Visual (0:00–0:15)**
> Black screen. Fade in: a text editor. Cursor blinks next to "write a book report about Charlotte's Web."
> Nothing happens. 3 seconds of silence. Cursor keeps blinking.
> Cut to wider shot: empty desk. Clock: 3:47 PM. Then 4:12 PM. Same blank screen.
> Clock shows 5:03 PM.

**Voiceover (calm, measured)**
> "For a neurodivergent kid, 'write a book report' isn't one task.
> It's a wall.
> The brain knows what to do. It just… can't start."

**Visual (0:15–0:30)**
> Cut to TaskQuest interface. Same task text appears in the textarea.
> Warm orange colors. Friendly UI. The 🐉 dragon illustration in the empty state.
> Subtitle visible: "Type it — or just say it. We'll break it into tiny steps you can actually start."

**Voiceover**
> "This is TaskQuest. We built it to answer one question:
> What if starting felt impossible to avoid?"

**CUT TO BLACK (0.5s)**

---

## ACT 2 — THE MAGIC (0:30 – 1:00)

**Visual (0:30–0:45)**
> Screen recording. A cursor clicks "⚡ Questify!"
> Spinner spins (~1.5s).
> **7 steps cascade down** with the slideUp animation.
> Camera lingers on step 1:

> *① Find a cozy spot and put your book and a notebook nearby*
> *💡 You don't need to write anything yet — just open it.*
> *⏱ 2 min*

**Voiceover**
> "AI breaks any assignment into 4 to 7 micro-steps.
> The first one is always absurdly easy.
> Two minutes. No writing. Just open the thing."

**Visual (0:45–1:00)**
> Quick cut: voice input demo.
> 🎤 button is clicked. Red pulse animation.
> Someone says: *"read chapter three."*
> Transcript appears in textarea. Questify auto-fires.
> Steps appear.

**Voiceover**
> "Or just say it. Early readers don't need to type at all."

---

## ACT 3 — THE LOOP (1:00 – 1:50) *music drops out at 1:00*

**Visual (1:00–1:20)**
> Step 1 is clicked. Card pops. Toast: "Step complete! +10 XP +5 🪙"
> Particles burst. Pet bounces happily.
> Step 2 clicked. **Escalating sound** (single pop → double).
> Step 3 clicked. Triple pop. Pet does happy animation + hearts.

**Voiceover (1:00)**
> "Every step completed is an instant reward."

**Voiceover (1:15)**
> "And the companion who's been watching?"

**Visual (1:20–1:50) — THE MONEY SHOT**
> [PRE-LOADED SAVE: pet at level 3 threshold, 199 XP]
> After step 3 completion → level up → **pet evolution triggers.**
> Full screen: evolution overlay. 
> "Bloom evolved into Oak! Level 3 reached! 🌟"
> Sparkles. Spinning emoji. The `petEvolve` animation in its full 1.8s glory.
> **Let this play WITHOUT voiceover.** Just music + sound effects + visual.
> The pet is now 🌳 instead of 🌸.

**Voiceover (1:45, as evolution fades)**
> "Your pet evolves as you level up.
> And when life happens and you miss a day?
> It just says:"

**Visual (1:45–1:50)**
> Pet speech bubble: "You're back! I missed you! Let's go! ⚡"

---

## ACT 4 — THE DETAILS (1:50 – 2:25)

**Visual (1:50–1:55) — Font**
> Click 🅰️ → 🔤. Entire page font flips to OpenDyslexic.

**Visual (1:55–2:05) — Focus Mode**
> Default view: only 1 step visible. Others are collapsed bars.
> Click one collapsed bar. That ONE step reveals. Others stay hidden.
> Click the focus toggle: "📋 Show all steps" → all visible.

**Voiceover (1:50–2:05)**
> "Dyslexia-friendly font. One tap.
> Focus mode. Only your next step — because seeing seven things at once is why
> you froze in the first place."

**Visual (2:05–2:25) — Coach**
> Click "💬 Coach" on a step.
> Right panel slides in. Quick action: "📝 Write a starter"
> AI types out: "The first sentence can be: 'Charlotte's Web is about a girl named Fern who...' Finish it however you want. 🙂"
> Coach panel slides away.

**Voiceover (2:05–2:25)**
> "Stuck on a step? The AI coach gives you a tiny nudge —
> one to three sentences, kid-friendly words, zero judgment."

---

## ACT 5 — THE CLOSE (2:25 – 2:50)

**Visual (2:25–2:35)**
> Back to the quest board. All steps now have ✓.
> **Quest complete banner**: "🎉 QUEST COMPLETE! +50 XP bonus!"
> Full-screen confetti. Pet triple-happy-jump + 10 hearts.

**Voiceover (2:25)**
> "And when you finish the whole quest?
> Yeah. That deserves a moment."

**Visual (2:35–2:50)**
> Fade to TaskQuest logo: ⚔️ TaskQuest
> Tagline: *Turn Tasks into Quests*
> Subtitle: *Built for neurodivergent K-12 students, by a neurodivergent learner · IncludAI 2026*
> Bottom: github.com/JOE-gong66/taskquest · [live demo URL]

**Voiceover (2:35)**
> "TaskQuest. No signup. No tracking. No ads.
> Just tiny steps — and a friend who's proud of you."

**Fade to black (2:50)**

---

## PRE-PRODUCTION CHECKLIST

### ☐ Prepare pre-filled localStorage save
Open the live site, run this in console before recording ACT 3:

```js
const s = JSON.parse(localStorage.taskquest_state);
s.totalXP = 195;                         // 5 XP away from level 3
s.coins = 42;
s.streak = 3;
s.bestStreak = 5;
s.pet = { type: 'plant', name: 'Bloom' };
s.petInviteShown = true;
s.activeQuest = {
  task: 'write a book report about Charlotte\'s Web',
  steps: [
    { id: 's1', title: 'Find a cozy spot and put your book and a notebook nearby', hint: 'You don\'t need to write anything yet — just open it.', minutes: 2 },
    { id: 's2', title: 'Read the first chapter and note one thing that surprised you', hint: 'One sentence is enough. What stood out?', minutes: 10 },
    { id: 's3', title: 'Write one messy sentence about the main character', hint: 'It can be terrible. Getting words on the page is the goal.', minutes: 5 },
  ],
};
s.completedStepIds = ['s1', 's2'];       // first two done, third triggers evolution
s.questCompleted = false;
s.focusMode = true;
s.easyFont = false;
s.revealedSteps = [];
localStorage.taskquest_state = JSON.stringify(s);
location.reload();
```

### ☐ Recording setup
- [ ] Screen recording at 1080p (not 4K — keep file manageable)
- [ ] System audio captured (for sound effects)
- [ ] Microphone: record voiceover separately, or do live narration
- [ ] Close all other tabs, notifications off
- [ ] Dark mode off (TaskQuest is light-themed)

### ☐ If showing a real kid's interaction
- [ ] Parent/guardian consent
- [ ] Frame so face is NOT visible (hands + screen only, or screen-only with voice)
- [ ] Natural, unscripted — the kid's genuine reaction is more powerful than any script

### ☐ Post-production
- [ ] Trim silence at start/end
- [ ] Add soft background music (lo-fi, no lyrics) under voiceover
- [ ] Drop music during ACT 3 evolution (let game audio carry)
- [ ] Add end card with links (last 5 seconds)
- [ ] Export at 1080p, H.264, ≤ 500MB
- [ ] Upload to YouTube (unlisted) or Vimeo

---

## SHOT LIST SUMMARY

| Time | Shot | Duration | Audio |
|---|---|---|---|
| 0:00 | Black → blank page, clock ticking | 30s | VO + lo-fi |
| 0:30 | Questify click → steps cascade | 15s | VO + lo-fi |
| 0:45 | Voice input demo | 15s | VO + lo-fi |
| 1:00 | Complete 3 steps (particles, sound, pet) | 20s | Game audio only |
| 1:20 | **Pet evolution (THE MONEY SHOT)** | 30s | Game audio only |
| 1:50 | Font toggle + focus mode quick cuts | 15s | VO |
| 2:05 | AI Coach demo | 20s | VO |
| 2:25 | Quest complete + confetti | 10s | VO + lo-fi |
| 2:35 | End card | 15s | VO + lo-fi |
| 2:50 | Fade out | — | — |
