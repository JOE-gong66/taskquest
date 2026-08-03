# TODO-LIST — 提交前待填项汇总

从 README.md 和 SUBMISSION.md 中提取的所有 TODO、占位符、待确认项。

---

## 🔴 必须填写（不填无法提交）

### 1. 测试者信息
**文件:** SUBMISSION.md §4
**需要的信息:**
- K-12 测试者人数
- 年龄范围
- 每轮测试的关键发现
- 根据反馈做了哪些改动
- 测试者原话引用（需征得同意）

**Joe 需要做什么:** 从测试记录中整理。如果还没有测试者，至少需要 1-2 位。

---

### 2. 验证清单
**文件:** SUBMISSION.md §4 "Pre-submission Validation"
**需要确认:**
- [ ] Focus mode 5 次切换一致性
- [ ] Narrator 屏幕阅读器走通完整流程
- [ ] Demo profile 对比镜头可复现
- [ ] 数据导出 / 清空可用
- [ ] 全部档案面板文案正向审查

**Joe 需要做什么:** 实际走一遍，逐条打勾。

---

### 3. 截图
**文件:** SUBMISSION.md 底部 + README.md 8 处占位符
**需要:** 8 张 PNG 截图放入 `docs/`
**详细拍摄指南:** 见 `SCREENSHOT-LIST.md`

**Joe 需要做什么:** 按 SCREENSHOT-LIST.md 顺序拍摄。

---

### 4. 测试者致谢
**文件:** README.md §9 Acknowledgments
**当前:** `[TODO: add names/handles of testers who provided feedback]`
**需要的信息:** 测试者名字或昵称（征得同意后）。

---

## 🟡 建议填写（提升提交质量）

### 5. Demo 视频链接
**文件:** README.md（旧版有 `[link]`，新版未包含，但 Devpost 要求视频）
**需要:** YouTube（unlisted）或 Vimeo 链接
**参考:** `demo-storyboard.md` 已有完整的 5 幕脚本。

---

### 6. Devpost 提交链接
**文件:** README.md（旧版有 `[link]`，新版未包含）
**需要:** Devpost 项目 URL（提交后才有）。

---

### 7. 叙事角度审阅
**文件:** README.md 全文 + SUBMISSION.md 全文
**需要 Joe 确认:**
- The Problem 描述是否符合他的亲身经历
- "ADHD users have heard enough about what's wrong with them" 这句定调是否保留（COPY-REVIEW.md #4 详细讨论了）
- §4 设计部分 "Built by a neurodivergent developer with ADHD" 是否需要补充个人故事细节

---

### 8. 隐私 / 免责措辞
**文件:** 当前 README.md §7 Privacy 已写 "All data stays in your browser"
**确认:** 是否需要额外的 COPPA 相关说明（目标用户是 K-12）？IncludAI 评委中可能有儿童隐私倡导者。

---

## 🟢 已自动填充（无需 Joe 操作）

| 项目 | 当前值 | 位置 |
|---|---|---|
| 在线 Demo URL | `https://lovely-conkies-70714e.netlify.app/` | README.md §1 |
| GitHub URL | `https://github.com/JOE-gong66/taskquest` | SUBMISSION.md §Technical Notes |
| 原创声明 | "All code written after August 1, 2026" | SUBMISSION.md 文首 |
| 截图清单 | `docs/SCREENSHOTS.md` | 仓库根目录 |
| DRAFT 标记 | 两文件文首均有 `> ⚠️ DRAFT` | README.md + SUBMISSION.md |

---

## 填写顺序建议

```
1. 跑 SUBMISSION.md 验证清单（30 分钟）
   → focus 模式 + Narrator + demo 对比 + 导出
2. 按 SCREENSHOT-LIST.md 拍 8 张截图（20 分钟）
3. 填测试者信息（如有）（10 分钟）
4. 通读 README.md + SUBMISSION.md，确认叙事角度（20 分钟）
5. 录 demo 视频（1-2 小时，可改天做）
6. 提交 Devpost → 取链接 → 填回 README
```
