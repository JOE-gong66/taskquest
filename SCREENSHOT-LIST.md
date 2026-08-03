# SCREENSHOT-LIST — 拍摄清单

按此顺序拍摄，最小化 localStorage 清理和重新配置次数。
全部截图建议 **1280×800** 或 **1440×900** 窗口，保持一致的浏览器外观。

---

## 准备工作

在开始截图前：
1. 关闭所有浏览器扩展（尤其是广告拦截、暗色模式插件）
2. 浏览器缩放设为 100%
3. 关闭书签栏（截图更干净）
4. 打开 http://localhost:8765 或生产 URL

---

## 第 1 张：full-app.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/full-app.png` |
| **要展示什么** | 完整应用界面——header 统计栏、输入区域、空状态（🐉 龙插图）、Daily Quests、pet sanctuary |
| **前置状态** | **全新状态**。打开浏览器 DevTools → Application → Local Storage → 删除 `taskquest_state` → 刷新页面。关掉宠物弹窗（如果有）。 |
| **关键元素** | Lv.1 / 0 XP / 0 coins / best streak / 🅰️ 按钮 / 📊 按钮 / 输入框 / "What quest are you stuck on?" / 🐉 Ready to slay your first dragon? / Daily Quests 区域 |
| **备注** | 如果 pet modal 弹出来了，先 Skip，再截。 |

---

## 第 2 张：breakdown.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/breakdown.png` |
| **要展示什么** | AI 拆解结果：输入 "write a book report about Charlotte's Web" → 点击 ⚡ Make it tiny! → 步骤卡片从上到下展开的完整列表 |
| **前置状态** | 在第 1 张的基础上。在输入框输入 `write a book report about Charlotte's Web`，点击 Questify。如果生产环境 API key 不可用，在本地 `python server.py` + API key 或使用 Demo mode。 |
| **关键元素** | Quest board 标题 "🗺️ Your Quest" / 原任务引用 / Focus mode toggle 按钮 / Step 1 of N 进度 / 全部步骤卡片（编号、标题、💡 hint、⏱ 时间、🔍 Too big、💬 Coach 按钮） |
| **备注** | 建议截完后**不要关闭**此页面，下一步直接切换 focus mode。 |

---

## 第 3 张：focus-mode.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/focus-mode.png` |
| **要展示什么** | Focus mode 激活——只有完成步 + 下一步可见，其余折叠为虚线横条，"Step X of Y" 进度指示器可见 |
| **前置状态** | 在第 2 张的 quest 基础上。Focus mode 是默认开启的——如果已经处于 focus 模式就直接截。如果展开了全部，点击 "🔎 Just the next step" 切回 focus 模式。**不要勾选任何步骤**——让第一个步骤保持未完成状态。 |
| **关键元素** | 第一个 step card 完全展开 / 其余步骤折叠为虚线框（显示 "tap to reveal ↓"）/ 进度 "Step 1 of N" / 按钮文案为 "📋 Show all steps"（表示点击会展开全部） |
| **备注** | 这是 Bug 1 修好后的正确状态——确认按钮写的是 "📋 Show all steps" 而非 "🔎 Just the next step"。 |

---

## 第 4 张：subdivide.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/subdivide.png` |
| **要展示什么** | 某个步骤被拆分成 3 个子步后的效果，以及底部的 "Undo split" 横条 |
| **前置状态** | 在第 3 张的基础上。点击任意步骤的 "🔍 Too big" 按钮。如果是 Demo mode，步骤会本地拆分；如果是 API mode，会调用 subdivide API。拆分完成后截。 |
| **关键元素** | 原步骤消失 → 3 个新子步卡片出现 / 底部的 "📦 原步骤 → 3 smaller steps" Undo split 横条 / toast 提示 "🔍 Broken into 3 tinier steps!" |
| **备注** | 如果 API 失败回退到 toast 错误，用 Demo mode 重试。 |

---

## 第 5 张：coach.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/coach.png` |
| **要展示什么** | AI Coach 面板已打开，有 AI 回复内容可见 |
| **前置状态** | 在第 4 张的基础上（或任意有 quest 的状态）。点击某个步骤的 "💬 Coach" 按钮 → Coach 面板从右侧滑入 → 点击 "📝 Write a starter" → 等待 AI 回复 typing → 回复完整显示后截图。 |
| **关键元素** | Coach 面板标题 "💬 AI Coach" / 步骤上下文 / 4 个 quick action 按钮 / 用户消息 / AI 回复（打字效果完成后）/ 底部输入框 |
| **备注** | 确保截到 AI 回复内容，不是空面板或 loading 状态。如果 API 不可用，在本地环境测。 |

---

## 第 6 张：pet.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/pet.png` |
| **要展示什么** | Pet sanctuary——宠物、名字标签、speech bubble、accessory、进化阶段圆点 |
| **前置状态** | 需要先有一个 pet。完成一次 quest 的第一步 → pet invite modal 弹出 → 选宠物 + 命名 → confirm。然后去 pet shop（🛍️）买一个 accessory（需要足够 coins——完成更多步骤赚 coins）。让 pet 的 speech bubble 可见（点击 pet 触发一句随机 quote，快速截图）。 |
| **关键元素** | 宠物 emoji / 名字标签 / speech bubble（有文字）/ head accessory / 进化阶段 dots / 左下角的 pet-shop 按钮 |
| **备注** | 用 `state.coins = 50` 在 console 加 coins 快速买 accessory。speech bubble 4.5 秒后消失，要快截。 |

---

## ⚠️ 第 7–8 张需要切换 demo profile

**在截这两张之前需要清理状态：**

```js
// 在浏览器 console 运行
localStorage.removeItem('taskquest_state');
location.reload();
```

---

## 第 7 张：adaptive-comparison.png（★ 最重要——对比镜头）

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/adaptive-comparison.png` |
| **要展示什么** | 同一输入 "write a book report"，左侧新用户结果 vs 右侧 3 周用户结果。步数、步长、动词类型明显不同。 |
| **前置状态** | 这是两张截图的拼接。需要后期用图片编辑工具并排。 |
| **左侧截图（新用户）:** | |
| | 1. 确保 localStorage 已清空（上一步已做） |
| | 2. 输入 `write a book report` → Questify → 截 quest board |
| | 3. **记下步数和第一步的标题** |
| **右侧截图（3 周用户）:** | |
| | 1. 打开 📊 学习档案面板 → 勾选 "Demo mode" → Save changes |
| | 2. 关闭面板。清空 quest：在 console 运行 `state.activeQuest = null; state.stepEvents = []; saveState(); location.reload();` |
| | 3. 刷新后输入完全相同的任务 `write a book report` → Questify |
| | 4. 截 quest board |
| **拼接:** | 两张 quest board 截图左右并排，左上角标注 "New user" / "3-week user" |
| **预期差异:** | 新用户：通用 5-7 步，混合 verbType / demo 用户：更多步、偏短（~2 min）、physical-action 开头 |
| **备注** | 这是 demo 视频和 Devpost 的核心对比镜头，务必两张截图窗口大小一致。 |

---

## 第 8 张：profile-panel.png

| 项目 | 说明 |
|---|---|
| **文件名** | `docs/profile-panel.png` |
| **要展示什么** | 学习档案面板——demo mode toggle、5 个可编辑档案字段、TTFA 指标、手动记录区域、Export 按钮 |
| **前置状态** | 在第 7 张 demo 用户状态基础上。点击 header 的 📊 按钮打开档案面板。让 Demo mode 保持勾选状态。 |
| **关键元素** | 面板标题 / Demo mode toggle / "You start best with steps around 2 minutes" / "Steps longer than..." / "You shine with physical actions" / "You often complete 5 steps in a row" / TTFA 三个数字 / "Record a time without TaskQuest" / "Export all data (JSON)" / "Clear all data" 按钮 |
| **备注** | 确保面板完整可见——如果屏幕小，可能需要纵向截长图或调小浏览器窗口 |

---

## 拍摄顺序总结

```
清空 localStorage → 关宠物弹窗
  → 1. full-app.png
  → 输入 "write a book report" → Questify
  → 2. breakdown.png
  → 确认 focus 模式
  → 3. focus-mode.png
  → 点击 "Too big"
  → 4. subdivide.png
  → 点击 "Coach" → "Write a starter" → 等回复
  → 5. coach.png
  → 加 coins → 领 pet → 买 accessory → 点 pet 出 speech
  → 6. pet.png

清空 localStorage → 开 demo → 输入相同任务
  → 7-left: 新用户  7-right: demo用户 → 拼接 adaptive-comparison.png
  → 开 📊 面板
  → 8. profile-panel.png
```

---

## 补充：SUBMISSION.md 引用的额外截图

SUBMISSION.md 没有引用具体图片，但建议在 Devpost 提交时复用上述截图。
