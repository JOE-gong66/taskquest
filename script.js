// ============================================================
//  TaskQuest — AI-powered gamified task breakdown for ADHD
//  IncludAI Neurodiversity Hackathon 2026
// ============================================================

// Production (Netlify): API key lives server-side in env vars.
// Local dev (python server.py): key entered in browser, sent to local proxy.
const IS_PRODUCTION = location.protocol === 'https:' && !location.hostname.includes('localhost');

// GitHub Pages → route API calls to the Netlify Function (still running on operational credits).
const API_BASE = location.hostname.includes('github.io') ? 'https://lovely-conkies-70714e.netlify.app' : '';

// ---- PET DATA ----
const PET_TYPES = {
  dragon: {
    label: 'Dragon',
    stages: [
      { emoji: '🐣', name: 'Egglet', minLevel: 1 },
      { emoji: '🐥', name: 'Chirp', minLevel: 3 },
      { emoji: '🐉', name: 'Blaze', minLevel: 8 },
    ],
  },
  cat: {
    label: 'Cat',
    stages: [
      { emoji: '🐱', name: 'Kitten', minLevel: 1 },
      { emoji: '🐈', name: 'Whiskers', minLevel: 3 },
      { emoji: '🐯', name: 'Tiger', minLevel: 8 },
    ],
  },
  plant: {
    label: 'Plant',
    stages: [
      { emoji: '🌱', name: 'Sprout', minLevel: 1 },
      { emoji: '🌸', name: 'Bloom', minLevel: 3 },
      { emoji: '🌳', name: 'Oak', minLevel: 8 },
    ],
  },
  ghost: {
    label: 'Mystic',
    stages: [
      { emoji: '👻', name: 'Boo', minLevel: 1 },
      { emoji: '⭐', name: 'Sparkle', minLevel: 3 },
      { emoji: '🌈', name: 'Prism', minLevel: 8 },
    ],
  },
};

const PET_QUOTES = [
  'Starting is the hardest part — and you did it! 💪',
  'ADHD brain = creative superpower! 🧠✨',
  'Take a breath. You\'ve got this. 🌬️',
  'One tiny step at a time, friend. 👣',
  'You\'re not lazy — you just need a different approach. 💡',
  'Don\'t forget to drink water! 💧',
  'Mistakes are just data. No shame here. 📊',
  'Look at you go! That was awesome. ⚔️',
  'Even 1% progress is still progress! 🌱',
  'You showed up today. I\'m proud of you. 🥹',
];

// ---- PET SHOP (spend coins on dress-up) ----
const PET_ACCESSORIES = [
  { id: 'hat',     emoji: '🎩', name: 'Cool Hat',    price: 20 },
  { id: 'glasses', emoji: '🕶️', name: 'Shades',      price: 50 },
  { id: 'bow',     emoji: '🎀', name: 'Cute Bow',    price: 50 },
  { id: 'crown',   emoji: '👑', name: 'Crown',       price: 100 },
  { id: 'medal',   emoji: '🥇', name: 'Gold Medal',  price: 200 },
];

// ---- STATE (persisted to localStorage) ----
const DEFAULT_STATE = {
  totalXP: 0,
  coins: 0,
  streak: 0,           // current consecutive-day streak
  bestStreak: 0,       // all-time best streak (never goes down — ADHD-friendly)
  lastActiveDate: null, // 'YYYY-MM-DD' — for streak tracking
  completedStepIds: [], // IDs of completed steps across all quests
  dailyQuests: {},      // { 'YYYY-MM-DD': [{id, text, icon, xp, done}] }
  activeQuest: null,    // { task, steps: [{id, title, hint, minutes}] }
  questCompleted: false, // whether the +50 quest bonus has been granted
  apiKey: '',           // user's LLM API key
  provider: 'deepseek',  // 'deepseek' or 'openai'
  soundLevel: 'medium',  // 'low' | 'medium' | 'high'
  pet: null,              // { type: 'dragon'|'cat'|'plant'|'ghost', name: string }
  petAccessories: [],     // ids of dress-up items the pet has bought (pet shop)
  coachChats: {},         // { [stepId]: [{ role, content }] } — persisted chat history
  focusMode: true,        // true = only show completed steps + next step (ADHD-friendly)
  easyFont: false,        // easy-reading (OpenDyslexic) font toggle
  petInviteShown: false,  // has the pet invite been shown? (no bossy first-screen popup)
  revealedSteps: [],      // indices of collapsed steps the user chose to reveal in focus mode
  stepEvents: [],          // [{ stepId, taskCategory, minutes, verbType, depth, outcome, shownAt, completedAt, at }]
  profileOverrides: {},    // { granularityThreshold?: number, splitCeiling?: number, bestVerbsEnabled?: bool, chainLengthEnabled?: bool, hardCategoriesEnabled?: bool }
  demoProfileEnabled: false, // demo mode: use synthetic 3-week user profile for stable demo video contrast
  manualTTFAs: [],           // [{ seconds, date }] — user's self-timed "without TaskQuest" entries
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
const $emptyMsg     = document.getElementById('empty-msg');
const $emptyHint    = document.getElementById('empty-hint');
const $dailySection = document.getElementById('daily-quests-section');
const $dailyGrid    = document.getElementById('daily-grid');
const $toast        = document.getElementById('toast');
const $toastMsg     = document.getElementById('toast-msg');
const $particles    = document.getElementById('particles');
const $petModal     = document.getElementById('pet-modal');
const $petChoices   = document.getElementById('pet-choices');
const $petNameInput = document.getElementById('pet-name-input');
const $petConfirm   = document.getElementById('pet-confirm-btn');
const $petSanctuary = document.getElementById('pet-sanctuary');
const $petAccessory = document.getElementById('pet-accessory');
const $petShopBtn    = document.getElementById('pet-shop-btn');
const $shopModal     = document.getElementById('shop-modal');
const $shopGrid      = document.getElementById('shop-grid');
const $shopCloseBtn  = document.getElementById('shop-close-btn');
const $petEmoji     = document.getElementById('pet-emoji');
const $petNameTag   = document.getElementById('pet-name-tag');
const $petDots      = document.getElementById('pet-dots');
const $petSpeech    = document.getElementById('pet-speech');
const $petAvatar    = document.getElementById('pet-avatar-wrap');
const $xpBar        = document.getElementById('xp-bar');
const $xpCurrent    = document.getElementById('xp-current');
const $xpToNext     = document.getElementById('xp-to-next');
const $nextLevelNum = document.getElementById('next-level-num');
const $levelNum     = document.getElementById('level-num');
const $coinsNum     = document.getElementById('coins-num');
const $streakNum    = document.getElementById('streak-num');

// ---- PET LOGIC ----
let selectedPetType = null;   // temp: what the user picked in the modal
let petIdleTimer = null;
let petSpeechTimer = null;

function getCurrentPetStage() {
  if (!state.pet) return null;
  const petDef = PET_TYPES[state.pet.type];
  if (!petDef) return null;
  const lv = getLevel();
  let stageIdx = 0;
  for (let i = petDef.stages.length - 1; i >= 0; i--) {
    if (lv >= petDef.stages[i].minLevel) { stageIdx = i; break; }
  }
  return { ...petDef.stages[stageIdx], index: stageIdx, totalStages: petDef.stages.length };
}

function renderPetSanctuary() {
  const stage = getCurrentPetStage();
  if (!stage) { if ($petSanctuary) $petSanctuary.style.display = 'none'; return; }
  if (!$petSanctuary || !$petEmoji) return;
  $petSanctuary.style.display = '';

  // Force emoji rendering: use innerHTML for better browser compat
  if (!state.pet._evolving) {
    $petEmoji.innerHTML = stage.emoji;
  }
  if ($petNameTag) $petNameTag.textContent = state.pet.name;

  // Dress-up accessory — show the most recent purchase on the pet's head
  if ($petAccessory) {
    const accId = state.petAccessories[state.petAccessories.length - 1];
    const acc = PET_ACCESSORIES.find(a => a.id === accId);
    $petAccessory.textContent = acc ? acc.emoji : '';
  }
  if ($petShopBtn) $petShopBtn.style.display = state.pet ? '' : 'none';

  // Stage dots
  if ($petDots) {
    $petDots.innerHTML = '';
    for (let i = 0; i < stage.totalStages; i++) {
      const dot = document.createElement('span');
      dot.className = 'pet-dot' + (i <= stage.index ? ' filled' : '');
      $petDots.appendChild(dot);
    }
  }
}

function renderPetChoices() {
  $petChoices.innerHTML = Object.entries(PET_TYPES).map(([key, def]) => {
    const s0 = def.stages[0];
    return `
      <div class="pet-choice" data-type="${key}" onclick="selectPetOption('${key}')" role="button" tabindex="0" aria-label="Press Enter to choose ${escapeAttr(s0.name)} (${escapeAttr(def.label)})">
        <span class="pet-choice-emoji">${s0.emoji}</span>
        <span class="pet-choice-label">${s0.name}</span>
        <span class="pet-choice-type">${def.label}</span>
      </div>
    `;
  }).join('');
}

function selectPetOption(type) {
  selectedPetType = type;
  document.querySelectorAll('.pet-choice').forEach(el => el.classList.remove('selected'));
  const card = document.querySelector(`.pet-choice[data-type="${type}"]`);
  if (card) card.classList.add('selected');

  // Auto-fill default name from the pet's stage-0 name
  const petDef = PET_TYPES[type];
  if (petDef && !$petNameInput.value.trim()) {
    $petNameInput.value = petDef.stages[0].name;
  }
  updatePetConfirmBtn();
}

function skipPet() {
  $petModal.style.display = 'none';
  // Keep the sanctuary visible, but hide the pet and show only the + button
  $petSanctuary.style.display = '';
  hidePetContent();
  // Remember we already invited — so it never auto-pops again, just the + button.
  state.petInviteShown = true;
  saveState();
  const $addBtn = document.getElementById('pet-add-btn');
  if ($addBtn) $addBtn.style.display = '';
}

// Hide all pet internals (speech, dots, avatar, name tag) — used after skipping
function hidePetContent() {
  ['pet-speech', 'pet-dots', 'pet-avatar-wrap', 'pet-name-tag'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// Restore all pet internals — used when confirming a pet
function showPetContent() {
  ['pet-speech', 'pet-dots', 'pet-avatar-wrap', 'pet-name-tag'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
}

function reopenPetModal() {
  $petModal.style.display = '';
  renderPetChoices();
  selectedPetType = null;
  $petNameInput.value = '';
  updatePetConfirmBtn();
  const $addBtn = document.getElementById('pet-add-btn');
  if ($addBtn) $addBtn.style.display = 'none';
}

// ---- PET SHOP ----
function openShopModal() {
  if (!state.pet) return;
  renderShopGrid();
  $shopModal.style.display = '';
}

function closeShopModal() {
  $shopModal.style.display = 'none';
}

function renderShopGrid() {
  if (!$shopGrid) return;
  $shopGrid.innerHTML = PET_ACCESSORIES.map(a => {
    const owned = state.petAccessories.includes(a.id);
    const cantAfford = !owned && state.coins < a.price;
    const cls = ['shop-item', owned ? 'owned' : '', cantAfford ? 'disabled' : ''].join(' ');
    const action = owned
      ? '<span class="shop-item-owner">✅ Owned</span>'
      : `<span class="shop-item-price">🪙 ${a.price}</span>`;
    return `
      <div class="${cls}" data-id="${a.id}" onclick="buyAccessory('${a.id}')" role="button" tabindex="0" aria-label="Buy ${escapeAttr(a.name)} for ${a.price} coins">
        <span class="shop-item-emoji">${a.emoji}</span>
        <span class="shop-item-name">${a.name}</span>
        ${action}
      </div>
    `;
  }).join('');
}

function buyAccessory(id) {
  const acc = PET_ACCESSORIES.find(a => a.id === id);
  if (!acc || !state.pet) return;

  if (state.petAccessories.includes(id)) {
    showToast('Already owned! 🎉');
    return;
  }

  if (state.coins < acc.price) {
    showToast(`That's ${acc.price} coins — you have ${state.coins}. ${acc.price - state.coins} more to go! 🪙`);
    return;
  }

  state.coins -= acc.price;
  state.petAccessories.push(id);
  saveState();
  updateStatsBar();
  renderPetSanctuary();
  renderShopGrid();
  showToast(`🎩 ${acc.name} bought! Your pet looks amazing!`);
  playSound('coin');
  playPetAnimation('happy');
}

function updatePetConfirmBtn() {
  const name = $petNameInput.value.trim();
  $petConfirm.disabled = !(selectedPetType && name.length > 0);
}

function confirmPet() {
  const name = $petNameInput.value.trim();
  if (!selectedPetType || !name) return;

  state.pet = { type: selectedPetType, name: name };
  saveState();

  // Hide modal
  $petModal.style.display = 'none';

  // Restore any hidden pet internals (in case user skipped first)
  showPetContent();
  const $addBtn = document.getElementById('pet-add-btn');
  if ($addBtn) $addBtn.style.display = 'none';

  // Show sanctuary with a little bounce-in
  renderPetSanctuary();
  startPetIdleCycle();

  // Welcome message
  const stage = getCurrentPetStage();
  setTimeout(() => showPetSpeech(`Hi! I'm ${name}! Let's do this together! ✨`), 400);
}

function showPetSpeech(text) {
  if (petSpeechTimer) clearTimeout(petSpeechTimer);
  $petSpeech.textContent = text;
  $petSpeech.style.display = '';
  $petSpeech.style.animation = 'none';
  $petSpeech.offsetHeight;
  $petSpeech.style.animation = 'bubbleUp 0.3s ease';
  petSpeechTimer = setTimeout(() => { $petSpeech.style.display = 'none'; }, 4500);
}

function playPetAnimation(kind) {
  const emoji = $petEmoji;
  // Remove all animation classes
  emoji.classList.remove('pet-sway', 'pet-bounce', 'pet-blink', 'pet-happy', 'pet-head-tilt');

  switch (kind) {
    case 'sway':
      emoji.classList.add('pet-sway');
      break;
    case 'bounce':
      emoji.classList.add('pet-bounce');
      // Restart sway after bounce
      setTimeout(() => { emoji.classList.remove('pet-bounce'); emoji.classList.add('pet-sway'); }, 500);
      break;
    case 'blink':
      emoji.classList.add('pet-blink');
      setTimeout(() => { emoji.classList.remove('pet-blink'); emoji.classList.add('pet-sway'); }, 300);
      break;
    case 'happy':
      emoji.classList.add('pet-happy');
      spawnPetHearts(5);
      setTimeout(() => { emoji.classList.remove('pet-happy'); emoji.classList.add('pet-sway'); }, 600);
      break;
    case 'headTilt':
      emoji.classList.add('pet-head-tilt');
      setTimeout(() => { emoji.classList.remove('pet-head-tilt'); emoji.classList.add('pet-sway'); }, 500);
      break;
    case 'evolve':
      $petAvatar.classList.add('pet-evolving');
      setTimeout(() => { $petAvatar.classList.remove('pet-evolving'); emoji.classList.add('pet-sway'); }, 1800);
      break;
  }
}

function spawnPetHearts(count) {
  const wrap = $petAvatar;
  const rect = wrap.getBoundingClientRect();
  const hearts = ['💕', '💖', '💗', '✨', '💝'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'pet-heart';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = (Math.random() * 40 + 5) + 'px';
    el.style.top = (Math.random() * 10) + 'px';
    el.style.animationDelay = (i * 0.1) + 's';
    el.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
    wrap.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function showEvolutionOverlay(oldStage, newStage) {
  // Fullscreen celebration
  const overlay = document.createElement('div');
  overlay.className = 'evolution-overlay';
  overlay.innerHTML = `
    <div class="evolution-emoji">${newStage.emoji}</div>
    <div class="evolution-text">${oldStage.name} evolved into ${newStage.name}!</div>
    <div class="evolution-sub">Level ${getLevel()} reached! 🌟</div>
  `;
  document.body.appendChild(overlay);

  // Sparkles
  const sparkles = document.createElement('div');
  sparkles.className = 'evolution-sparkles';
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('span');
    s.className = 'evo-sparkle';
    s.textContent = ['✨','🌟','💫','⭐','🎉'][Math.floor(Math.random() * 5)];
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--sdx', (Math.random() * 200 - 100) + 'px');
    s.style.setProperty('--sdy', (Math.random() * -150 - 30) + 'px');
    s.style.animationDelay = Math.random() * 0.5 + 's';
    sparkles.appendChild(s);
  }
  document.body.appendChild(sparkles);

  // Play evolution fanfare
  playSound('questComplete');

  // Remove after animation
  setTimeout(() => {
    overlay.remove();
    sparkles.remove();
    delete state.pet._evolving;
    renderPetSanctuary();
    startPetIdleCycle();
  }, 2500);

  // Change emoji after spin
  setTimeout(() => {
    $petEmoji.textContent = newStage.emoji;
  }, 900);
}

function checkPetEvolution(oldLevel, newLevel) {
  if (!state.pet) return false;
  const petDef = PET_TYPES[state.pet.type];
  if (!petDef) return false;

  const oldStage = getStageForLevel(petDef, oldLevel);
  const newStage = getStageForLevel(petDef, newLevel);

  if (newStage.index > oldStage.index) {
    // Evolution!
    state.pet._evolving = true;
    playPetAnimation('evolve');
    showPetSpeech('I\'m... evolving?! 😮');
    setTimeout(() => showEvolutionOverlay(oldStage, newStage), 600);
    return true;
  }
  return false;
}

function getStageForLevel(petDef, level) {
  let stageIdx = 0;
  for (let i = petDef.stages.length - 1; i >= 0; i--) {
    if (level >= petDef.stages[i].minLevel) { stageIdx = i; break; }
  }
  return { ...petDef.stages[stageIdx], index: stageIdx, totalStages: petDef.stages.length };
}

function startPetIdleCycle() {
  if (petIdleTimer) clearInterval(petIdleTimer);
  if (!state.pet || state.pet._evolving) return;

  // Random idle animation every 2-5 seconds
  const tick = () => {
    if (!state.pet || state.pet._evolving) return;
    const r = Math.random();
    if (r < 0.5) playPetAnimation('sway');       // 50% — already swaying, just ensure
    else if (r < 0.7) playPetAnimation('bounce'); // 20%
    else playPetAnimation('blink');               // 30%
    petIdleTimer = setTimeout(tick, 2500 + Math.random() * 4000);
  };
  petIdleTimer = setTimeout(tick, 2000);
}

function handlePetClick() {
  if (!state.pet || state.pet._evolving) return;
  const quote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
  showPetSpeech(quote);
  playPetAnimation('bounce');
}

// ---- INIT ----
function init() {
  // In production, hide API key entry — key is server-side.
  if (IS_PRODUCTION) {
    $apiKeyInput.style.display = 'none';
    const sel = document.getElementById('provider-select');
    if (sel) sel.style.display = 'none';
    const hint = document.querySelector('.api-key-row .btn-ghost');
    if (hint) hint.style.display = 'none';
    // Empty state copy: there is no API key field or demo button here.
    $emptyMsg.innerHTML = 'Type a task above and hit <strong>Make it tiny!</strong>';
    $emptyHint.textContent = 'Works instantly — the AI runs on our server. No setup needed.';
  }

  // Restore API key
  if (state.apiKey) $apiKeyInput.value = state.apiKey;

  // Update streak on page load
  updateStreak();

  // Render UI
  updateStatsBar();
  if (state.activeQuest) {
    renderQuestBoard();
    renderDailyQuests();
  } else {
    $questBoard.style.display = 'none';
    $emptyState.style.display = '';
    // First visit: hide daily quests — reduce decision load until first step is done
    $dailySection.style.display = 'none';
    generateDailyQuests(); // still generate in background for when they do finish
  }

  // --- Pet init ---
  if (state.pet) {
    // Already have a pet — show sanctuary, make sure modal stays hidden
    $petModal.style.display = 'none';
    renderPetSanctuary();
    startPetIdleCycle();
  } else if (state.petInviteShown) {
    // Already invited but skipped — show only the "get a companion" button.
    $petModal.style.display = 'none';
    $petSanctuary.style.display = '';
    hidePetContent();
    const $addBtn = document.getElementById('pet-add-btn');
    if ($addBtn) $addBtn.style.display = '';
  } else {
    // First visit: no bossy popup. Complete your first step and we'll invite you.
    $petSanctuary.style.display = 'none';
  }

  // Pet modal events
  $petNameInput.addEventListener('input', updatePetConfirmBtn);
  $petConfirm.addEventListener('click', confirmPet);
  $petNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmPet();
  });
  const $petSkipBtn = document.getElementById('pet-skip-btn');
  if ($petSkipBtn) $petSkipBtn.addEventListener('click', skipPet);
  const $petAddBtn = document.getElementById('pet-add-btn');
  if ($petAddBtn) $petAddBtn.addEventListener('click', reopenPetModal);

  // Pet click
  $petAvatar.addEventListener('click', handlePetClick);

  // Pet shop
  if ($petShopBtn) $petShopBtn.addEventListener('click', openShopModal);
  if ($shopCloseBtn) $shopCloseBtn.addEventListener('click', closeShopModal);
  $shopModal.addEventListener('click', (e) => {
    if (e.target === $shopModal) closeShopModal();
  });

  // Learning profile panel
  const $profileBtn = document.getElementById('profile-btn');
  const $profileOverlay = document.getElementById('profile-overlay');
  const $profileCloseBtn = document.getElementById('profile-close-btn');
  const $profileSaveBtn = document.getElementById('profile-save-btn');
  const $profileClearBtn = document.getElementById('profile-clear-btn');
  if ($profileBtn) $profileBtn.addEventListener('click', openProfilePanel);
  if ($profileOverlay) $profileOverlay.addEventListener('click', () => closeProfilePanel(true));
  if ($profileCloseBtn) $profileCloseBtn.addEventListener('click', () => closeProfilePanel(false));
  if ($profileSaveBtn) $profileSaveBtn.addEventListener('click', () => closeProfilePanel(true));
  if ($profileClearBtn) $profileClearBtn.addEventListener('click', clearAllData);
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
  try { localStorage.setItem('taskquest_state', JSON.stringify(state)); }
  catch (e) { /* storage unavailable — keep running in-memory */ }
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
// Local-timezone date key ('YYYY-MM-DD'). toISOString() uses UTC, which rolls
// the day over at 8am Beijing time — an evening session would land on the
// wrong day. All streak/daily code must use this.
function todayKey(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function updateStreak() {
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));

  if (state.lastActiveDate === today) return; // already active today

  const oldStreak = state.streak;

  if (state.lastActiveDate === yesterday) {
    // consecutive
    state.streak += 1;
  } else if (state.lastActiveDate && state.lastActiveDate !== yesterday) {
    // broke streak — but never shame. Fresh start at day 1.
    state.streak = 1;
  } else if (!state.lastActiveDate) {
    // first time ever
    state.streak = 1;
  }

  // Best streak only goes up — ADHD brains collect wins, not losses
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;

  // Milestone bonuses: one-time celebrations for consistency, not unbroken chains.
  // These fire naturally when the streak reaches the milestone on first page-load of the day.
  const MILESTONES = { 3: [15, '🥉 3-day champ!'], 7: [50, '🥈 7-day warrior!'], 14: [100, '🥇 14-day legend!'], 30: [200, '🏆 30-day hero!'] };
  if (MILESTONES[state.streak]) {
    const [bonusXP, msg] = MILESTONES[state.streak];
    state.totalXP += bonusXP;
    saveState();
    showToast(`${msg} +${bonusXP} XP`);
    updateStatsBar();
  }

  state.lastActiveDate = today;
  saveState();

  // Pet welcome-back: when a streak breaks (was >1, is now 1), pet is just glad they're here.
  // Never mention the break — only the return.
  if (oldStreak > 1 && state.streak === 1 && state.pet) {
    setTimeout(() => showPetSpeech('You\'re back! I missed you! Let\'s go! ⚡'), 1800);
  }
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
  $streakNum.textContent = state.bestStreak || 1; // show best, not current — ADHD-friendly: never goes down

  // Best streak as tooltip — a kid can hover to see their record
  const $statStreak = document.getElementById('stat-streak');
  if ($statStreak && state.bestStreak > 0) {
    $statStreak.title = `Best streak: ${state.bestStreak} day${state.bestStreak !== 1 ? 's' : ''} 🔥`;
  }

  // "X to Lv.N" hint — ADHD users want to know exactly how close they are
  const xpToNext = Math.max(0, nextLvXP - state.totalXP);
  $xpToNext.textContent = xpToNext;
  $nextLevelNum.textContent = lv + 1;
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

// ---- ARIA LIVE (screen reader announcements) ----
// Zero-width-space counter forces re-announcement of identical strings.
let _announceCounter = 0;
function announce(msg, kind = 'polite') {
  const el = document.getElementById(`aria-live-${kind}`);
  if (!el) return;
  _announceCounter += 1;
  // Clear then repopulate — screen readers only announce on content change
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = '​'.repeat(_announceCounter % 10) + msg;
  });
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
  const oldLevel = getLevel();
  const bonusXP = xp;
  const bonusCoins = coins;

  state.totalXP += bonusXP;
  state.coins += bonusCoins;

  showToast(`${message} +${bonusXP} XP +${bonusCoins} 🪙`);
  updateStatsBar();

  // Check pet evolution
  if (state.pet) {
    const newLevel = getLevel();
    checkPetEvolution(oldLevel, newLevel);
  }

  // Particles at click position (keyboard Enter has no pointer coords → card center)
  if (event) {
    let x = event.clientX, y = event.clientY;
    if ((!x && !y) && event.currentTarget && event.currentTarget.getBoundingClientRect) {
      const r = event.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    burstParticles(x, y, 8, '✨');
    setTimeout(() => burstParticles(x + 20, y - 10, 5, '🪙'), 200);
  }

  saveState();
}

// ---- STEP COMPLETION ----
function completeStep(stepId, event) {
  const card = document.querySelector(`[data-step-id="${stepId}"]`);

  // Toggle: if already completed, undo it (and REVERSE the rewards)
  if (state.completedStepIds.includes(stepId)) {

    // Reverse the step reward (10 XP / 5 coins at same streak multiplier)
    state.totalXP = Math.max(0, state.totalXP - 10);
    state.coins = Math.max(0, state.coins - 5);

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

    // Revert step event
    const undoneEvent = state.stepEvents.find(e => e.stepId === stepId);
    if (undoneEvent) { undoneEvent.outcome = ''; undoneEvent.completedAt = 0; undoneEvent.at = Date.now(); }

    state.completedStepIds = state.completedStepIds.filter(id => id !== stepId);
    if (card) card.classList.remove('completed', 'card-pop');
    playSound('undo');
    playPetAnimation('headTilt');
    showPetSpeech('No worries! Try again 💪');
    showToast('↩️ Undone — rewards reversed.');
    updateStatsBar();
    renderQuestBoard();      // re-collapse steps — undone step should hide again
    renderDailyQuests();
    saveState();
    return;
  }

  state.completedStepIds.push(stepId);

  // Mark card
  if (card) {
    card.classList.add('completed', 'card-pop');
  }

  // Log step event: completed
  const stepEvent = state.stepEvents.find(e => e.stepId === stepId);
  if (stepEvent) { stepEvent.outcome = 'completed'; stepEvent.completedAt = Date.now(); stepEvent.at = Date.now(); }

  // Reward + sound
  grantReward(event, 10, 5, 'Step complete!');
  playSound('complete');
  playPetAnimation('happy');

  // First-ever win: gently invite them to adopt a pet AFTER they feel the reward.
  if (!state.pet && !state.petInviteShown) {
    state.petInviteShown = true;
    saveState();
    setTimeout(() => reopenPetModal(), 900);
  }

  // Check if all steps done
  if (state.activeQuest) {
    const allDone = state.activeQuest.steps.every(s => state.completedStepIds.includes(s.id));
    if (allDone) completeQuest();
  }

  renderQuestBoard();       // reveal the next step in focus mode

  // Screen reader: announce XP + what's next
  const nextIdx = state.activeQuest.steps.findIndex(s => !state.completedStepIds.includes(s.id));
  if (nextIdx >= 0) {
    const next = state.activeQuest.steps[nextIdx];
    announce(`+10 XP, +5 coins. Next: ${next.title}. ${next.minutes} minutes.`);
  } else {
    announce('+10 XP, +5 coins. All steps complete!');
  }

  // Also check daily quests
  renderDailyQuests();
  saveState();
}

// ---- QUEST COMPLETION ----
// ★ Special celebration when the ENTIRE quest is done — bigger than a normal step.
function celebrateQuestComplete() {
  // 1. Rainbow confetti across the whole screen
  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#b983ff', '#ff8fab'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('span');
    el.className = 'confetti';
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.top = '-5vh';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 0.8) + 's';
    el.style.animationDuration = (1.8 + Math.random() * 1.5) + 's';
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // 2. Pet does a triple happy jump + hearts
  playPetAnimation('happy');
  spawnPetHearts(10);
  setTimeout(() => { playPetAnimation('happy'); spawnPetHearts(6); }, 450);
  setTimeout(() => { playPetAnimation('happy'); spawnPetHearts(4); }, 900);

  // 3. Special speech (longer than a normal nudge)
  const petName = state.pet ? state.pet.name : 'friend';
  setTimeout(() => showPetSpeech(`🎉 ${petName}: YOU COMPLETED THE WHOLE QUEST! I'm so proud of you!! Let's start the next one together! ⚔️✨`), 700);
  setTimeout(() => playSound('questComplete'), 1200);
}

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

  // ★ Special full-quest celebration ★
  celebrateQuestComplete();

  // Guide user to next quest — highlight input after fanfare settles
  setTimeout(() => {
    $taskInput.placeholder = 'Nice work! What\'s your next quest? ⚔️';
    $taskInput.focus();
    $taskInput.style.borderColor = 'var(--primary)';
    $taskInput.style.boxShadow = '0 0 0 3px var(--primary-light)';
    // Fade highlight after a few seconds
    setTimeout(() => {
      $taskInput.style.borderColor = '';
      $taskInput.style.boxShadow = '';
      $taskInput.placeholder = 'e.g. "Finish my math homework" or "Write a book report" or "Read 20 pages"';
    }, 4000);
  }, 1500);

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

  // Focus mode: only the next undone step is fully visible; others collapse into slim bars.
  const focusOn = state.focusMode;
  const $focusBtn = document.getElementById('focus-toggle-btn');
  // Label = what clicking WILL do (action), NOT current state
  if ($focusBtn) $focusBtn.textContent = focusOn ? '📋 Show all steps' : '🔎 Just the next step';

  const nextUndoneIdx = steps.findIndex(s => !state.completedStepIds.includes(s.id));

  // Focus-mode progress — "Step 3 of 7" so ADHD users know where they stand
  const $focusProgress = document.getElementById('focus-progress');
  if ($focusProgress) {
    if (focusOn && !allDone) {
      const currentStepNum = nextUndoneIdx >= 0 ? nextUndoneIdx + 1 : steps.length;
      $focusProgress.textContent = `Step ${currentStepNum} of ${steps.length}`;
      $focusProgress.style.display = '';
    } else {
      $focusProgress.style.display = 'none';
    }
  }

  $stepsGrid.innerHTML = steps.map((s, i) => {
    const done = state.completedStepIds.includes(s.id);

    // Focus mode: show only completed steps + the next undone step.
    // revealedSteps is a non-focus-mode concept — focus mode always wins.
    if (focusOn && !done && i !== nextUndoneIdx) {
      return `
        <div class="step-card step-card-collapsed" onclick="revealStep(${i})" title="Show this step" role="button" tabindex="0" aria-label="Press Enter to show this step: ${escapeAttr(s.title)}">
          <div class="step-number">${i + 1}</div>
          <div class="step-title collapsed-title">${escapeHtml(s.title)}</div>
          <span class="collapsed-hint">tap to reveal ↓</span>
        </div>
      `;
    }

    return `
      <div class="step-card ${done ? 'completed' : ''}" data-step-id="${s.id}" onclick="completeStep('${s.id}', event)" role="button" tabindex="0" aria-label="${done ? 'Completed. Press Enter to undo: ' : 'Press Enter to complete: '}${escapeAttr(s.title)}">
        <div class="step-number">${done ? '✓' : i + 1}</div>
        <div class="step-content">
          <div class="step-title">${escapeHtml(s.title)}</div>
          <div class="step-hint"><span aria-hidden="true">💡</span> ${escapeHtml(s.hint)}</div>
          <div class="step-actions">
            <button class="step-action-btn step-action-subdivide" onclick="event.stopPropagation();subdivideStep('${s.id}')" title="Break this down into even smaller steps">🔍 Too big</button>
            <button class="step-action-btn step-action-coach" onclick="event.stopPropagation();openCoachPanel('${s.id}')" title="Chat with AI about this step">💬 Coach</button>
          </div>
        </div>
        <div class="step-meta">
          <span class="step-time"><span aria-hidden="true">⏱</span> ${s.minutes} min</span>
          <div class="step-check"></div>
        </div>
      </div>
    `;
  }).join('');

  // Subdivide undo bar
  if (lastSubdivide) {
    const orig = lastSubdivide.originalStep;
    $stepsGrid.innerHTML += `
      <div class="subdivide-undo-bar" onclick="undoSubdivide()" role="button" tabindex="0" aria-label="Press Enter to undo the step split">
        <span>📦 "${escapeHtml(orig.title)}" &rarr; ${lastSubdivide.newCount} smaller steps</span>
        <button class="step-action-btn step-action-undo" tabindex="-1">↩️ Undo split</button>
      </div>
    `;
  }
}

// Reveal ONE collapsed step without expanding the whole list (ADHD-safe)
function revealStep(idx) {
  if (!state.revealedSteps.includes(idx)) state.revealedSteps.push(idx);
  saveState();
  renderQuestBoard();
}

// Toggle between "just the next step" (focused) and "show all steps"
function toggleFocusMode() {
  state.focusMode = !state.focusMode;
  saveState();
  renderQuestBoard();
  // A little nudge to explain what just happened
  if (state.focusMode) showToast('🔎 Showing only your next step — one thing at a time.');
  else showToast('📋 All steps shown — you can see the whole path.');
}

// ---- AI COACH PANEL ----
let coachStepId = null;       // which step the panel is open for
let lastSubdivide = null;     // { stepIndex, originalStep, newCount, timestamp } — for undo

const COACH_QUICK_ACTIONS = {
  brainstorm: 'Help me brainstorm 3 quick ideas related to this step. Keep each idea very short.',
  explain:    'Explain this step to me in a completely different way. Maybe with an analogy or a metaphor.',
  starter:    'Write me ONE tiny starter sentence or phrase I can copy-paste to begin this step right now.',
  guide:      'Ask me one guiding question that helps me figure out what\'s blocking me on this step.',
};

const COACH_ACTION_LABELS = {
  brainstorm: 'Brainstorm 3 quick ideas',
  explain:    'Explain this step differently',
  starter:    'Write a starter sentence',
  guide:      'Guide me with a question',
};

const $coachOverlay  = document.getElementById('coach-overlay');
const $coachPanel    = document.getElementById('coach-panel');
const $coachContext  = document.getElementById('coach-step-context');
const $coachMessages = document.getElementById('coach-messages');
const $coachInput    = document.getElementById('coach-input');
const $coachSendBtn  = document.getElementById('coach-send-btn');
const $coachCloseBtn = document.getElementById('coach-close-btn');
const $coachQuickBtns = document.querySelectorAll('.coach-quick-btn');

function getCoachChat(stepId) {
  if (!state.coachChats[stepId]) state.coachChats[stepId] = [];
  return state.coachChats[stepId];
}

function openCoachPanel(stepId) {
  if (!state.activeQuest) return;
  const step = state.activeQuest.steps.find(s => s.id === stepId);
  if (!step) return;

  coachStepId = stepId;
  const chat = getCoachChat(stepId);
  const stepTitle = step.title || step.text || 'this step';

  $coachContext.textContent = `Step: "${stepTitle}"`;

  // Render chat history + welcome if empty
  let html = '';
  if (chat.length === 0) {
    html = `
      <div class="coach-msg coach-msg-system">
        👋 I'm your ADHD coach! This step: <strong>${escapeHtml(stepTitle)}</strong>.<br>
        Click a quick action or type anything you're stuck on.
      </div>
    `;
  } else {
    html = chat.map(m => {
      const cls = m.role === 'user' ? 'coach-msg-user' : 'coach-msg-assistant';
      return `<div class="coach-msg ${cls}">${escapeHtml(m.content)}</div>`;
    }).join('');
  }
  $coachMessages.innerHTML = html;
  $coachMessages.scrollTop = $coachMessages.scrollHeight;
  $coachInput.value = '';
  $coachOverlay.style.display = '';
  $coachPanel.style.display = '';
  $coachInput.focus();
}

function closeCoachPanel() {
  finishTypewriter(); // complete any in-progress typing; text is already persisted
  $coachOverlay.style.display = 'none';
  $coachPanel.style.display = 'none';
  coachStepId = null;
  // Chat history stays in state.coachChats — persists across reopens
}

function appendCoachMessage(role, content) {
  const cls = role === 'user' ? 'coach-msg-user' : 'coach-msg-assistant';
  const div = document.createElement('div');
  div.className = `coach-msg ${cls}`;
  div.textContent = content;
  $coachMessages.appendChild(div);
  $coachMessages.scrollTop = $coachMessages.scrollHeight;
}

// ---- Typewriter effect (fake streaming) ----
// Shows the reply typing out character by character so the wait feels shorter
// and more alive than a sudden full block. Persisted first, typed second:
// if the user closes the panel mid-typing, the full reply is already saved.
let typewriterState = null; // { el, fullText, timer }

function finishTypewriter() {
  if (!typewriterState) return;
  clearTimeout(typewriterState.timer);
  typewriterState.el.textContent = typewriterState.fullText;
  typewriterState = null;
}

function appendCoachMessageTyped(content) {
  const div = document.createElement('div');
  div.className = 'coach-msg coach-msg-assistant';
  $coachMessages.appendChild(div);
  $coachMessages.scrollTop = $coachMessages.scrollHeight;

  // Respect OS "reduce motion" — show it all at once
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    div.textContent = content;
    $coachMessages.scrollTop = $coachMessages.scrollHeight;
    return;
  }

  finishTypewriter(); // complete any in-progress typing first

  let i = 0;
  const fullText = content;
  const tick = () => {
    if (i >= fullText.length) {
      div.textContent = fullText;
      typewriterState = null;
      return;
    }
    div.textContent = fullText.slice(0, i + 1) + '▌';
    $coachMessages.scrollTop = $coachMessages.scrollHeight;
    i++;
    typewriterState = { el: div, fullText, timer: setTimeout(tick, 14) };
  };
  tick();
}

function showCoachTyping() {
  const div = document.createElement('div');
  div.className = 'coach-typing';
  div.id = 'coach-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  $coachMessages.appendChild(div);
  $coachMessages.scrollTop = $coachMessages.scrollHeight;
}

function hideCoachTyping() {
  const el = document.getElementById('coach-typing');
  if (el) el.remove();
}

async function sendCoachMessage(text) {
  if (!coachStepId || !state.activeQuest) return;
  const step = state.activeQuest.steps.find(s => s.id === coachStepId);
  if (!step) return;

  const trimmed = text.trim();
  if (!trimmed) return;

  finishTypewriter(); // finish any in-progress typing before sending a new message

  const stepTitle = step.title || step.text || 'this step';

  // Disable input while waiting
  $coachInput.disabled = true;
  $coachSendBtn.disabled = true;
  $coachQuickBtns.forEach(b => b.disabled = true);

  const chat = getCoachChat(coachStepId);
  appendCoachMessage('user', trimmed);
  chat.push({ role: 'user', content: trimmed });
  saveState();
  showCoachTyping();

  try {
    const payload = IS_PRODUCTION
      ? { mode: 'coach', step_title: stepTitle, messages: chat }
      : { mode: 'coach', step_title: stepTitle, messages: chat, api_key: state.apiKey || $apiKeyInput.value.trim(), provider: state.provider };

    const res = await fetch(`${API_BASE}/api/questify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    hideCoachTyping();

    if (!res.ok || data.error) {
      appendCoachMessage('assistant', '⚠️ ' + (data.error || 'Something went wrong. Try again?'));
    } else {
      const reply = data.reply || 'Hmm, I didn\'t quite catch that. Can you say it differently?';
      // Persist FIRST so the reply survives even if the panel is closed mid-typing
      chat.push({ role: 'assistant', content: reply });
      saveState();
      appendCoachMessageTyped(reply);
    }
  } catch (err) {
    hideCoachTyping();
    appendCoachMessage('assistant', '⚠️ Connection issue. Check your internet and try again.');
  }

  $coachInput.disabled = false;
  $coachSendBtn.disabled = false;
  $coachQuickBtns.forEach(b => b.disabled = false);
  $coachInput.focus();
  $coachInput.value = '';
}

// Clean orphaned chats when quest/step structure changes
function cleanOrphanedCoachChats() {
  if (!state.activeQuest) { state.coachChats = {}; return; }
  const validIds = new Set(state.activeQuest.steps.map(s => s.id));
  for (const id of Object.keys(state.coachChats)) {
    if (!validIds.has(id)) delete state.coachChats[id];
  }
}

function handleCoachQuickAction(action) {
  const prompt = COACH_QUICK_ACTIONS[action];
  if (!prompt) return;
  sendCoachMessage(prompt);
}

// ---- SUBDIVIDE: break one step into even smaller steps ----
async function subdivideStep(stepId) {
  if (!state.activeQuest) return;
  const step = state.activeQuest.steps.find(s => s.id === stepId);
  if (!step) return;

  // Find and disable the button
  const card = document.querySelector(`[data-step-id="${stepId}"]`);
  const btn = card ? card.querySelector('.step-action-btn') : null;
  if (btn) { btn.disabled = true; btn.textContent = '🔍 Thinking...'; }

  try {
    const payload = IS_PRODUCTION
      ? { mode: 'subdivide', task: step.title }
      : { mode: 'subdivide', task: step.title, api_key: state.apiKey || $apiKeyInput.value.trim(), provider: state.provider };

    const res = await fetch(`${API_BASE}/api/questify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast('❌ ' + (data.error || "Couldn't break that down. Try again?"));
      announce("Couldn't split that step. Try again?", 'assertive');
      if (btn) { btn.disabled = false; btn.textContent = '🔍 Too big'; }
      return;
    }

    // Replace this step with the returned sub-steps
    const subSteps = data.steps.map((s, i) => ({
      id: `step_${Date.now()}_${i}`,
      title: s.title || `Sub-step ${i + 1}`,
      hint: s.hint || 'Tiny steps win.',
      minutes: Math.max(1, Math.min(60, parseInt(s.minutes) || 5)),
      verbType: s.verbType || 'cognitive',
    }));

    const idx = state.activeQuest.steps.findIndex(s => s.id === stepId);
    const originalStep = { ...state.activeQuest.steps[idx] };

    // Log split event for the original step
    const origEv = state.stepEvents.find(e => e.stepId === stepId);
    if (origEv) { origEv.outcome = 'split'; origEv.at = Date.now(); }
    const parentDepth = origEv ? origEv.depth : 0;

    // Log events for sub-steps (deeper by one level)
    const eventNow = Date.now();
    subSteps.forEach(s => {
      state.stepEvents.push({
        stepId: s.id, taskCategory: state.activeQuest.task, minutes: s.minutes,
        verbType: s.verbType || 'cognitive', depth: parentDepth + 1,
        outcome: '', shownAt: eventNow, completedAt: 0, at: eventNow,
      });
    });

    // Store undo info
    lastSubdivide = { stepIndex: idx, originalStep, newCount: subSteps.length, timestamp: Date.now() };

    state.activeQuest.steps.splice(idx, 1, ...subSteps);
    state.revealedSteps = []; // indices shifted — drop stale reveals

    // Remove completed entry for the old step if any
    state.completedStepIds = state.completedStepIds.filter(id => id !== stepId);

    cleanOrphanedCoachChats();
    saveState();
    renderQuestBoard();
    showToast(`🔍 Broken into ${subSteps.length} tinier steps!`);
    announce(`Step split into ${subSteps.length} smaller steps. First: ${subSteps[0].title}.`);
    playPetAnimation('bounce');
    showPetSpeech('Smaller steps = easier wins! 🌟');
  } catch (err) {
    showToast('❌ Connection error. Try again.');
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Too big'; }
  }
}

function undoSubdivide() {
  if (!lastSubdivide || !state.activeQuest) return;
  const { stepIndex, originalStep, newCount } = lastSubdivide;

  // Clean up step events: delete sub-step events, revert original step
  const subStepIds = state.activeQuest.steps.slice(stepIndex, stepIndex + newCount).map(s => s.id);
  state.stepEvents = state.stepEvents.filter(e => !subStepIds.includes(e.stepId));
  const origEv = state.stepEvents.find(e => e.stepId === originalStep.id);
  if (origEv && origEv.outcome === 'split') { origEv.outcome = ''; origEv.at = Date.now(); }

  // Remove the sub-steps we inserted
  state.activeQuest.steps.splice(stepIndex, newCount, originalStep);
  state.revealedSteps = []; // indices shifted — drop stale reveals

  // Remove completed entries for the sub-steps
  state.completedStepIds = state.completedStepIds.filter(id =>
    state.activeQuest.steps.some(s => s.id === id)
  );

  lastSubdivide = null;
  cleanOrphanedCoachChats();
  saveState();
  renderQuestBoard();
  showToast('↩️ Split undone — original step restored.');
  announce(`Split undone. Original step restored: ${originalStep.title}.`);
  playPetAnimation('headTilt');
  showPetSpeech('Oops! Back to the original step.');
}

// ---- AI: TASK BREAKDOWN (via proxy — no CORS) ----
async function fetchTaskBreakdown(task) {
  // In production the key is server-side (Netlify env var). Locally, send user's key to local proxy.
  const apiKey = !IS_PRODUCTION ? (state.apiKey || $apiKeyInput.value.trim()) : null;
  if (!IS_PRODUCTION && !apiKey) throw new Error('no_api_key');

  const events = state.demoProfileEnabled ? getDemoStepEvents() : state.stepEvents;
  const profile = buildUserProfile(events);
  const profileHint = renderProfileHint(profile);

  const payload = IS_PRODUCTION
    ? { task: task, profileHint: profileHint || undefined }
    : { task: task, profileHint: profileHint || undefined, api_key: apiKey, provider: state.provider };

  const response = await fetch(`${API_BASE}/api/questify`, {
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
    verbType: s.verbType || 'cognitive',
  }));
}

// ---- DEMO MODE ----
function getDemoSteps(task) {
  const demos = {
    default: [
      { title: 'Open your assignment and read the directions once', hint: 'Just read them. You don\'t have to start yet.', minutes: 2, verbType: 'physical' },
      { title: 'Write down ONE question you have about it', hint: 'One sentence is enough. What\'s the confusing part?', minutes: 3, verbType: 'creative' },
      { title: 'Set a timer for 8 minutes', hint: 'Tell yourself: "I only have to work for 8 minutes."', minutes: 1, verbType: 'physical' },
      { title: 'Do the first problem or write the first line', hint: 'It doesn\'t need to be perfect. Starting is the win.', minutes: 5, verbType: 'creative' },
      { title: 'Take a 3-minute stretch break', hint: 'You made real progress. Get up, drink some water.', minutes: 3, verbType: 'physical' },
      { title: 'Come back and finish one more chunk', hint: 'Just one more piece. Then you can stop for real.', minutes: 8, verbType: 'cognitive' },
      { title: 'Celebrate — tell your pet what you finished', hint: 'Type "done" — you earned the XP!', minutes: 1, verbType: 'social' },
    ],
  };

  const steps = demos.default;
  return steps.map((s, i) => ({
    id: `step_demo_${Date.now()}_${i}`,
    title: s.title,
    hint: s.hint,
    minutes: s.minutes,
    verbType: s.verbType || 'cognitive',
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
  $questifyBtn.innerHTML = '<span class="spinner"></span> Making it tiny...';

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
    state.coachChats = {}; // fresh quest, fresh chats
    lastSubdivide = null;  // fresh quest, clear undo
    state.revealedSteps = []; // fresh quest, fresh collapse state

    // Log step events for adaptive profiling (Task A)
    const eventNow = Date.now();
    steps.forEach(s => {
      state.stepEvents.push({
        stepId: s.id, taskCategory: task, minutes: s.minutes,
        verbType: s.verbType || 'cognitive', depth: 0,
        outcome: '', shownAt: eventNow, completedAt: 0, at: eventNow,
      });
    });

    // Reset input placeholder
    $taskInput.placeholder = 'e.g. "Finish my math homework" or "Write a book report" or "Read 20 pages"';

    // Save API key if entered
    if ($apiKeyInput.value.trim()) {
      state.apiKey = $apiKeyInput.value.trim();
    }

    saveState();
    renderQuestBoard();
    // Show daily quests now that user has started their first quest
    $dailySection.style.display = '';
    renderDailyQuests();

    // Scroll to quest board
    $questBoard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (isDemo) {
      showToast('🎮 Demo mode! Add your API key for real AI breakdowns.');
      announce(`Demo breakdown ready. ${steps.length} steps. First step: ${steps[0].title}.`);
    } else {
      showToast('⚡ Tiny steps ready! Start with Step 1.');
      announce(`Task broken into ${steps.length} tiny steps. Step 1: ${steps[0].title}.`);
    }

  } catch (err) {
    if (err.message === 'no_api_key') {
      showToast('🔑 Paste your API key first, or click "Demo mode"');
    } else {
      showToast(`❌ ${err.message}`);
      announce(`Error: ${err.message}. Please try again.`, 'assertive');
      console.error('Breakdown error:', err);
    }
  } finally {
    $questifyBtn.disabled = false;
    $questifyBtn.innerHTML = '⚡ Make it tiny!';
  }
}

// ---- DAILY QUESTS ----
const DAILY_QUEST_POOL = [
  { text: 'Write down ONE thing you want to do today', icon: '📝', xp: 5 },
  { text: 'Complete 1 step from any active quest', icon: '🎯', xp: 5 },
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
  const today = todayKey();
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
  const today = todayKey();
  const quests = state.dailyQuests[today];
  if (!quests) return;

  const q = quests.find(d => d.id === dailyId);
  if (!q) return;

  // Toggle: if already done, undo it
  if (q.done) {
    q.done = false;
    state.totalXP = Math.max(0, state.totalXP - q.xp);
    state.coins = Math.max(0, state.coins - 3);
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
  const today = todayKey();

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
    <div class="daily-card ${q.done ? 'completed' : ''}" onclick="completeDailyQuest('${q.id}', event)" role="button" tabindex="0" aria-label="${q.done ? 'Completed. Press Enter to undo: ' : 'Press Enter to complete: '}${escapeAttr(q.text)}">
      <span class="daily-icon">${q.icon}</span>
      <span class="daily-text">${escapeHtml(q.text)}</span>
      <span class="daily-xp">${q.done ? '✅' : '+' + q.xp + ' XP'}</span>
    </div>
  `).join('');

  saveState();
}

// ---- USER PROFILE (adaptive step sizing) ----
// Pure function. Input: stepEvents array. Output: profile object.
// No ML — just median / quartile / group counts.
function buildUserProfile(stepEvents) {
  // Cold start: < 5 events → conservative defaults (smaller steps are safer)
  if (!stepEvents || stepEvents.length < 5) {
    return {
      granularityThreshold: 3, splitCeiling: 8, bestVerbs: [],
      chainLength: 1, hardCategories: [], isColdStart: true,
    };
  }

  // --- granularityThreshold: median minutes of steps completed without split ---
  const completedClean = stepEvents
    .filter(e => e.outcome === 'completed')
    .map(e => Math.max(0.5, e.minutes || 0))
    .sort((a, b) => a - b);
  let granularityThreshold = 3;
  if (completedClean.length > 0) {
    const mid = Math.floor(completedClean.length / 2);
    granularityThreshold = completedClean.length % 2 === 0
      ? Math.round(((completedClean[mid - 1] + completedClean[mid]) / 2) * 2) / 2
      : completedClean[mid];
  }
  granularityThreshold = Math.max(0.5, granularityThreshold);

  // --- splitCeiling: lower quartile of minutes for split steps ---
  const splitMinutes = stepEvents
    .filter(e => e.outcome === 'split')
    .map(e => Math.max(0.5, e.minutes || 0))
    .sort((a, b) => a - b);
  let splitCeiling = 8;
  if (splitMinutes.length > 0) {
    const q1Idx = Math.max(0, Math.floor(splitMinutes.length / 4));
    splitCeiling = splitMinutes[q1Idx];
  }
  splitCeiling = Math.max(0.5, splitCeiling);

  // --- bestVerbs: completion rate by verbType, sorted best-first ---
  const verbStats = {};
  stepEvents.forEach(e => {
    const v = e.verbType || 'cognitive';
    if (!verbStats[v]) verbStats[v] = { total: 0, completed: 0 };
    verbStats[v].total++;
    if (e.outcome === 'completed') verbStats[v].completed++;
  });
  const bestVerbs = Object.entries(verbStats)
    .map(([verb, s]) => ({ verb, rate: s.total > 0 ? s.completed / s.total : 0 }))
    .sort((a, b) => b.rate - a.rate);

  // --- chainLength: average consecutive completions per session (2h window) ---
  const completedEvents = stepEvents
    .filter(e => e.outcome === 'completed' && e.completedAt > 0)
    .sort((a, b) => a.completedAt - b.completedAt);
  let chainLength = 1;
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  if (completedEvents.length > 0) {
    const sessions = [];
    let cur = [completedEvents[0]];
    for (let i = 1; i < completedEvents.length; i++) {
      if (completedEvents[i].completedAt - completedEvents[i - 1].completedAt < TWO_HOURS) {
        cur.push(completedEvents[i]);
      } else {
        sessions.push(cur.length); cur = [completedEvents[i]];
      }
    }
    sessions.push(cur.length);
    chainLength = Math.max(1, Math.round(sessions.reduce((a, b) => a + b, 0) / sessions.length));
  }

  // --- hardCategories: highest average depth by taskCategory ---
  const catStats = {};
  stepEvents.forEach(e => {
    if (!e.taskCategory) return;
    if (!catStats[e.taskCategory]) catStats[e.taskCategory] = { totalDepth: 0, count: 0 };
    catStats[e.taskCategory].totalDepth += Math.min(4, e.depth || 0);
    catStats[e.taskCategory].count++;
  });
  const hardCategories = Object.entries(catStats)
    .map(([cat, s]) => ({ category: cat, avgDepth: s.count > 0 ? s.totalDepth / s.count : 0 }))
    .sort((a, b) => b.avgDepth - a.avgDepth);

  return { granularityThreshold, splitCeiling, bestVerbs, chainLength, hardCategories, isColdStart: false };
}

// Synthetic 3-week user events for demo mode.
// Designed so buildUserProfile() returns: granularity ~2min, all-physical bias, chainLength ~7.
// Every value is hardcoded — no Math.random() — for stable demo video reproduction.
function getDemoStepEvents() {
  const now = Date.now();
  const DAY = 86400000;
  const events = [];
  let id = 0;

  function make(opts) {
    const at = now - opts.daysAgo * DAY - (opts.hourOffset || 10) * 3600000;
    events.push({
      stepId: `demo_ev_${id++}`,
      taskCategory: opts.cat,
      minutes: opts.min,
      verbType: opts.verb,
      depth: opts.depth || 0,
      outcome: opts.outcome,
      shownAt: at - 60000,
      completedAt: opts.outcome === 'completed' ? at : 0,
      at,
    });
  }

  // Simulate 15 active days across 3 weeks.
  // Each active day: a full 5–7 step quest, mostly physical at 2 min.
  const activeDays = [21,20,18,17,15,14,12,11,10,8,7,5,4,2,1];
  activeDays.forEach((d, di) => {
    const stepsThisDay = di < 5 ? 5 : 7; // first 5 sessions are 5 steps, rest are 7
    for (let s = 0; s < stepsThisDay; s++) {
      const cat = s < stepsThisDay - 1 ? 'writing a book report' : (di % 3 === 0 ? 'math homework' : 'reading assignment');
      make({
        cat, min: 2,
        verb: s === 0 ? 'physical' : (s < stepsThisDay - 1 ? 'physical' : 'creative'),
        depth: 0, outcome: 'completed',
        daysAgo: d, hourOffset: 10 + s * 0.12, // 7-min gaps → all within 1 hour
      });
    }
  });

  // Cognitive steps at 7-10 min — ALL split (builds splitCeiling and low cognitive rate)
  for (let d = 20; d >= 3; d -= 4) {
    make({ cat: 'writing a book report', min: 8, verb: 'cognitive', depth: 2, outcome: 'split', daysAgo: d, hourOffset: 15 });
    make({ cat: 'writing an essay', min: 7, verb: 'cognitive', depth: 2, outcome: 'split', daysAgo: d, hourOffset: 16 });
  }

  // Writing tasks with extra depth (creative substeps after initial split)
  for (let d = 18; d >= 4; d -= 5) {
    make({ cat: 'writing a book report', min: 3, verb: 'creative', depth: 1, outcome: 'completed', daysAgo: d, hourOffset: 17 });
    make({ cat: 'writing an essay', min: 4, verb: 'creative', depth: 1, outcome: 'completed', daysAgo: d, hourOffset: 18 });
  }

  // Social — low volume, all completed (neutral rate)
  for (let d = 14; d >= 2; d -= 7) {
    make({ cat: 'group presentation', min: 3, verb: 'social', depth: 0, outcome: 'completed', daysAgo: d, hourOffset: 19 });
  }

  return events;
}

// Render profile as natural-language hint for the AI breakdown prompt.
// Only positive framing — never mention failure or weakness.
function renderProfileHint(profile) {
  if (!profile || profile.isColdStart) return '';
  const ov = state.profileOverrides || {};

  // Apply overrides to computed profile values
  const granularity = ov.granularityThreshold != null ? ov.granularityThreshold : profile.granularityThreshold;
  const splitCeiling = ov.splitCeiling != null ? ov.splitCeiling : profile.splitCeiling;
  const verbsOn = ov.bestVerbsEnabled !== false;
  const chainOn = ov.chainLengthEnabled !== false;
  const catsOn = ov.hardCategoriesEnabled !== false;

  const lines = [];
  // Granularity (always included as floor/ceiling guardrails)
  lines.push(`This student's ideal starting step is about ${granularity} minutes. Steps over ${splitCeiling} minutes tend to get broken down — please keep early steps at or under ${granularity} minutes.`);
  // Best verb types (only if enabled)
  if (verbsOn && profile.bestVerbs.length >= 2) {
    const best = profile.bestVerbs[0];
    const worst = profile.bestVerbs[profile.bestVerbs.length - 1];
    if (best.rate > 0.5) {
      lines.push(`They start fast on "${best.verb}" actions — lean into concrete, body-first steps.`);
    }
    if (worst.rate < 0.5 && worst.verb !== best.verb) {
      lines.push(`"${worst.verb}" steps benefit from being wrapped in a small physical action first (e.g. "open your notebook" before a thinking step).`);
    }
  }
  // Chain length (only if enabled)
  if (chainOn && profile.chainLength > 1) {
    lines.push(`They typically complete ${profile.chainLength} steps in a row. Place ${Math.max(1, profile.chainLength)} short wins before any deeper-thinking step.`);
  }
  // Hard categories (only if enabled)
  if (catsOn && profile.hardCategories.length > 0) {
    const hardest = profile.hardCategories[0];
    lines.push(`Tasks similar to "${hardest.category}" respond well to one extra breakdown layer — please add detail for these.`);
  }
  return lines.join(' ');
}

// ---- METRICS (time-to-first-action) ----
function median(arr) {
  if (!arr || arr.length === 0) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid];
}

function computeMetrics() {
  const events = state.stepEvents;
  if (!events || events.length === 0) return { currentTTFA: null, medianTTFA: null, history: [] };

  // Group events into sessions (events whose shownAt are within 30s → same quest)
  const sorted = [...events].sort((a, b) => a.shownAt - b.shownAt);
  const sessions = [];
  let cur = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].shownAt - cur[cur.length - 1].shownAt < 30000) {
      cur.push(sorted[i]);
    } else {
      sessions.push(cur); cur = [sorted[i]];
    }
  }
  sessions.push(cur);

  // TTFA per session: first completedAt - earliest shownAt
  const ttfas = sessions.map(session => {
    const minShown = Math.min(...session.map(e => e.shownAt));
    const completed = session.filter(e => e.outcome === 'completed' && e.completedAt > 0)
      .sort((a, b) => a.completedAt - b.completedAt);
    if (completed.length === 0) return null;
    return Math.max(0, Math.round((completed[0].completedAt - minShown) / 1000)); // seconds
  }).filter(t => t !== null);

  return {
    currentTTFA: ttfas.length > 0 ? ttfas[ttfas.length - 1] : null,
    medianTTFA: median(ttfas),
    history: ttfas.slice(-10),
  };
}

function formatTTFA(seconds) {
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function recordManualTTFA(seconds) {
  if (!seconds || seconds <= 0) return;
  state.manualTTFAs.push({ seconds, date: todayKey() });
  saveState();
  openProfilePanel(); // refresh the panel
  announce(`Manual time recorded: ${formatTTFA(seconds)}.`);
}

function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    stepEvents: state.stepEvents,
    metrics: computeMetrics(),
    manualTTFAs: state.manualTTFAs,
    profile: buildUserProfile(state.stepEvents),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskquest-data-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  announce('Data exported as JSON.');
  showToast('📦 Data exported!');
}

// ---- LEARNING PROFILE PANEL ----
function openProfilePanel() {
  const profile = buildUserProfile(state.stepEvents);
  const ov = state.profileOverrides || {};

  // Effective values (overrides take precedence)
  const effGranularity = ov.granularityThreshold != null ? ov.granularityThreshold : profile.granularityThreshold;
  const effSplitCeiling = ov.splitCeiling != null ? ov.splitCeiling : profile.splitCeiling;
  const bestVerbsEnabled = ov.bestVerbsEnabled !== false;
  const chainLengthEnabled = ov.chainLengthEnabled !== false;
  const hardCategoriesEnabled = ov.hardCategoriesEnabled !== false;

  const cold = profile.isColdStart;
  const bestVerb = profile.bestVerbs.length > 0 ? profile.bestVerbs[0].verb : 'physical';
  const hardestCat = profile.hardCategories.length > 0 ? profile.hardCategories[0].category : 'writing';

  const $content = document.getElementById('profile-content');
  if (!$content) return;

  const metrics = computeMetrics();
  const manualMedian = state.manualTTFAs.length > 0
    ? median(state.manualTTFAs.map(m => m.seconds))
    : null;
  const historyStr = metrics.history.length > 0
    ? metrics.history.map(t => formatTTFA(t)).join(' &rarr; ')
    : 'No data yet — complete your first step!';

  $content.innerHTML = `
    <div class="profile-field" style="background:var(--info-light);border-color:var(--info);">
      <label class="profile-checkbox-label">
        <input type="checkbox" id="pf-demo-enabled" ${state.demoProfileEnabled ? 'checked' : ''} aria-label="Enable demo profile for video recording">
        <span aria-hidden="true">🎬</span> <strong>Demo mode</strong> — use a pre-built &ldquo;3-week user&rdquo; profile
      </label>
      <p class="profile-hint">For demo videos: same input &rarr; more steps, shorter, all physical-action starts. Stable every time. Turn off to use your real data.</p>
    </div>

    <div class="profile-field">
      <label class="profile-label"><span aria-hidden="true">⏱</span> You start best with steps around</label>
      <div class="profile-field-row">
        <input type="number" id="pf-granularity" class="profile-input" value="${effGranularity}" min="0.5" max="60" step="0.5" aria-label="Ideal step length in minutes">
        <span class="profile-unit">minutes</span>
      </div>
      <p class="profile-hint">${cold ? '(We need more data to know for sure.)' : 'Adjust if this feels wrong — we will learn from it.'}</p>
    </div>

    <div class="profile-field">
      <label class="profile-label"><span aria-hidden="true">📏</span> Steps longer than</label>
      <div class="profile-field-row">
        <input type="number" id="pf-split-ceiling" class="profile-input" value="${effSplitCeiling}" min="1" max="60" step="1" aria-label="Maximum comfortable step length in minutes">
        <span class="profile-unit">minutes work better when broken into smaller pieces</span>
      </div>
      <p class="profile-hint">${cold ? '(This is a starting guess — it gets more accurate over time.)' : 'Longer steps are fine — this just helps us know when to offer a split.'}</p>
    </div>

    <div class="profile-field">
      <label class="profile-checkbox-label">
        <input type="checkbox" id="pf-verbs-enabled" ${bestVerbsEnabled ? 'checked' : ''} aria-label="Use action-type insights">
        <span aria-hidden="true">⚡</span> You shine with <strong>${bestVerb}</strong> actions
      </label>
      <p class="profile-hint">${cold ? '(This will get more specific as you complete more quests.)' : 'We will lean into this type of step when we can.'}</p>
    </div>

    <div class="profile-field">
      <label class="profile-checkbox-label">
        <input type="checkbox" id="pf-chain-enabled" ${chainLengthEnabled ? 'checked' : ''} aria-label="Use step chain insights">
        <span aria-hidden="true">🔗</span> You often complete <strong>${profile.chainLength}</strong> steps in a row
      </label>
      <p class="profile-hint">We will place short wins before deeper steps, based on your rhythm.</p>
    </div>

    <div class="profile-field">
      <label class="profile-checkbox-label">
        <input type="checkbox" id="pf-categories-enabled" ${hardCategoriesEnabled ? 'checked' : ''} aria-label="Use task category insights">
        <span aria-hidden="true">🎯</span> Tasks similar to <strong>${hardestCat}</strong> benefit from extra detail
      </label>
      <p class="profile-hint">${cold ? '(Complete more quests and we will find patterns.)' : 'We will add an extra breakdown layer for these types of tasks.'}</p>
    </div>

    <hr style="border:0;border-top:1px solid var(--border);margin:16px 0;">

    <h3 style="font-size:1rem;margin-bottom:8px;"><span aria-hidden="true">⏱</span> Time-to-First-Action</h3>
    <p class="pet-modal-sub" style="margin-bottom:10px;">Your own numbers, on your device.</p>

    <div class="profile-field" style="display:flex;justify-content:space-around;text-align:center;flex-wrap:wrap;gap:8px;">
      <div>
        <div class="profile-label" style="font-size:0.78rem;">This quest</div>
        <div style="font-size:1.3rem;font-weight:800;">${formatTTFA(metrics.currentTTFA)}</div>
      </div>
      <div>
        <div class="profile-label" style="font-size:0.78rem;">Your median</div>
        <div style="font-size:1.3rem;font-weight:800;">${formatTTFA(metrics.medianTTFA)}</div>
      </div>
      <div>
        <div class="profile-label" style="font-size:0.78rem;">Without TaskQuest</div>
        ${state.manualTTFAs.length === 0
          ? `<div style="font-size:0.78rem;color:var(--primary);cursor:pointer;text-decoration:underline;" onclick="document.getElementById('pf-manual-ttfa').focus()">Record your own time to compare &rarr;</div>`
          : `<div style="font-size:1.3rem;font-weight:800;color:var(--text-muted);">${formatTTFA(manualMedian)}</div>`
        }
      </div>
    </div>

    <div class="profile-field">
      <div class="profile-label">Recent (last 10)</div>
      <div style="font-size:0.82rem;color:var(--text-muted);">${historyStr}</div>
    </div>

    <div class="profile-field">
      <label class="profile-label">Record a time without TaskQuest</label>
      <div class="profile-field-row">
        <input type="number" id="pf-manual-ttfa" class="profile-input" placeholder="120" min="1" max="3600" aria-label="Seconds to start a task without TaskQuest" style="width:90px;">
        <span class="profile-unit">seconds</span>
        <button class="btn-ghost" id="pf-manual-save-btn" style="font-size:0.8rem;padding:6px 12px;">Record</button>
      </div>
      <p class="profile-hint">Time how long it takes you to start a task on your own. We will show the comparison above.</p>
    </div>

    <div class="profile-field" style="text-align:center;">
      <button class="btn-primary" id="pf-export-btn" style="font-size:0.85rem;padding:8px 20px;"><span aria-hidden="true">📦</span> Export all data (JSON)</button>
      <p class="profile-hint">Download your step events, metrics, and profile for your own records.</p>
    </div>
  `;

  // Wire up dynamic buttons
  const $manualSave = document.getElementById('pf-manual-save-btn');
  const $exportBtn = document.getElementById('pf-export-btn');
  if ($manualSave) {
    $manualSave.addEventListener('click', () => {
      const val = parseInt(document.getElementById('pf-manual-ttfa')?.value);
      if (val > 0) recordManualTTFA(val);
    });
  }
  if ($exportBtn) $exportBtn.addEventListener('click', exportData);

  document.getElementById('profile-overlay').style.display = '';
  document.getElementById('profile-panel').style.display = '';
  announce('Learning profile opened. You can adjust how TaskQuest breaks down tasks for you.');
}

function saveProfileOverrides() {
  const $gran = document.getElementById('pf-granularity');
  const $split = document.getElementById('pf-split-ceiling');
  const $verbs = document.getElementById('pf-verbs-enabled');
  const $chain = document.getElementById('pf-chain-enabled');
  const $cats = document.getElementById('pf-categories-enabled');
  const $demo = document.getElementById('pf-demo-enabled');

  if ($gran) state.profileOverrides.granularityThreshold = Math.max(0.5, Math.min(60, parseFloat($gran.value) || 3));
  if ($split) state.profileOverrides.splitCeiling = Math.max(1, Math.min(60, parseInt($split.value) || 8));
  if ($verbs) state.profileOverrides.bestVerbsEnabled = $verbs.checked;
  if ($chain) state.profileOverrides.chainLengthEnabled = $chain.checked;
  if ($cats) state.profileOverrides.hardCategoriesEnabled = $cats.checked;
  if ($demo) {
    const wasEnabled = state.demoProfileEnabled;
    state.demoProfileEnabled = $demo.checked;
    if (state.demoProfileEnabled !== wasEnabled) {
      announce(state.demoProfileEnabled
        ? 'Demo profile enabled. Next quest breakdown will use the pre-built 3-week user profile.'
        : 'Demo profile disabled. Back to your real learning data.');
    }
  }
  saveState();
}

function closeProfilePanel(save = true) {
  if (save) saveProfileOverrides();
  document.getElementById('profile-overlay').style.display = 'none';
  document.getElementById('profile-panel').style.display = 'none';
  announce('Learning profile closed.');
}

function clearAllData() {
  if (!confirm('This will erase all your quests, XP, pet, coins, and learning data. This cannot be undone. Are you sure?')) return;
  localStorage.removeItem('taskquest_state');
  location.reload();
}

// Update renderProfileHint to respect overrides
// (modifies the existing function — we add override logic inline below)

// ---- UTILS ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// escapeHtml for use inside double-quoted HTML attributes (aria-labels)
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
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

// "🪄 Show me an example" button — one-click demo for first-time visitors
const $tryDemoBtn = document.getElementById('try-demo-btn');
if ($tryDemoBtn) {
  $tryDemoBtn.addEventListener('click', () => {
    $taskInput.value = 'Write a book report about Charlotte\'s Web';
    handleQuestify();
  });
}

// --- Coach panel events ---
$coachCloseBtn.addEventListener('click', closeCoachPanel);
$coachOverlay.addEventListener('click', closeCoachPanel);
$coachSendBtn.addEventListener('click', () => {
  sendCoachMessage($coachInput.value);
});
$coachInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendCoachMessage($coachInput.value);
  }
});
document.querySelectorAll('.coach-quick-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const action = this.dataset.action;
    if (action) handleCoachQuickAction(action);
  });
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

// Make div-with-onclick controls keyboard-accessible: Enter/Space on a
// [role=button] simulates a click. Never intercepts native buttons/inputs.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.target.closest('button, a, input, textarea, select')) return;
  const el = e.target.closest('[role="button"]');
  if (!el) return;
  e.preventDefault();
  el.click();
});

// ---- VOICE INPUT (Web Speech API — no external dependency) ----
// Lets early readers SAY their task instead of typing it.
// Works in Chrome / Edge / Safari; the mic button stays hidden elsewhere.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function setupVoiceInput() {
  const micBtn = document.getElementById('voice-btn');
  if (!micBtn || !SpeechRecognition) return; // unsupported — keep hidden

  micBtn.style.display = '';
  micBtn.title = 'Say your task out loud';

  let recognizing = false;
  let recog = null;

  const stopListening = () => {
    recognizing = false;
    micBtn.textContent = '🎤';
    micBtn.classList.remove('listening');
    if (recog) { try { recog.stop(); } catch (e) {} }
  };

  micBtn.addEventListener('click', () => {
    if (recognizing) { stopListening(); return; }
    try {
      recog = new SpeechRecognition();
      recog.lang = 'en-US';
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.continuous = false;
      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        if (!transcript) return;
        $taskInput.value = transcript;
        handleQuestify(); // speak → quest, instantly
      };
      recog.onend = stopListening;
      recog.onerror = () => stopListening();
      recognizing = true;
      micBtn.textContent = '🔴';
      micBtn.classList.add('listening');
      recog.start();
    } catch (e) {
      stopListening();
      showToast('🎤 Speech isn\'t available on this browser.');
    }
  });
}

// ---- EASY-READING FONT TOGGLE (OpenDyslexic) ----
function applyEasyFont() {
  document.body.classList.toggle('easy-font', state.easyFont);
  const icon = document.getElementById('font-icon');
  const btn = document.getElementById('font-btn');
  if (!icon || !btn) return;
  icon.textContent = state.easyFont ? '🔤' : '🅰️';
  btn.title = state.easyFont ? 'Easy-reading font: on' : 'Easy-reading font: off';
}

document.addEventListener('click', (e) => {
  if (e.target.closest('#font-btn')) {
    state.easyFont = !state.easyFont;
    saveState();
    applyEasyFont();
  }
});

// ---- KICK IT OFF ----
init();
updateSoundIcon();
applyEasyFont();
setupVoiceInput();
