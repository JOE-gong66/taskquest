# COPY-REVIEW — 文案安全审查

审查范围：script.js（profile 面板、metrics、announce、showToast、renderProfileHint）、README.md、SUBMISSION.md。
标准：禁止负面归因、羞耻性表述、暗示用户能力不足的措辞。

---

## 🔴 建议修改（存在可感知的负面暗示）

### 1. script.js:1344 + script.js:1321 — "Failed to split step" / "Failed to break down step"

**当前:**
```
❌ Failed to split step. Please try again.
❌ Failed to break down step.
```

**问题:** "Failed" 的主语模糊——是系统失败还是用户失败？ADHD 用户已有"我总是失败"的自我叙事，这个措辞会触发。

**建议改为:**
```
✅ Couldn't split that step. Try again?
✅ Couldn't break that down. Try again?
```
（"Couldn't" 把责任归于系统/网络，不归于用户。）

---

### 2. script.js:291 — "Not enough coins!"

**当前:**
```
❌ Not enough coins! Complete more quests to earn more. 🪙
```

**问题:** "Not enough" 是缺失框架（deficit framing）。虽然很轻微，但在宠物商店购物场景里，拒绝感会被放大。

**建议改为:**
```
✅ This costs X coins — you have Y. Complete a quest to earn more! 🪙
```
（给出具体数字，把"不够"变成"还差多少"，是进度框架而非缺失框架。）

---

### 3. SUBMISSION.md:32 — "exactly the skill that's impaired"

**当前:**
```
❌ ...the skill that's impaired
```

**问题:** "Impaired" 是临床/病理化措辞。比赛评委里有神经多样性倡导者，这个词可能引起不适。

**建议改为:**
```
✅ ...exactly the skill that executive dysfunction makes hardest
```
或
```
✅ ...the skill that ADHD brains handle differently
```
（"Works differently" 框架优于 "broken/impaired" 框架。）

---

## 🟡 建议 Joe 亲自定夺（可能 OK，但需确认）

### 4. README.md:109 — "ADHD users have heard enough about what's wrong with them"

**当前:**
```
ADHD users have heard enough about what's wrong with them. This tool tells them what's right.
```

**评价:** 这句话力量很强，情绪也最重。它对神经典型读者是教育，对神经多样性读者是共鸣。但 "what's wrong with them" 直接引用了羞耻叙事——虽然是批判它，但引用的过程本身可能让部分读者不舒服。

**备选方案:**
```
ADHD users have spent a lifetime being told to try harder.
This tool says: you're not the problem. The task is just too big.
```

---

### 5. script.js:2016 — "This is what TaskQuest improves"

**当前:**
```
How quickly you start after seeing your steps. This is what TaskQuest improves.
```

**问题:** "Improves" 暗示用户当前状态需要被改善。虽然事实如此（这就是工具的目的），但措辞可以更中性。

**建议改为（如果 Joe 觉得不妥）:**
```
How quickly you start after seeing your steps.
```
（直接删掉第二句，指标本身已经说明了一切。不需要加"我们在改善你"的注脚。）

---

### 6. script.js:2028 — "Without TaskQuest" 对照栏

**当前:**
```
| This quest | Your median | Without TaskQuest |
|   45s     |    2m 30s   |       8m 00s      |
```

**问题:** 三栏并排天然形成比较。如果"Without TaskQuest"的数字比"Your median"大很多（这正是工具要证明的），这个对比对用户是赋能——证明工具有效。但如果手动记录的数据太少或不可靠，空列或问号会让面板看起来像在等用户"证明自己"。

**建议:** 保持，但加一行说明：
```
These are your own numbers. No judgment — just data you control.
```

---

## 🟢 已确认安全（逐句过审，全部通过）

### script.js — Profile Panel 文案

| 行 | 文案 | 判定 |
|---|---|---|
| 1968 | "For demo videos: same input → more steps..." | ✅ 中性说明 |
| 1972 | "You start best with steps around" | ✅ 正向——讲优势 |
| 1977 | "Adjust if this feels wrong — we will learn from it." | ✅ 协作框架 |
| 1981 | "Steps longer than" | ✅ 中性 |
| 1984 | "minutes work better when broken into smaller pieces" | ✅ "work better" 非 "you fail" |
| 1986 | "Longer steps are fine — this just helps us know when to offer a split." | ✅ 安抚 + 工具归因 |
| 1992 | "You shine with [verb] actions" | ✅ 强正向——"shine" |
| 1994 | "We will lean into this type of step when we can." | ✅ 系统适应你 |
| 2000 | "You often complete [N] steps in a row" | ✅ 正向——讲事实 |
| 2002 | "We will place short wins before deeper steps, based on your rhythm." | ✅ 赋能 |
| 2008 | "Tasks similar to [X] benefit from extra detail" | ✅ "benefit from" 非 "you struggle with" |
| 2010 | "We will add an extra breakdown layer for these types of tasks." | ✅ 系统行为 |
| 2016 | "How quickly you start after seeing your steps." | ⚠️ 见上方 #5 |
| 2020 | "This quest" | ✅ 中性标签 |
| 2024 | "Your median" | ✅ 中性标签 |
| 2028 | "Without TaskQuest" | ⚠️ 见上方 #6 |
| 2034 | "Recent (last 10)" | ✅ 中性标签 |
| 2039 | "Record a time without TaskQuest" | ✅ 用户主动行为 |
| 2045 | "Time how long it takes you to start a task on your own." | ✅ 中性说明 |
| 2050 | "Download your step events, metrics, and profile for your own records." | ✅ "your own records" 强调所有权 |

### script.js — announce() 播报

| 行 | 文案 | 判定 |
|---|---|---|
| 934 | "+10 XP, +5 coins. Next: [title]. [N] minutes." | ✅ 信息播报 |
| 936 | "+10 XP, +5 coins. All steps complete!" | ✅ 正向 |
| 1345 | "Failed to split step. Please try again." | 🔴 见上方 #1 |
| 1390 | "Step split into [N] smaller steps. First: [title]." | ✅ 信息播报 |
| 1423 | "Split undone. Original step restored: [title]." | ✅ 信息播报 |
| 1549 | "Demo breakdown ready. [N] steps. First step: [title]." | ✅ 信息播报 |
| 1552 | "Task broken into [N] tiny steps. Step 1: [title]." | ✅ 正向——"tiny steps" |
| 1560 | "Error: [message]. Please try again." | ✅ 中性 |
| 1913 | "Manual time recorded: [time]." | ✅ 信息播报 |
| 1931 | "Data exported as JSON." | ✅ 信息播报 |
| 2067 | "Learning profile opened. You can adjust how TaskQuest breaks down tasks for you." | ✅ 赋能——"you can adjust" |
| 2087 | "Demo profile enabled / disabled..." | ✅ 信息播报 |
| 2099 | "Learning profile closed." | ✅ 信息播报 |

### script.js — showToast()

| 行 | 文案 | 判定 |
|---|---|---|
| 286 | "Already owned! 🎉" | ✅ 正向 |
| 291 | "Not enough coins! Complete more quests to earn more. 🪙" | 🔴 见上方 #2 |
| 301 | "[name] bought! Your pet looks amazing!" | ✅ 正向 |
| 646 | "[milestone] +[N] XP" | ✅ 正向——里程碑庆祝 |
| 835 | "[message] +[N] XP +[N] coins" | ✅ 正向——奖励 |
| 891 | "↩️ Undone — rewards reversed." | ✅ 中性 |
| 981 | "🏆 QUEST COMPLETE! +[N] XP bonus!" | ✅ 强正向 |
| 1103 | "🔎 Showing only your next step — one thing at a time." | ✅ 赋能——系统在帮你简化 |
| 1104 | "📋 All steps shown — you can see the whole path." | ✅ 中性——你的选择 |
| 1344 | "❌ Failed to break down step." | 🔴 见上方 #1 |
| 1389 | "🔍 Broken into [N] tinier steps!" | ✅ 正向 |
| 1394 | "❌ Connection error. Try again." | ✅ 中性 |
| 1422 | "↩️ Split undone — original step restored." | ✅ 中性 |
| 1495 | "👆 Type a task first!" | ✅ 中性引导 |
| 1548 | "🎮 Demo mode! Add your API key for real AI breakdowns." | ✅ 中性 |
| 1551 | "⚡ Tiny steps ready! Start with Step 1." | ✅ 正向——"Start with" |
| 1557 | "🔑 Paste your API key first, or click 'Demo mode'" | ✅ 中性 |
| 1630 | "↩️ Daily quest undone." | ✅ 中性 |
| 1932 | "📦 Data exported!" | ✅ 正向 |
| 2265 | "🎤 Speech isn't available on this browser." | ✅ 中性——归因浏览器 |

### script.js — renderProfileHint() （发送给 AI，非用户可见）

| 行 | 文案 | 判定 |
|---|---|---|
| 1835 | "This student's ideal starting step is about [N] minutes..." | ✅ 正向——"ideal" |
| 1841 | "They start fast on '[verb]' actions — lean into concrete, body-first steps." | ✅ 正向——"start fast" |
| 1844 | "'[verb]' steps benefit from being wrapped in a small physical action first" | ✅ "benefit from" 框架 |
| 1849 | "They typically complete [N] steps in a row..." | ✅ 正向——"typically complete" |
| 1854 | "Tasks similar to '[X]' respond well to one extra breakdown layer" | ✅ "respond well to" 框架 |

### README.md

全部 9 节通读。三处需确认：

| 位置 | 文案 | 判定 |
|---|---|---|
| §2 The Problem | "the brain simply cannot start" | ✅ 描述现象，非评价人 |
| §5 Accessibility | "ADHD users have heard enough about what's wrong with them" | 🟡 见上方 #4 |
| §8 Future Work | "False positives... feel intrusive" | ✅ 讲系统设计，非用户 |

### SUBMISSION.md

| 位置 | 文案 | 判定 |
|---|---|---|
| §1 Problem | "the brain overloads. The cursor blinks. Nothing happens." | ✅ 场景描写 |
| §1 Problem | "exactly the skill that's impaired" | 🔴 见上方 #3 |
| §3 AI Usage | "the user is the final authority" | ✅ 赋能 |
| §4 Design | "the developer knows firsthand..." | ✅ 个人经历陈述 |

---

## 统计

- 审查文案总数：~65 句
- 🔴 建议修改：3 处
- 🟡 建议 Joe 定夺：3 处
- 🟢 已确认安全：~59 句

---

## 全局建议（非逐句问题）

1. **"Failed" 关键词替换：** 在全部代码中 `grep -n "Failed" script.js` 返回 3 处（均为系统错误提示）。建议全局替换为 "Couldn't" 或 "That didn't work"，责任归于系统而非用户。

2. **metrics 面板的对照栏目：** 当前 "Without TaskQuest" 的对比是产品核心价值证明，但可能对刚接触的用户形成压力。建议首次打开时该栏目显示为 "Record your own time to compare →" 直到用户手动录入第一条数据。
