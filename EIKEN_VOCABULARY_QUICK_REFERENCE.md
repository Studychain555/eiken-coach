# 🎓 EIKEN Vocabulary - Quick Reference Guide

## 📚 EIKEN Levels at a Glance

| Level | Label | 難度 | 単語数 | 目安 | 色 |
|-------|-------|------|--------|------|-----|
| **準2級** | Pre-2nd Grade | 🌱 | 800-1,000 | 高校初級 | 🟢 |
| **2級** | 2nd Grade | 🌿 | 1,500-2,000 | 高校中級 | 🔵 |
| **準1級** | Pre-1st Grade | 🌳 | 2,500-3,500 | 高校上級 | 🟠 |
| **1級** | 1st Grade | 🏔️ | 3,500-5,000+ | 大学/大学院 | 🔴 |

---

## 🚀 Getting Started

### For Users
```
1. Open EigoMaster app
2. Tap "英単語" (Vocabulary) tab
3. Select your EIKEN level
4. Choose a stage/unit
5. Answer questions & earn XP!
```

### For Developers
```typescript
// Import the vocabulary store
import { useEIKENVocabStore } from '@/src/stores/eikenVocabularyStore';
import { EIKENLevel } from '@/src/lib/eiken-vocabulary-schema';

function MyComponent() {
  const { selectedLevel, setSelectedLevel, selectAnswer } = useEIKENVocabStore();

  // Change level
  setSelectedLevel(EIKENLevel.GRADE_2);

  // Record answer
  const { isCorrect } = selectAnswer('choice-id');
}
```

---

## 📊 File Locations

### Core Files
```
src/lib/
├── eiken-vocabulary-schema.ts     # TypeScript interfaces
└── eiken-vocabulary-data.ts       # Complete vocabulary DB

src/stores/
└── eikenVocabularyStore.ts        # Zustand state management

src/components/
└── EIKENLevelSelector.tsx         # Level selection UI

app/(tabs)/
└── vocabulary.tsx                 # Main vocabulary screen
```

### Data Files
```
data/
├── vocabulary_comprehensive/      # CSV exports
│   ├── pre_2nd_vocabulary.csv
│   ├── 2nd_vocabulary.csv
│   ├── pre_1st_vocabulary.csv
│   └── 1st_vocabulary.csv
├── vocabulary_json/               # JSON for import
│   ├── pre_2nd_vocabulary.json
│   ├── 2nd_vocabulary.json
│   ├── pre_1st_vocabulary.json
│   └── 1st_vocabulary.json
└── audio_metadata/                # Audio URLs
    ├── pre_2nd_audio_metadata.csv
    ├── 2nd_audio_metadata.csv
    ├── pre_1st_audio_metadata.csv
    └── 1st_audio_metadata.csv
```

### Scripts
```
scripts/
├── generate_eiken_vocabulary.py            # Initial generation
├── generate_comprehensive_eiken_vocabulary.py
├── prepare_audio_metadata.py               # Audio setup
└── import_vocabulary_to_supabase.py        # Database import
```

---

## 💾 Data Structure

### Vocabulary Word
```typescript
interface EIKENVocabWord {
  id: string;                      // UUID
  word: string;                    // "ability"
  reading: string;                 // "əˈbɪləti"
  partOfSpeech: string;            // "noun"
  meaningJP: string;               // "能力"
  exampleSentence: string;         // "She has the ability..."
  exampleTranslation: string;      // "彼女は能力があります"
  difficulty: 1-5;                 // 1 = easy, 5 = hard
  frequency: 1-5;                  // 1 = rare, 5 = very common
  eikenLevel: EIKENLevel;          // PRE_2ND, GRADE_2, etc.
  choices: Array<{
    id: string;
    meaning: string;               // Japanese choice
    isCorrect: boolean;            // True for correct answer
  }>;
}
```

### Store State
```typescript
interface EIKENVocabState {
  // Selection
  selectedLevel: EIKENLevel;
  setSelectedLevel: (level: EIKENLevel) => void;

  // Data
  currentWords: EIKENVocabWord[];
  loadWordsForLevel: (level: EIKENLevel) => void;

  // Test
  currentWordIndex: number;
  currentWord: EIKENVocabWord | null;
  currentChoices: Array<...>;
  moveToNextWord: () => boolean;

  // Progress
  progress: Record<string, EIKENVocabProgress>;
  selectAnswer: (choiceId: string) => { isCorrect: boolean };

  // Stats
  getTodayStats: () => { attempted, correct, accuracy, masteredCount };

  // Gamification
  totalXPToday: number;
  comboCount: number;
  addXP: (amount: number) => void;
}
```

---

## 🎮 Common Tasks

### Add a New Word
```typescript
// In eiken-vocabulary-data.ts
export const EIKEN_GRADE_2_VOCAB: EIKENVocabWord[] = [
  ...EIKEN_PRE_2ND_VOCAB, // Include previous level
  {
    id: 'new-id',
    word: 'fluent',
    reading: 'ˈfluːənt',
    partOfSpeech: 'adjective',
    meaningJP: '流暢な',
    exampleSentence: 'She is fluent in English.',
    exampleTranslation: '彼女は英語が流暢です。',
    difficulty: 2,
    frequency: 4,
    eikenLevel: EIKENLevel.GRADE_2,
    choices: [
      { id: '1', meaning: '流暢な', isCorrect: true },
      { id: '2', meaning: '多数の', isCorrect: false },
      { id: '3', meaning: '明白な', isCorrect: false },
      { id: '4', meaning: '柔軟な', isCorrect: false },
    ]
  },
];
```

### Get Vocabulary for a Level
```typescript
import { getVocabularyByLevel } from '@/src/lib/eiken-vocabulary-data';
import { EIKENLevel } from '@/src/lib/eiken-vocabulary-schema';

const words = getVocabularyByLevel(EIKENLevel.GRADE_2);
console.log(`Level 2 has ${words.length} words`);
```

### Get Random Words
```typescript
import { getRandomWords } from '@/src/lib/eiken-vocabulary-data';

const randomWords = getRandomWords(EIKENLevel.PRE_1ST, 5);
// Returns 5 random words from Pre-1st grade
```

### Process an Answer
```typescript
const store = useEIKENVocabStore();
const { isCorrect } = store.selectAnswer('choice-id-123');

if (isCorrect) {
  console.log('✅ Correct!');
} else {
  console.log('❌ Wrong! Try again.');
}
```

### Track Progress
```typescript
const { progress, getTodayStats } = useEIKENVocabStore();

const stats = getTodayStats();
console.log(`Accuracy: ${stats.accuracy}%`);
console.log(`Mastered: ${stats.masteredCount} words`);
```

---

## 🎯 Import/Export

### Export as CSV
```bash
python3 scripts/generate_comprehensive_eiken_vocabulary.py
# Creates: data/vocabulary_comprehensive/*_vocabulary.csv
```

### Export as JSON
```bash
python3 scripts/import_vocabulary_to_supabase.py
# Creates: data/vocabulary_json/*_vocabulary.json
```

### Import to Supabase
```bash
export SUPABASE_URL=your-url
export SUPABASE_SERVICE_ROLE_KEY=your-key
python3 scripts/import_vocabulary_to_supabase.py
```

---

## 🔊 Audio Integration

### Setup Audio Provider
```bash
# Google TTS (recommended)
export GOOGLE_CLOUD_KEY_FILE=/path/to/key.json

# Then generate audio
python3 scripts/generate_audio_for_vocabulary.py
```

### Play Audio in Component
```typescript
import { Audio } from 'expo-av';

const playAudio = async (audioUrl: string) => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    await sound.playAsync();
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
};
```

---

## 📱 UI Components

### EIKENLevelSelector
```typescript
import { EIKENLevelSelector } from '@/src/components/EIKENLevelSelector';

<EIKENLevelSelector
  selectedLevel={EIKENLevel.GRADE_2}
  onLevelSelect={(level) => console.log('Selected:', level)}
/>
```

### Updated Vocabulary Screen
```typescript
// app/(tabs)/vocabulary.tsx
// Automatically includes level selection
// Just use as normal
```

---

## 🧪 Testing

### Test Level Selection
```typescript
it('should change vocabulary level', () => {
  const { selectedLevel, setSelectedLevel } = renderHook(() => useEIKENVocabStore());
  setSelectedLevel(EIKENLevel.GRADE_1);
  expect(selectedLevel).toBe(EIKENLevel.GRADE_1);
});
```

### Test Answer Processing
```typescript
it('should record correct answer', () => {
  const { selectAnswer } = renderHook(() => useEIKENVocabStore());
  const { isCorrect } = selectAnswer('correct-choice-id');
  expect(isCorrect).toBe(true);
});
```

### Test Progress Calculation
```typescript
it('should calculate accuracy', () => {
  const { getTodayStats } = renderHook(() => useEIKENVocabStore());
  const { accuracy } = getTodayStats();
  expect(accuracy).toBeGreaterThanOrEqual(0);
  expect(accuracy).toBeLessThanOrEqual(100);
});
```

---

## 🚨 Debugging

### Check Current Level
```typescript
const { selectedLevel } = useEIKENVocabStore();
console.log('Current level:', selectedLevel);
```

### Check Loaded Words
```typescript
const { currentWords } = useEIKENVocabStore();
console.log(`Loaded ${currentWords.length} words`);
currentWords.forEach(w => console.log(w.word));
```

### Check Progress
```typescript
const { progress, getTodayStats } = useEIKENVocabStore();
console.log('Raw progress:', progress);
console.log('Today stats:', getTodayStats());
```

### Enable Debug Logging
```typescript
// In store initialization
const store = useEIKENVocabStore();
store.subscribe((state) => {
  console.log('State updated:', state);
});
```

---

## 📞 Common Questions

**Q: How do I add more words?**
A: Edit `src/lib/eiken-vocabulary-data.ts` and add to the appropriate level array.

**Q: Can I change the difficulty of a word?**
A: Yes, modify the `difficulty` field (1-5) in the word object.

**Q: How are choices shuffled?**
A: Automatically shuffled in `setCurrentWord()` method of the store.

**Q: Can I disable a level?**
A: Remove it from the `LevelEmojis` and `LevelColors` maps in `EIKENLevelSelector.tsx`.

**Q: How do I reset user progress?**
A: Call `resetProgress()` in the store, or clear AsyncStorage directly.

**Q: Is audio required?**
A: No, it's optional. If no audio URL, pronunciation shows in IPA format.

---

## 🔗 Related Documentation

- **Full Implementation**: See `EIKEN_VOCABULARY_IMPLEMENTATION.md`
- **Audio Setup**: See `AUDIO_INTEGRATION_GUIDE.md`
- **Schema Details**: See `src/lib/eiken-vocabulary-schema.ts`
- **Store Code**: See `src/stores/eikenVocabularyStore.ts`

---

**Last Updated**: 2026-03-20
**Status**: ✅ Production Ready
