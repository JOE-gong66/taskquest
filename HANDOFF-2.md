# HANDOFF-2 — 埋点与文档批次

## 任务逐条对照

- [x] **任务 A** — time-to-first-action 埋点
  - [x] A1: metrics 面板 — 本次 TTFA / 历史中位数 / 最近 10 次走势（纯数字列表，无图表库）
  - [x] A2: 对照模式 — 手动记录"不用 TaskQuest"的耗时，并排显示
  - [x] A3: 导出按钮 — stepEvents + metrics + profile 导出为 JSON 下载

- [x] **任务 B** — README.md
  - [x] 英文，9 节完整提交级文档
  - [x] 截图占位符统一在 `docs/`，已有 8 张清单
  - [x] AI 闭环图解（文本流程图）
  - [x] 无障碍设计决策 3 条：bestStreak / 可编辑档案 / 正向文案
  - [x] Future Work 明确列出脱离检测并说明未实现原因
  - [x] DRAFT 标记在文首

- [x] **任务 C** — SUBMISSION.md
  - [x] Devpost 四部分完整第一稿
  - [x] 文首 8/1 之后原创声明
  - [x] 神经多样性参与设计部分已写，测试记录留 TODO
  - [x] DRAFT 标记在文首

---

## 验收标准逐条实测

1. **README 在 GitHub 渲染正常，无坏链**
   → **待 Joe 人工验证**（预览：https://github.com/JOE-gong66/taskquest）

2. **截图占位符路径统一在 docs/，列了补拍清单**
   → **通过** — `docs/SCREENSHOTS.md` 含 8 张截图清单，README 中所有 `![](docs/xxx.png)` 路径一致

3. **导出的 JSON 能直接打开，字段可读**
   → **待 Joe 人工验证**（需浏览器打开档案面板 → 点 Export → 检查 JSON）

4. **通读全文，没有一句负面归因或羞耻性表述**
   → **通过** — README 和 SUBMISSION 全部自查，零违规

---

## 已知未解决问题

1. 文档中所有 `[TODO]` 和 `[FILL IN]` 需要 Joe 亲自填——测试记录、测试者名字、demo 视频链接、Devpost 链接
2. `docs/` 下 8 张截图需要 Joe 手动截取
3. README 的叙事角度（尤其是 The Problem 部分）建议 Joe 用第一人称重写，更有感染力

---

## 建议 Joe 醒来后最先看三个东西

1. **README.md 全文** — 尤其第 5 节（Accessibility & Design Decisions），确认三条设计决策表述准确
2. **SUBMISSION.md 全文** — 确认问题描述和目标用户部分与你的个人经历一致，补充测试记录
3. **docs/SCREENSHOTS.md** — 按清单截图，8 张拍完就能提交
