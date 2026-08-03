# HANDOFF-3 — 静态审查批次

本批未修改任何功能代码。四份报告均为静态分析结果。

---

## 完成清单

- [x] **任务 1: COPY-REVIEW.md** — 文案安全审查
  - 审查 ~65 句用户可见文案
  - 3 处建议修改（"Failed" → "Couldn't"、"Not enough coins"、"impaired" 措辞）
  - 3 处 Joe 定夺（"what's wrong with them" 表述、"This is what TaskQuest improves"、对照栏目）
  - 所有判定均标注文件:行号

- [x] **任务 2: RISK-REVIEW.md** — undefined 风险排查
  - 9 字段逐列矩阵：写入路径 × 读取路径 × 兜底检查
  - 6 项风险分析：0 高危、1 中危（computeMetrics NaN 传播）、2 低危
  - 确认老 localStorage 降级安全、LLM 不返回 verbType 三层兜底安全

- [x] **任务 3: SCREENSHOT-LIST.md** — 截图拍摄清单
  - 8 张截图，按最优拍摄顺序排列（最小化 localStorage 重设次数）
  - 每张含：文件名、要展示什么、前置状态、关键元素、备注
  - 第 7 张 adaptive-comparison.png 有详细的两步拍摄 + 拼接说明

- [x] **任务 4: TODO-LIST.md** — 待填项汇总
  - README + SUBMISSION 全部 TODO / 占位符提取
  - 🔴 必须填写 4 项 / 🟡 建议填写 4 项 / 🟢 已自动填充 5 项
  - 含推荐填写顺序（从 30 分钟到 2 小时）

---

## 文件索引（Joe 醒来后的阅读顺序）

| 优先级 | 文件 | 内容 | 预计阅读 |
|---|---|---|---|
| 1 | **COPY-REVIEW.md** | 3 处需要你拍板的文案措辞 | 5 分钟 |
| 2 | **TODO-LIST.md** | 提交前还有哪些要填的 | 3 分钟 |
| 3 | **SCREENSHOT-LIST.md** | 8 张截图怎么拍 | 5 分钟 |
| 4 | **RISK-REVIEW.md** | 有没有潜在的 undefined 崩 | 3 分钟 |

---

## 四份报告都不需要 Joe 回读代码

所有报告已包含足够的上下文（文件:行号、当前文案、建议文案、判定理由），Joe 可以只看报告做决策，不需要回去翻源码。

---

## 如果 Joe 同意 COPY-REVIEW 的 3 处修改

改动量极小，每处一行：
1. `script.js:1321,1344`: `s/Failed/Couldn't/g`（2 处）
2. `script.js:291`: showToast 里加硬币数量
3. `SUBMISSION.md:32`: `s/impaired/executive dysfunction makes hardest/`

如果 Joe 同意，可以说"改"，我一分钟改完。
