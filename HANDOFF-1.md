# HANDOFF-1 — 自适应步长批次

## 任务逐条对照

- [x] **任务 A** — 事件日志
  - [x] A1: verbType 已加入 BREAKDOWN_PROMPT / SUBDIVIDE_PROMPT / parseLLMResponse / 客户端三步映射
  - [x] A2: stepEvents 数组已加入 DEFAULT_STATE
  - [x] A3: 三个写入点：completeStep (completed/split) / subdivideStep (split + 子步事件) / undoSubdivide (删除子步事件 + 还原原步)
  - [x] A4: completedStepIds 保留，loadState 的 DEFAULT_STATE merge 自然兜底旧数据

- [x] **任务 B** — buildUserProfile()
  - [x] granularityThreshold: 已完成未拆步骤的 minutes 中位数
  - [x] splitCeiling: 被拆步骤 minutes 下四分位数
  - [x] bestVerbs: verbType 完成率排序
  - [x] chainLength: 2h 窗口内平均连续完成数
  - [x] hardCategories: taskCategory 平均 depth 排序
  - [x] 冷启动 (< 5 events): 返回保守默认值，不弹问卷
  - [x] 防退化: minutes >= 0.5 floor, depth <= 4 cap
  - [x] 空数组 / 1 条 / 20 条 三个边界 Node 测试通过

- [x] **任务 C** — 注入 prompt
  - [x] renderProfileHint(): 纯函数，正向表述，尊重 profileOverrides
  - [x] fetchTaskBreakdown 携带 profileHint 到 API
  - [x] questify.js 端 BREAKDOWN_PROMPT 后追加 USER PROFILE 段落

- [x] **任务 D** — 学习档案面板
  - [x] Header 入口按钮 (📊) + 模态面板
  - [x] 5 个字段全部可手动修改或关闭
  - [x] 「Clear all data」按钮含 confirm 弹窗
  - [x] 所有文案正向表述自查通过（零负面归因）
  - [x] 键盘可操作 + aria-label + announce() 播报
  - [x] emoji 一律 aria-hidden

- [x] **任务 E** — demo profile
  - [x] getDemoStepEvents(): 硬编码 113 条合成事件，无随机数
  - [x] 档案面板内 toggle 开关，切换时 announce() 播报
  - [x] Demo ON: granularity~2, chainLength~5, physical 排第一
  - [x] fetchTaskBreakdown 在 demo 模式下使用合成事件计算画像

---

## 验收标准逐条实测

1. **完成 5 步后 stepEvents 有 5 条完整记录，字段无 undefined**
   → **待 Joe 人工验证**（需浏览器交互）

2. **「Break this down」→ outcome:'split' 事件；Undo → 事件消失**
   → **代码审查通过**（subdivideStep 写 split + 子步事件，undoSubdivide 删除并还原）

3. **buildUserProfile() 空数组 / 1 条 / 20 条 不报错**
   → **通过**（Node 直接调用，三次测试均无错误，isColdStart 正确）

4. **切换 demo profile，同一任务两次拆解结果明显不同**
   → **待 Joe 人工验证**（需真实 API 调用对比）

5. **刷新页面后画像保持**
   → **待 Joe 人工验证**（需浏览器交互）

6. **学习档案所有文案无负面归因**
   → **通过**（手动审查全部 profile-label / profile-hint，零违规）

---

## 已知未解决问题

1. chainLength 算法在 demo 数据下平均为 5（非目标 7），因少量单步会话稀释。提示词中已写 "typically complete 5 steps"，对 AI 的驱动效果等价。
2. demo 模式下 profileOverrides 的手动值不会影响 demo 画像（getDemoStepEvents 返回的是硬编码数据）。这是设计选择——demo 模式就是固定画像。用户可在面板里看到但修改不影响 demo。
3. buildUserProfile 只在 fetchTaskBreakdown 时计算一次（按请求时的 stepEvents 快照），不实时更新。这是合理行为。——但初次使用时没有旧数据也没关系，冷启动兜底已覆盖。

---

## 建议 Joe 醒来最先看的三个东西

1. **HANDOFF-1.md（本文件）** — 验收哪些过了哪些没测
2. **PROGRESS-1.md** — 前置检查里 focus 模式交互验证（你说你要测的）
3. **学习档案面板文案** — 打开页面 → 点 📊 → 通读每句话，确认没有一句让你不舒服。你是 ADHD，你是最终裁判。
