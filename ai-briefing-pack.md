# TaskQuest Demo Script — AI Briefing Pack

## What Is TaskQuest
TaskQuest is an AI-powered web app that helps K-12 students with ADHD break overwhelming schoolwork into tiny, game-ified micro-steps. Type (or speak) any task → AI splits it into 4–7 steps of 2–15 minutes each → completing steps earns XP, coins, and grows a virtual pet companion.

**Live**: https://lovely-conkies-70714e.netlify.app/
**Source**: https://github.com/JOE-gong66/taskquest
**Hackathon**: IncludAI 2026, Track 1 (AI for K-12 Neurodivergent Learners)
**Solo project**: Built by one neurodivergent (ADHD) developer

## Key Features (for the video)

| Feature | What to show | Hook line |
|---|---|---|
| AI task breakdown | Type "write a book report about Charlotte's Web" → 7 micro-steps appear | "The first step is always absurdly easy" |
| Voice input | Click 🎤 → say "read chapter three" → auto-questifies | "Early readers don't need to type" |
| Step completion + reward | Click step → particles, sound, toast "+10 XP" | "Every step = instant dopamine" |
| Pet evolution | Pet grows at level 3, full-screen animation with sparkles | "Your companion evolves as you level up" |
| Pet never shames | After a missed day: "You're back! I missed you!" | "Never dies. Never guilts." |
| Dyslexia font toggle | Click 🅰️ → entire page flips to OpenDyslexic | "One tap" |
| Focus mode | Only next step visible, others collapsed. Tap one → reveals just that one | "Because seeing seven things at once is why you froze" |
| AI Coach | Chat panel: click "Write a starter" → AI types 2-sentence nudge | "Kid-friendly words, zero judgment" |
| Quest complete | All steps done → confetti + fanfare + pet celebration | "That deserves a moment" |
| No punishment streak | Streak only goes up, milestones at 3/7/14 days | "It only goes up" |

## Video Constraints
- **3 minutes max** (target 2:45–2:50)
- Upload to YouTube (unlisted) or Vimeo
- Must show "how a neurodivergent user interacts with" the tool
- Screen recording + optional voiceover
- Can use a pre-filled localStorage save to show pet evolution (need ~20 steps normally, can't do that in 3 min)

## Target Audience
Hackathon judges evaluating:
- Impact on neurodivergent youth (30% weight)
- Innovation in AI application (25%)
- Technical execution (10%)
- Presentation quality (10%)

## Tone
- NOT a tech pitch. NOT a feature list read aloud.
- Think: Khan Academy voiceover meets Apple ad.
- Warm, calm, empathetic. 
- Let the product visuals carry the weight. Voiceover is sparse.
- One clear emotional arc: THE FREEZE → THE UNFREEZE.

## Existing Storyboard
A detailed 5-act storyboard exists. Here's the structure:

ACT 1 (0:00-0:30) — THE FREEZE
Blank screen, cursor blinking, clock ticking. No product shown yet.
Purpose: build empathy. Make the judge feel "I've seen this."

ACT 2 (0:30-1:00) — THE MAGIC  
Questify click → steps cascade. Voice input quick demo.
Purpose: show the core AI value prop.

ACT 3 (1:00-1:50) — THE LOOP (THE MONEY SHOT)
Complete 3 steps in a row → escalating sound effects → pet evolves.
The evolution animation plays WITHOUT voiceover. Just game audio + visual.
Purpose: show the emotional peak. This is what judges remember.

ACT 4 (1:50-2:25) — THE DETAILS
Quick cuts: font toggle, focus mode, AI coach.
Purpose: prove depth. Show this isn't a shallow demo.

ACT 5 (2:25-2:50) — THE CLOSE
Quest complete → confetti → end card with links.
Purpose: satisfying ending, clear call to action.

## Pre-filled Save (for the evolution shot)
```js
const s = JSON.parse(localStorage.taskquest_state);
s.totalXP = 195;   // 5 XP away from level 3
s.coins = 42;
s.streak = 3;
s.bestStreak = 5;
s.pet = { type: 'plant', name: 'Bloom' };
s.petInviteShown = true;
s.activeQuest = {
  task: "write a book report about Charlotte's Web",
  steps: [
    { id:'s1', title:'Find a cozy spot and put your book and a notebook nearby', hint:"You don't need to write anything yet — just open it.", minutes:2 },
    { id:'s2', title:'Read the first chapter and note one thing that surprised you', hint:'One sentence is enough. What stood out?', minutes:10 },
    { id:'s3', title:'Write one messy sentence about the main character', hint:'It can be terrible. Getting words on the page is the goal.', minutes:5 },
  ],
};
s.completedStepIds = ['s1','s2'];
s.questCompleted = false;
s.focusMode = true;
s.easyFont = false;
s.revealedSteps = [];
localStorage.taskquest_state = JSON.stringify(s);
location.reload();
```

## What I Need From You
Write a 3-minute demo video script in director's treatment format with:
1. A shot-by-shot breakdown with timestamps
2. Voiceover text for each segment (keep it sparse — 30-40 words per segment max)
3. Notes on what's happening on screen during each shot
4. Audio cues (when music plays, when it drops out)
5. A clear "money shot" moment around 1:20-1:50

The voiceover should sound like a calm, warm narrator — not a sales pitch. Imagine the tone of a great Khan Academy video or a Apple "Shot on iPhone" ad.
