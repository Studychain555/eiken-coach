# 📱 Shadowing Detailed Feedback - UI Mockup

## Screen 1: Result Summary (ShadowingResultScreen)

```
┌─────────────────────────────────────────┐
│ ← Back                      ⚙️            │
├─────────────────────────────────────────┤
│                                          │
│  🎉 シャドーイング完了！                │
│                                          │
│  ┌──────────┬──────────┬──────────┐     │
│  │ 正確性   │ リズム   │ 発音     │     │
│  │ ████░░░░ │ ██████░░ │ ███████░ │     │
│  │ 7.5/10   │ 6.5/10   │ 7.0/10   │     │
│  └──────────┴──────────┴──────────┘     │
│                                          │
│  ┌──────────────────────────────┐       │
│  │     7.3                      │       │
│  │     /10                      │       │
│  │  📈 改善度: +0.8             │       │
│  │  👍 よくできました！         │       │
│  └──────────────────────────────┘       │
│                                          │
│  ⬆️ (Chart: Accuracy trend if >1 round) │
│                                          │
├─────────────────────────────────────────┤
│ 📊 各ラウンドの評価                     │
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ラウンド 1                        ▼ │ │
│ │ 正確性: 7.5   リズム: 6.5         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ラウンド 2                        ▶ │ │
│ │ 正確性: 7.8   リズム: 6.8         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ラウンド 3                        ▶ │ │
│ │ 正確性: 8.0   リズム: 7.0         │ │
│ └─────────────────────────────────────┘ │
│                                          │
├─────────────────────────────────────────┤
│  [← リスニングに戻る]  [完了 →]        │
└─────────────────────────────────────────┘
```

---

## Screen 2: Expanded Round Details

```
┌─────────────────────────────────────────┐
│ 📊 各ラウンドの評価                     │
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ラウンド 1                        ▼ │ │
│ │ 正確性: 7.5   リズム: 6.5         │ │
│ │                                   │ │
│ │ ┌─────────────────────────────┐  │ │
│ │ │ 💡 詳細コメント             │  │ │
│ │ │                            │  │ │
│ │ │ 【ラウンド1の詳細評価】    │  │ │
│ │ │                            │  │ │
│ │ │ ✓ 正確性: 75% です         │  │ │
│ │ │ もう少し細部に注意...     │  │ │
│ │ │                            │  │ │
│ │ │ 🎵 リズム: リズムはまあまあ │  │ │
│ │ │ もう少し速度を調整...     │  │ │
│ │ │                            │  │ │
│ │ │ 🗣️ 発音: 大体正しいですが  │  │ │
│ │ │ いくつかの音が不正確...   │  │ │
│ │ │                            │  │ │
│ │ │ 💡 アドバイス: 着実に上達  │  │ │
│ │ │ しています...             │  │ │
│ │ └─────────────────────────────┘  │ │
│ │                                   │ │
│ │  [📝 詳細な分析を見る]            │ │
│ │                                   │ │
│ └─────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

---

## Screen 3: Detailed Word-by-Word Analysis (DetailedShadowingFeedback)

```
┌─────────────────────────────────────────┐
│ ラウンド 1                              │
│ 詳細フィードバック                     │
├─────────────────────────────────────────┤
│                                          │
│ ┌────────────┬────────────┬────────────┐ │
│ │ 正確性     │ リズム     │ 発音       │ │
│ │ ████████░░ │ ██████░░░░ │ ███████░░░ │ │
│ │ 7.5/10     │ 6.5/10     │ 7.0/10     │ │
│ └────────────┴────────────┴────────────┘ │
│                                          │
├─────────────────────────────────────────┤
│ 📝 各単語の評価                         │
├─────────────────────────────────────────┤
│                                          │
│ ✓ She  ✓ is  ✗ studying  ✓ English    │
│ ✓ and  ✓ she  △ practice  ✓ everyday  │
│                                          │
│ (Tap any word for details)             │
│                                          │
├─────────────────────────────────────────┤
│ 💡 全体コメント                         │
├─────────────────────────────────────────┤
│                                          │
│ ┌───────────────────────────────────┐  │
│ │ 【ラウンド1の詳細評価】           │  │
│ │                                   │  │
│ │ ✓ 正確性: 75% です。             │  │
│ │ もう少し細部に注意を払いましょう │  │
│ │ 特に「studying」の部分を確認してください │
│ │                                   │  │
│ │ 🎵 リズム: リズムはまあまあです。│  │
│ │ もう少し速度を調整すると        │  │
│ │ いいでしょう。                  │  │
│ │                                   │  │
│ │ 🗣️ 発音: 大体の発音は正しいですが│  │
│ │ いくつかの音が不正確です。       │  │
│ │                                   │  │
│ │ 💡 アドバイス: 着実に上達している│  │
│ │ もっと練習を重ねると、もっと良くなる│  │
│ │ ラウンド3までは基本を固める。    │  │
│ │ 焦らず丁寧に。                  │  │
│ │                                   │  │
│ └───────────────────────────────────┘  │
│                                          │
│ 📌 凡例                                │
│ ✓ 正確  ✗ 不正確  △ 弱い/不自然      │
│                                          │
└─────────────────────────────────────────┘
```

---

## Screen 4: Detailed Word Modal (On Word Tap)

```
┌─────────────────────────────────────────┐
│ [✕]                単語の詳細      [ ] │
├─────────────────────────────────────────┤
│                                          │
│ 単語                                   │
│ ┌─────────────────────────────────────┐ │
│ │              studying              │ │
│ │        [Pronunciation]             │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 評価                                   │
│ ┌─────────────────────────────────────┐ │
│ │ ✗ 不正確な発音です                 │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ あなたの発音                           │
│ ┌─────────────────────────────────────┐ │
│ │ 聞こえた内容:                       │ │
│ │ スタディング                        │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 正しい発音                             │
│ ┌─────────────────────────────────────┐ │
│ │ カタカナ表記:                       │ │
│ │ スタディング or スタディンg        │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 何が間違っていたのか                   │
│ ┌─────────────────────────────────────┐ │
│ │ /ɪŋ/ の音をしっかり発音できていない  │ │
│ │ 「ing」は単なる「いんぐ」ではなく、 │ │
│ │ 鼻音で終わる音です。               │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 改善のコツ                             │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 「ng」の部分を鼻からの音を意識  │ │
│ │ して発音してください。             │ │
│ │ スタディングではなく「スタディン」  │ │
│ │ と、鼻音で終わります。             │ │
│ │                                     │ │
│ │ 別の例: thing → シング (鼻音)      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │              [閉じる]               │ │
│ └─────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

---

## Color Coding System

### Word Status Colors
```
✓ CORRECT (Green)    - Accurate pronunciation
✗ INCORRECT (Red)    - Needs correction
△ WEAK (Gray)        - Unnatural or weak pronunciation
```

### Score Colors
```
Green (#52A876)    - Score 7.0+  (Excellent)
Orange (#D4A574)   - Score 5.0-7.0 (Good)
Red (#C85C5C)      - Score <5.0   (Needs improvement)
```

### UI Elements
```
Primary Color: #1B9BA4 (Teal) - Buttons, highlights
Background: #FAFBF9 (Warm white) - Main background
Cards: #FFFFFF (Pure white) - Content areas
Text Dark: #2D3436 (Natural dark gray) - Headings
Text Medium: #5A6B7A (Medium gray) - Body text
Text Light: #8B95A5 (Light gray) - Hints
```

---

## Interaction Flow

### 1. User completes shadowing round
```
ShadowingScreen (recording)
    ↓
Evaluation (Claude API or dummy)
    ↓
ShadowingResultScreen (summary)
```

### 2. User taps a round
```
ShadowingResultScreen (collapsed)
    ↓ [Tap Round 1]
    ↓
ShadowingResultScreen (expanded with detailed comment)
```

### 3. User taps "詳細な分析を見る"
```
    ↓ [Tap button]
    ↓
DetailedShadowingFeedback (word-by-word analysis)
```

### 4. User taps a highlighted word
```
DetailedShadowingFeedback (word list)
    ↓ [Tap "studying"]
    ↓
WordDetailModal (pronunciation details, tips)
```

---

## Key UX Principles

1. **Clarity First**
   - Each element has a single, clear purpose
   - Color coding makes status immediately visible
   - No clutter or unnecessary information

2. **Progressive Disclosure**
   - Summary view first (scores only)
   - Expand for detailed feedback
   - Tap word for deep analysis
   - Each level adds more detail without overwhelming

3. **Actionable Feedback**
   - Not just "you're wrong" but "here's why" and "here's how"
   - Specific examples and comparisons
   - Practical tips users can apply immediately

4. **Encouraging Tone**
   - Positive language ("着実に上達")
   - Celebration of progress ("よくできました")
   - Growth mindset ("もう少し練習を重ねると")

5. **Human-Centered Design**
   - Warm colors (natural palette)
   - Natural language explanations
   - Empathetic feedback
   - No robotic or AI-feeling text

---

## Animation Details

### Transitions
- **Screen Entry**: Slide up from bottom (300ms)
- **Modal Open**: Scale + fade (200ms)
- **Word Highlight**: Subtle background color change (150ms)
- **Score Bar Fill**: Animated fill from 0 to target (800ms)

### Interactive States
- **Word Tap**: Background color flash + scale (100ms)
- **Button Press**: Opacity change + slight scale (100ms)
- **Modal Close**: Slide down + fade (200ms)

---

## Responsive Design

### Mobile Optimized
- Fits within 375px width (iPhone SE)
- Touch targets: minimum 44x44pt
- Scrollable content areas
- Safe area aware (notch/home indicator)

### Tablet Considerations
- Content can be displayed side-by-side if needed
- Larger modal for word details
- More space for longer explanations

---

## Accessibility

- High contrast colors (WCAG AA compliant)
- Clear typography hierarchy
- Touch targets large enough for all users
- No color-only information (uses text + icons)
- Semantic structure for screen readers

---

**Design Status**: ✅ Ready for Implementation
**Last Updated**: 2026-03-19
