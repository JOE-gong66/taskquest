# RISK-REVIEW — stepEvents undefined 风险静态排查

逐字段追溯所有写入路径与读取路径，检查是否可能为 `undefined`。

---

## 字段矩阵

| 字段 | 写入路径 | 总是有值？ | 读取路径 | 有兜底？ |
|---|---|---|---|---|
| `stepId` | handleQuestify / subdivideStep | ✅ `s.id` 永远是字符串 | buildUserProfile 不读 | N/A |
| `taskCategory` | handleQuestify: `task`（用户输入） | ✅ 空输入在 handleQuestify 入口拦截 | hardCategories: `if (!e.taskCategory) return` | ✅ |
| `minutes` | 三步映射均有 `Math.max(1, ...)` 默认值 | ✅ 永远 >= 1 | `Math.max(0.5, e.minutes \|\| 0)` | ✅ |
| `verbType` | `s.verbType \|\| 'cognitive'` | ✅ 有兜底 | `e.verbType \|\| 'cognitive'` | ✅ |
| `depth` | handleQuestify: `0`；subdivideStep: `parentDepth + 1`（parentDepth 默认 0） | ✅ 永远是数字 | `Math.min(4, e.depth \|\| 0)` | ✅ |
| `outcome` | 初始 `''`；completeStep 设为 `'completed'`；subdivideStep 设为 `'split'` | ✅ 永远是字符串 | 字符串精确比较 `=== 'completed'` / `=== 'split'` | ✅ |
| `shownAt` | 两处初始写入均为 `Date.now()` | ✅ 永远是数字 | computeMetrics: `Math.min(...session.map(e => e.shownAt))` | ⚠️ 见风险 3 |
| `completedAt` | 初始 `0`；completeStep 设为 `Date.now()`；undo 回退 `0` | ✅ 永远是数字 | `e.completedAt > 0` 比较 | ✅ |
| `at` | 所有写入点均设 `Date.now()` | ✅ 永远是数字 | 不读取 | N/A |

---

## 风险 1：LLM 不返回 verbType

**触发路径:** DeepSeek API 返回的 JSON 中某 step 缺少 `verbType` 字段。

**当前兜底:**

```
questify.js parseLLMResponse (服务端):
  verbType: ['physical','cognitive','social','creative'].includes(s.verbType) ? s.verbType : 'cognitive'

script.js fetchTaskBreakdown (客户端映射):
  verbType: s.verbType || 'cognitive'

script.js subdivideStep (子步映射):
  verbType: s.verbType || 'cognitive'

script.js buildUserProfile (读取):
  const v = e.verbType || 'cognitive';
```

**结论:** 三层兜底覆盖。即使 LLM 不返回、服务端漏过、客户端也兜。**不会 undefined。**

---

## 风险 2：递归拆分 depth 溢出

**触发路径:** 用户反复拆分同一子步（depth 0 → 1 → 2 → 3 → 4 → ...）

**当前兜底:**

```
buildUserProfile (读取):
  catStats[e.taskCategory].totalDepth += Math.min(4, e.depth || 0);
  // depth 上限 = 4
```

**但有潜在问题:** `subdivideStep` 写入子步事件时 depth 无上限：
```
depth: parentDepth + 1
```

如果用户在第 5 次拆分时 `parentDepth = 5`，子步 depth = 6。虽然 buildUserProfile 读取端有 `Math.min(4, ...)` 兜底，但如果将来有人直接用 `e.depth` 做比较而非限制，可能出问题。

**建议:** 写入端加 `Math.min(4, parentDepth + 1)`。当前不影响功能（只有 buildUserProfile 读 depth），但属于结构化风险。

---

## 风险 3：computeMetrics 对 shownAt 无兜底

**触发路径:** 如果 stepEvents 中存在 `shownAt === undefined` 的事件（仅可能通过浏览器 console 手动注入）。

**当前代码:**
```js
// computeMetrics
const minShown = Math.min(...session.map(e => e.shownAt));
// 如果 shownAt 是 undefined → Math.min(1, undefined) = NaN
// → completed[0].completedAt - NaN = NaN
// → Math.max(0, NaN) = NaN
// → Math.round(NaN) = NaN
// → formatTTFA(NaN) = "NaNs" ← 面板显示乱码
```

**实际风险:** 极低。所有写入路径均设 `shownAt` 为 `Date.now()`，旧 localStorage 不会有 stepEvents 数组。

**建议:** `computeMetrics` 加一行过滤：
```js
const sorted = [...events].filter(e => typeof e.shownAt === 'number').sort(...)
```

---

## 风险 4：老用户 localStorage 无 stepEvents 降级

**触发路径:** 用户在 QUEUE-1 部署前使用过 TaskQuest，localStorage 中有旧 state 但无 `stepEvents` 字段。

**当前兜底:**
```js
// loadState()
const raw = localStorage.getItem('taskquest_state');
if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
```

`DEFAULT_STATE.stepEvents = []`，旧存档合并后也是 `[]`。

**结论:** 正确降级为空数组。`buildUserProfile([])` 返回 `isColdStart: true` 的保守默认值。`computeMetrics([])` 返回 `{ currentTTFA: null, medianTTFA: null, history: [] }`。面板显示 "No data yet — complete your first step!"。**安全。**

---

## 风险 5：undoSubdivide 清理时子步 ID 可能不匹配

**触发路径:** `undoSubdivide` 中获取子步 ID 后 splice，但 `stepEvents.filter` 在 splice 之前执行，顺序正确：

```js
const subStepIds = state.activeQuest.steps.slice(stepIndex, stepIndex + newCount).map(s => s.id);
state.stepEvents = state.stepEvents.filter(e => !subStepIds.includes(e.stepId));
// ↑ 先清理事件
state.activeQuest.steps.splice(stepIndex, newCount, originalStep);
// ↑ 再还原步骤
```

**结论:** 顺序正确。`s.id` 永远存在（step 对象必须的字段）。**安全。**

---

## 风险 6：completeStep 中 event 可能不存在

**触发路径:** 用户完成一个步骤，但该步骤在 stepEvents 中没有记录（例如步骤是在 stepEvents 功能添加前创建的）。

**当前代码:**
```js
const stepEvent = state.stepEvents.find(e => e.stepId === stepId);
if (stepEvent) { stepEvent.outcome = 'completed'; ... }
```

**结论:** `if (stepEvent)` 守卫存在。找不到事件时静默跳过，不会报错。**安全**，但会导致该步骤的完成不被追踪——不影响用户体验，只影响 profile 精度。冷启动期 (< 5 events) 概率高，属于预期行为。

---

## 总结

| 风险等级 | 数量 | 说明 |
|---|---|---|
| 🔴 高危 | 0 | 无可能导致崩溃或白屏的 undefined |
| 🟡 中危 | 1 | 风险 3: computeMetrics NaN 传播（需手动注入才触发） |
| 🟢 低危 | 2 | 风险 2: depth 写入端无上限（读端已兜底）；风险 6: 旧步骤无事件（静默跳过） |
| ✅ 安全 | — | 其余全部字段在所有正常路径上均有值 |

**建议优先修:** 风险 3（加 filter 一行）、风险 2（加 Math.min 一行）。改动量各一行，零回归风险。
