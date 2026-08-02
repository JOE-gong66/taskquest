// ============================================================
//  TaskQuest — AI-powered gamified task breakdown for ADHD
//  IncludAI Neurodiversity Hackathon 2026
// ============================================================

// Production (Netlify): API key lives server-side in env vars.
// Local dev (python server.py): key entered in browser, sent to local proxy.
const IS_PRODUCTION = location.protocol === 'https:' && !location.hostname.includes('localhost');

// ---- STATE (persisted to localStorage) ----
const DEFAULT_STATE = {
  totalXP: 0,
  coins: 0,
  streak: 0,           // current consecutive-day streak
  lastActiveDate: null, // 'YYYY-MM-DD' — for streak tracking
  completedStepIds: [], // IDs of completed steps across all quests
  dailyQuests: {},      // { 'YYYY-MM-DD': [{id, text, icon, xp, done}] }
  activeQuest: null,    // { task, steps: [{id, title, hint, minutes}] }
  questCompleted: false, // whether the +50 quest bonus has been granted
  apiKey: '',           // user's LLM API key
  provider: 'deepseek',  // 'deepseek' or 'openai'
  soundLevel: 'medium',  // 'low' | 'medium' | 'high'
};

let state = loadState();

// ---- DOM REFS ----
const $taskInput    = document.getElementById('task-input');
const $questifyBtn  = document.getElementById('questify-btn');
const $apiKeyInput  = document.getElementById('api-key');
const $demoBtn      = document.getElementById('demo-btn');
const $questBoard   = document.getElementById('quest-board');
const $stepsGrid    = document.getElementById('steps-grid');
const $originalTask = document.getElementById('original-task');
const $questBanner  = document.getElementById('quest-complete-banner');
const $questXpBonus = document.getElementById('quest-xp-bonus');
const $emptyState   = document.getElementById('empty-state');
const $dailySection = document.getElementById('daily-quests-section');
const $dailyGrid    = document.getElementById('daily-grid');
const $toast        = document.getElementById('toast');
const $toastMsg     = document.getElementById('toast-msg');
const $particles    = document.getElementById('particles');
const $xpBar        = document.getElementById('xp-bar');
const $xpCurrent    = document.getElementById('xp-current');
const $levelNum     = document.getElementById('level-num');
const $coinsNum     = document.getElementById('coins-num');
const $streakNum    = document.getElementById('streak-num');

// ---- INIT ----
function init() {
  // In production, hide API key entry — key is server-side.
  if (IS_PRODUCTION) {
    $apiKeyInput.style.display = 'none';
    const sel = document.getElementById('provider-select');
    if (sel) sel.style.display = 'none';
    const hint = document.querySelector('.api-key-row .btn-ghost');
    if (hint) hint.style.display = 'none';
  }

  // Restore API key
  if (state.apiKey) $apiKeyInput.value = state.apiKey;

  // Update streak on page load
  updateStreak();

  // Render UI
  updateStatsBar();
  renderDailyQuests();
  if (state.activeQuest) {
    renderQuestBoard();
  } else {
    $questBoard.style.display = 'none';
    $emptyState.style.display = '';
  }

  // If no active quest but it's a new day, generate dailies
  if (Object.keys(state.dailyQuests).length === 0) {
    generateDailyQuests();
  }
}

// ---- STATE PERSISTENCE ----
function loadState() {
  try {
    const raw = localStorage.getItem('taskquest_state');
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) { /* corrupted data, reset */ }
  return { ...DEFAULT_STATE };
}

function saveState() {
  localStorage.setItem('taskquest_state', JSON.stringify(state));
}

// ---- STATS HELPERS ----
function getLevel() {
  return Math.floor(Math.sqrt(state.totalXP / 50)) + 1;
}

function getXPForNextLevel() {
  const lv = getLevel();
  return lv * lv * 50;
}

function getXPForCurrentLevel() {
  const lv = getLevel() - 1;
  return lv * lv * 50;
}

// ---- STREAK ----
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (state.lastActiveDate === today) return; // already active today

  if (state.lastActiveDate === yesterday) {
    // consecutive
    state.streak += 1;
  } else if (state.lastActiveDate && state.lastActiveDate !== yesterday) {
    // broke streak
    state.streak = 1;
  } else if (!state.lastActiveDate) {
    // first time ever
    state.streak = 1;
  }

  state.lastActiveDate = today;
  saveState();
}

// ---- STATS BAR RENDER ----
function updateStatsBar() {
  const lv = getLevel();
  const currentLvXP = getXPForCurrentLevel();
  const nextLvXP = getXPForNextLevel();
  const lvRange = nextLvXP - currentLvXP;
  const progress = lvRange > 0 ? ((state.totalXP - currentLvXP) / lvRange) * 100 : 0;

  $levelNum.textContent = lv;
  $xpCurrent.textContent = state.totalXP;
  $xpBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  $coinsNum.textContent = state.coins;
  $streakNum.textContent = state.streak;
}

// ---- SOUND (Web Audio API — synthesized, no files needed) ----
let audioCtx = null;

// Volume control (0.0 – 1.0), persisted in state
const SOUND_LEVELS = {
  low: 0.05,
  medium: 0.12,
  high: 0.2,
};

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, startOffset, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startOffset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration + 0.05);
  } catch (e) {
    /* audio not available — don't break the app */
  }
}

// Combo counter for escalating kill-streak style sounds
let comboCount = 0;   // how many steps completed in a row
let lastComboTime = 0;

// Valorant-style escalating kill sounds
// Base key: C major pentatonic (ascending with each kill)
const COMBO_SCALES = [
  [523.25],                    // kill 1: single pop (C5)
  [523.25, 659.25],            // kill 2: double (C5, E5)
  [523.25, 659.25, 783.99],    // kill 3: triple (C5, E5, G5)
  [587.33, 739.99, 880.00],    // kill 4: higher trio (D5, F#5, A5)
  [659.25, 783.99, 987.77],    // kill 5: even higher (E5, G5, B5)
  [784.0, 1046.5, 1318.5],     // kill 6+: HIGH PITCH excitement (G5, C6, E6)
];

function playComboKill(volume) {
  const idx = Math.min(comboCount - 1, COMBO_SCALES.length - 1);
  const notes = COMBO_SCALES[idx];
  notes.forEach((freq, i) => {
    playTone(freq, i * 0.08, 0.18, 'triangle', volume);
    // Add a subtle sparkle on top for higher combos
    if (comboCount >= 4) {
      playTone(freq * 2, i * 0.08, 0.1, 'sine', volume * 0.4);
    }
  });
}

function playSound(kind) {
  const vol = SOUND_LEVELS[state.soundLevel] ?? SOUND_LEVELS.medium;

  switch (kind) {
    case 'complete':
      // Escalating kill-streak style
      const now = Date.now();
      if (now - lastComboTime < 2000) {
        comboCount += 1;      // continuing combo
      } else {
        comboCount = 1;       // combo reset
      }
      lastComboTime = now;
      playComboKill(vol);
      break;

    case 'undo':
      comboCount = 0;          // undo breaks the combo
      playTone(330, 0, 0.08, 'sine', vol * 0.7);
      playTone(247, 0.07, 0.12, 'sine', vol * 0.7);
      break;

    case 'questComplete':
      comboCount = 0;
      playTone(523.25, 0, 0.12, 'triangle', vol);
      playTone(659.25, 0.1, 0.12, 'triangle', vol);
      playTone(783.99, 0.2, 0.12, 'triangle', vol);
      playTone(1046.5, 0.3, 0.25, 'triangle', vol);
      playTone(1318.5, 0.3, 0.25, 'sine', vol * 0.7);
      break;

    case 'coin':
      playTone(987.77, 0, 0.08, 'sine', vol);
      playTone(1318.5, 0.06, 0.12, 'sine', vol);
      break;
  }
}

// ---- TOAST ----
function showToast(message) {
  $toastMsg.textContent = message;
  $toast.style.display = '';
  // Re-trigger animation
  $toast.style.animation = 'none';
  $toast.offsetHeight; // reflow
  $toast.style.animation = 'toastIn 0.3s ease, toastOut 0.3s ease 1.8s forwards';
  setTimeout(() => { $toast.style.display = 'none'; }, 2200);
}

// ---- PARTICLES ----
function burstParticles(x, y, count = 10, emoji = '✨') {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = emoji;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    el.style.setProperty('--dy', (Math.random() * -100 - 30) + 'px');
    $particles.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ---- REWARD (XP + COINS + PARTICLES + TOAST) ----
function grantReward(event, xp, coins, message) {
  const mult = 1 + (state.streak * 0.15);
  const bonusXP = Math.round(xp * mult);
  const bonusCoins = Math.round(coins * mult);

  state.totalXP += bonusXP;
  state.coins += bonusCoins;

  showToast(`${message} +${bonusXP} XP +${bonusCoins} 🪙`);
  updateStatsBar();

  // Particles at click position
  if (event) {
    burstParticles(event.clientX, event.clientY, 8, '✨');
    setTimeout(() => burstParticles(event.clientX + 20, event.clientY - 10, 5, '🪙'), 200);
  }

  saveState();
}

// ---- STEP COMPLETION ----
function completeStep(stepId, event) {
  const card = document.querySelector(`[data-step-id="${stepId}"]`);

  // Toggle: if already completed, undo it (and REVERSE the rewards)
  if (state.completedStepIds.includes(stepId)) {
    const mult = 1 + (state.streak * 0.15);

    // Reverse the step reward (10 XP / 5 coins at same streak multiplier)
    state.totalXP = Math.max(0, state.totalXP - Math.round(10 * mult));
    state.coins = Math.max(0, state.coins - Math.round(5 * mult));

    // Reverse the quest-completion bonus if it was granted
    if (state.questCompleted && state.activeQuest) {
      const stillAllDone = state.activeQuest.steps.every(s =>
        state.completedStepIds.includes(s.id)
      );
      if (!stillAllDone) {
        state.totalXP = Math.max(0, state.totalXP - 50);
        state.questCompleted = false;
        $questBanner.style.display = 'none';
      }
    }

    state.completedStepIds = state.completedStepIds.filter(id => id !== stepId);
    if (card) card.classList.remove('completed', 'card-pop');
    playSound('undo');
    showToast('↩️ Undone — rewards reversed.');
    updateStatsBar();
    renderDailyQuests();
    saveState();
    return;
  }

  state.completedStepIds.push(stepId);

  // Mark card
  if (card) {
    card.classList.add('completed', 'card-pop');
  }

  // Reward + sound
  grantReward(event, 10, 5, 'Step complete!');
  playSound('complete');

  // Check if all steps done
  if (state.activeQuest) {
    const allDone = state.activeQuest.steps.every(s => state.completedStepIds.includes(s.id));
    if (allDone) completeQuest();
  }

  // Also check daily quests
  renderDailyQuests();
  saveState();
}

// ---- QUEST COMPLETION ----
function completeQuest() {
  const bonusXP = 50;
  if (state.questCompleted) return; // bonus already granted
  state.totalXP += bonusXP;
  state.questCompleted = true;
  $questXpBonus.textContent = bonusXP;
  $questBanner.style.display = '';
  showToast(`🏆 QUEST COMPLETE! +${bonusXP} XP bonus!`);
  updateStatsBar();

  // Big particle burst + fanfare
  const rect = $questBanner.getBoundingClientRect();
  burstParticles(rect.left + rect.width / 2, rect.top, 20, '🎉');
  playSound('questComplete');

  saveState();
}

// ---- RENDER QUEST BOARD ----
function renderQuestBoard() {
  if (!state.activeQuest) {
    $questBoard.style.display = 'none';
    return;
  }

  const { task, steps } = state.activeQuest;
  $questBoard.style.display = '';
  $emptyState.style.display = 'none';
  $originalTask.textContent = `"${task}"`;

  const allDone = steps.every(s => state.completedStepIds.includes(s.id));
  $questBanner.style.display = allDone ? '' : 'none';

  $stepsGrid.innerHTML = steps.map((s, i) => {
    const done = state.completedStepIds.includes(s.id);
    return `
      <div class="step-card ${done ? 'completed' : ''}" data-step-id="${s.id}" onclick="completeStep('${s.id}', event)">
        <div class="step-number">${done ? '✓' : i + 1}</div>
        <div class="step-content">
          <div class="step-title">${escapeHtml(s.title)}</div>
          <div class="step-hint">💡 ${escapeHtml(s.hint)}</div>
        </div>
        <div class="step-meta">
          <span class="step-time">⏱ ${s.minutes} min</span>
          <div class="step-check"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ---- AI: TASK BREAKDOWN (via proxy — no CORS) ----
async function fetchTaskBreakdown(task) {
  // In production the key is server-side (Netlify env var). Locally, send user's key to local proxy.
  const apiKey = !IS_PRODUCTION ? (state.apiKey || $apiKeyInput.value.trim()) : null;
  if (!IS_PRODUCTION && !apiKey) throw new Error('no_api_key');

  const payload = IS_PRODUCTION
    ? { task: task }
    : { task: task, api_key: apiKey, provider: state.provider };

  const response = await fetch('/api/questify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `Server error (${response.status})`);
  }

  if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
    throw new Error('AI returned no steps. Try a more specific task description.');
  }

  return data.steps.map((s, i) => ({
    id: `step_${Date.now()}_${i}`,
    title: s.title || `Step ${i + 1}`,
    hint: s.hint || 'You got this.',
    minutes: Math.max(1, Math.min(60, parseInt(s.minutes) || 10)),
  }));
}

// ---- DEMO MODE ----
function getDemoSteps(task) {
  const demos = {
    default: [
      { title: 'Open a blank document', hint: 'Just open it. That\'s all. Don\'t write anything.', minutes: 1 },
      { title: 'Write your topic at the top', hint: 'One word or phrase is enough. It\'s just a placeholder.', minutes: 2 },
      { title: 'Set a timer for 8 minutes', hint: 'Tell yourself: "I only have to write for 8 minutes."', minutes: 1 },
      { title: 'Write a messy first sentence', hint: 'Doesn\'t need to be good. Just get one thought down.', minutes: 5 },
      { title: 'Write 3 bullet points of what you want to say', hint: 'No full sentences needed. Keywords are fine.', minutes: 8 },
      { title: 'Turn bullets into 3 short paragraphs', hint: 'One paragraph per bullet. No editing allowed yet.', minutes: 15 },
      { title: 'Take a 5-min break, then read it once', hint: 'You\'re almost done. Just read — don\'t edit yet.', minutes: 5 },
    ],
  };

  const steps = demos.default;
  return steps.map((s, i) => ({
    id: `step_demo_${Date.now()}_${i}`,
    title: s.title,
    hint: s.hint,
    minutes: s.minutes,
  }));
}

// ---- QUESTIFY! ----
async function handleQuestify() {
  const task = $taskInput.value.trim();
  if (!task) {
    showToast('👆 Type a task first!');
    $taskInput.focus();
    return;
  }

  $questifyBtn.disabled = true;
  $questifyBtn.innerHTML = '<span class="spinner"></span> Thinking...';

  try {
    let steps;
    // In production the API key is server-side, so always use real AI.
    const isDemo = !IS_PRODUCTION && !(state.apiKey || $apiKeyInput.value.trim());

    if (isDemo) {
      // Demo mode with slight delay for realism
      await new Promise(r => setTimeout(r, 800));
      steps = getDemoSteps(task);
    } else {
      steps = await fetchTaskBreakdown(task);
    }

    state.activeQuest = { task, steps };
    state.completedStepIds = [];
    state.questCompleted = false;

    // Save API key if entered
    if ($apiKeyInput.value.trim()) {
      state.apiKey = $apiKeyInput.value.trim();
    }

    saveState();
    renderQuestBoard();

    // Scroll to quest board
    $questBoard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (isDemo) {
      showToast('🎮 Demo mode! Add your API key for real AI breakdowns.');
    } else {
      showToast('⚡ Quest generated! Start with Step 1.');
    }

  } catch (err) {
    if (err.message === 'no_api_key') {
      showToast('🔑 Paste your OpenAI API key first, or click "Demo mode"');
    } else {
      showToast(`❌ ${err.message}`);
      console.error('Questify error:', err);
    }
  } finally {
    $questifyBtn.disabled = false;
    $questifyBtn.innerHTML = '⚡ Questify!';
  }
}

// ---- DAILY QUESTS ----
const DAILY_QUEST_POOL = [
  { text: 'Open TaskQuest and complete 1 step', icon: '🎯', xp: 5 },
  { text: 'Write down ONE thing you want to do today', icon: '📝', xp: 5 },
  { text: 'Set a 5-minute timer and start ANY task', icon: '⏱️', xp: 8 },
  { text: 'Text a friend what you\'re working on', icon: '💬', xp: 5 },
  { text: 'Drink a glass of water', icon: '💧', xp: 3 },
  { text: 'Stand up and stretch for 30 seconds', icon: '🧘', xp: 3 },
  { text: 'Put your phone face-down for 10 minutes', icon: '📵', xp: 8 },
  { text: 'Tell yourself "starting is the win" out loud', icon: '🗣️', xp: 3 },
  { text: 'Open just ONE tab/app you need for work', icon: '🚪', xp: 5 },
  { text: 'Celebrate finishing anything (even this!)', icon: '🎉', xp: 3 },
];

function generateDailyQuests() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.dailyQuests[today]) return; // already generated

  // Pick 3 random quests using date as seed (stable for the day)
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  const shuffled = [...DAILY_QUEST_POOL].sort((a, b) => {
    const ha = hashCode(a.text + seed);
    const hb = hashCode(b.text + seed);
    return ha - hb;
  });

  state.dailyQuests[today] = shuffled.slice(0, 3).map((q, i) => ({
    id: `daily_${today}_${i}`,
    text: q.text,
    icon: q.icon,
    xp: q.xp,
    done: false,
  }));

  saveState();
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

function completeDailyQuest(dailyId, event) {
  const today = new Date().toISOString().slice(0, 10);
  const quests = state.dailyQuests[today];
  if (!quests) return;

  const q = quests.find(d => d.id === dailyId);
  if (!q) return;

  // Toggle: if already done, undo it
  if (q.done) {
    q.done = false;
    state.totalXP = Math.max(0, state.totalXP - Math.round(q.xp * (1 + state.streak * 0.15)));
    state.coins = Math.max(0, state.coins - Math.round(3 * (1 + state.streak * 0.15)));
    playSound('undo');
    showToast('↩️ Daily quest undone.');
    updateStatsBar();
    renderDailyQuests();
    saveState();
    return;
  }

  q.done = true;
  grantReward(event, q.xp, 3, `${q.icon} Daily complete!`);
  playSound('coin');
  renderDailyQuests();
  saveState();
}

function renderDailyQuests() {
  const today = new Date().toISOString().slice(0, 10);

  // Clean up old daily quests (keep only today + yesterday)
  const keys = Object.keys(state.dailyQuests);
  for (const k of keys) {
    if (k < today) delete state.dailyQuests[k];
  }

  if (!state.dailyQuests[today]) {
    generateDailyQuests();
  }

  const quests = state.dailyQuests[today];
  if (!quests || quests.length === 0) {
    $dailySection.style.display = 'none';
    return;
  }

  $dailySection.style.display = '';
  $dailyGrid.innerHTML = quests.map(q => `
    <div class="daily-card ${q.done ? 'completed' : ''}" onclick="completeDailyQuest('${q.id}', event)">
      <span class="daily-icon">${q.icon}</span>
      <span class="daily-text">${escapeHtml(q.text)}</span>
      <span class="daily-xp">${q.done ? '✅' : '+' + q.xp + ' XP'}</span>
    </div>
  `).join('');

  saveState();
}

// ---- UTILS ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- EVENT LISTENERS ----
const $providerSelect = document.getElementById('provider-select');
if ($providerSelect) {
  $providerSelect.value = state.provider;
  $providerSelect.addEventListener('change', () => {
    state.provider = $providerSelect.value;
    saveState();
  });
}

$questifyBtn.addEventListener('click', handleQuestify);
$taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleQuestify();
  }
});

$demoBtn.addEventListener('click', () => {
  $apiKeyInput.value = '';
  state.apiKey = '';
  saveState();
  handleQuestify();
});

// Save API key on blur
$apiKeyInput.addEventListener('blur', () => {
  const val = $apiKeyInput.value.trim();
  if (val && val !== state.apiKey) {
    state.apiKey = val;
    saveState();
  }
});

// ---- SOUND LEVEL TOGGLE ----
const SOUND_ICONS = { low: '🔈', medium: '🔉', high: '🔊' };
const SOUND_ORDER = ['low', 'medium', 'high'];

function updateSoundIcon() {
  const icon = document.getElementById('sound-icon');
  const btn = document.getElementById('sound-btn');
  if (!icon || !btn) return;
  icon.textContent = SOUND_ICONS[state.soundLevel] || '🔉';
  btn.title = `Sound: ${state.soundLevel}`;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#sound-btn')) {
    const idx = SOUND_ORDER.indexOf(state.soundLevel);
    state.soundLevel = SOUND_ORDER[(idx + 1) % SOUND_ORDER.length];
    saveState();
    updateSoundIcon();
    // Preview the new level
    comboCount = 1;
    playSound('complete');
  }
});

// Unlock audio on first user interaction (browser autoplay policy)
function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('keydown', unlockAudio);
}
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);

// ---- KICK IT OFF ----
init();
updateSoundIcon();
