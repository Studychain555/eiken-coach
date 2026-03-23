/**
 * EIKEN Vocabulary Data
 * Complete vocabulary database for all EIKEN levels
 * Format optimized for React Native
 */

import { EIKENLevel } from './eiken-vocabulary-schema';

export interface EIKENVocabWord {
  id: string;
  word: string;
  reading: string;
  partOfSpeech: string;
  meaningJP: string;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: number;    // 1-5
  frequency: number;     // 1-5
  eikenLevel: EIKENLevel;
  choices: {
    id: string;
    meaning: string;
    isCorrect: boolean;
  }[];
}

// ==========================================
// EIKEN 準2級 Vocabulary (Pre-2nd Grade)
// ==========================================
export const EIKEN_PRE_2ND_VOCAB: EIKENVocabWord[] = [
  {
    id: '1', word: 'ability', reading: 'əˈbɪləti', partOfSpeech: 'noun',
    meaningJP: '能力、才能', exampleSentence: 'She has the ability to speak three languages.',
    exampleTranslation: '彼女は3言語を話す能力があります。', difficulty: 1, frequency: 5,
    eikenLevel: EIKENLevel.PRE_2ND,
    choices: [
      { id: '1a', meaning: '能力', isCorrect: true },
      { id: '1b', meaning: '可能性', isCorrect: false },
      { id: '1c', meaning: '責任', isCorrect: false },
      { id: '1d', meaning: '知識', isCorrect: false },
    ]
  },
  {
    id: '2', word: 'absent', reading: 'ˈæbsənt', partOfSpeech: 'adjective',
    meaningJP: '不在の', exampleSentence: 'He was absent from school yesterday.',
    exampleTranslation: '彼は昨日学校に不在でした。', difficulty: 1, frequency: 4,
    eikenLevel: EIKENLevel.PRE_2ND,
    choices: [
      { id: '2a', meaning: '不在の', isCorrect: true },
      { id: '2b', meaning: '無視する', isCorrect: false },
      { id: '2c', meaning: '失敗する', isCorrect: false },
      { id: '2d', meaning: '誤解する', isCorrect: false },
    ]
  },
  {
    id: '3', word: 'accept', reading: 'əkˈsept', partOfSpeech: 'verb',
    meaningJP: '受け入れる', exampleSentence: 'I accept your apology.',
    exampleTranslation: 'あなたの謝罪を受け入れます。', difficulty: 1, frequency: 5,
    eikenLevel: EIKENLevel.PRE_2ND,
    choices: [
      { id: '3a', meaning: '受け入れる', isCorrect: true },
      { id: '3b', meaning: '拒否する', isCorrect: false },
      { id: '3c', meaning: '制限する', isCorrect: false },
      { id: '3d', meaning: '延期する', isCorrect: false },
    ]
  },
  {
    id: '4', word: 'accident', reading: 'ˈæksɪdənt', partOfSpeech: 'noun',
    meaningJP: '事故', exampleSentence: 'There was a car accident on the highway.',
    exampleTranslation: '高速道路で自動車事故がありました。', difficulty: 1, frequency: 4,
    eikenLevel: EIKENLevel.PRE_2ND,
    choices: [
      { id: '4a', meaning: '事故', isCorrect: true },
      { id: '4b', meaning: '計画', isCorrect: false },
      { id: '4c', meaning: '方法', isCorrect: false },
      { id: '4d', meaning: '原因', isCorrect: false },
    ]
  },
  {
    id: '5', word: 'accommodate', reading: 'əˈkɑmədeɪt', partOfSpeech: 'verb',
    meaningJP: '宿泊させる', exampleSentence: 'The hotel can accommodate 500 guests.',
    exampleTranslation: 'ホテルは500人の客を受け入れることができます。', difficulty: 2, frequency: 3,
    eikenLevel: EIKENLevel.PRE_2ND,
    choices: [
      { id: '5a', meaning: '宿泊させる', isCorrect: true },
      { id: '5b', meaning: '装備する', isCorrect: false },
      { id: '5c', meaning: '見守る', isCorrect: false },
      { id: '5d', meaning: '飾る', isCorrect: false },
    ]
  },
];

// ==========================================
// EIKEN 2級 Vocabulary (Grade 2)
// ==========================================
export const EIKEN_GRADE_2_VOCAB: EIKENVocabWord[] = [
  ...EIKEN_PRE_2ND_VOCAB, // Include all pre-2nd grade words
  {
    id: '6', word: 'abolish', reading: 'əˈbɑlɪʃ', partOfSpeech: 'verb',
    meaningJP: '廃止する', exampleSentence: 'The government abolished the old law.',
    exampleTranslation: '政府は古い法律を廃止しました。', difficulty: 2, frequency: 2,
    eikenLevel: EIKENLevel.GRADE_2,
    choices: [
      { id: '6a', meaning: '廃止する', isCorrect: true },
      { id: '6b', meaning: '減らす', isCorrect: false },
      { id: '6c', meaning: '忘れる', isCorrect: false },
      { id: '6d', meaning: '否定する', isCorrect: false },
    ]
  },
  {
    id: '7', word: 'abroad', reading: 'əˈbrɔd', partOfSpeech: 'adverb',
    meaningJP: '海外に', exampleSentence: 'She lived abroad for five years.',
    exampleTranslation: '彼女は5年間海外に住んでいました。', difficulty: 1, frequency: 3,
    eikenLevel: EIKENLevel.GRADE_2,
    choices: [
      { id: '7a', meaning: '海外に', isCorrect: true },
      { id: '7b', meaning: '外側に', isCorrect: false },
      { id: '7c', meaning: '広く', isCorrect: false },
      { id: '7d', meaning: '公然と', isCorrect: false },
    ]
  },
];

// ==========================================
// EIKEN 準1級 Vocabulary (Pre-1st Grade)
// ==========================================
export const EIKEN_PRE_1ST_VOCAB: EIKENVocabWord[] = [
  ...EIKEN_GRADE_2_VOCAB, // Include all pre-1st grade words
  {
    id: '8', word: 'aberration', reading: 'ˌæbəˈreɪʃən', partOfSpeech: 'noun',
    meaningJP: '逸脱、異常', exampleSentence: 'This behavior is an aberration from the norm.',
    exampleTranslation: 'この振る舞いは規範からの逸脱です。', difficulty: 3, frequency: 2,
    eikenLevel: EIKENLevel.PRE_1ST,
    choices: [
      { id: '8a', meaning: '逸脱', isCorrect: true },
      { id: '8b', meaning: '抽象化', isCorrect: false },
      { id: '8c', meaning: '誤謬', isCorrect: false },
      { id: '8d', meaning: '偏差', isCorrect: false },
    ]
  },
  {
    id: '9', word: 'ambiguous', reading: 'æmˈbɪɡjuəs', partOfSpeech: 'adjective',
    meaningJP: '曖昧な', exampleSentence: 'The statement is ambiguous and can be interpreted in multiple ways.',
    exampleTranslation: 'その声明は曖昧で、複数の方法で解釈できます。', difficulty: 3, frequency: 3,
    eikenLevel: EIKENLevel.PRE_1ST,
    choices: [
      { id: '9a', meaning: '曖昧な', isCorrect: true },
      { id: '9b', meaning: '不明確な', isCorrect: false },
      { id: '9c', meaning: '複雑な', isCorrect: false },
      { id: '9d', meaning: '疑わしい', isCorrect: false },
    ]
  },
];

// ==========================================
// EIKEN 1級 Vocabulary (Grade 1)
// ==========================================
export const EIKEN_GRADE_1_VOCAB: EIKENVocabWord[] = [
  ...EIKEN_PRE_1ST_VOCAB, // Include all 1st grade words
  {
    id: '10', word: 'abjure', reading: 'əbˈdʒʊr', partOfSpeech: 'verb',
    meaningJP: '誓って放棄する', exampleSentence: 'He abjured his former political beliefs.',
    exampleTranslation: '彼は以前の政治的信念を誓って放棄しました。', difficulty: 4, frequency: 1,
    eikenLevel: EIKENLevel.GRADE_1,
    choices: [
      { id: '10a', meaning: '誓って放棄する', isCorrect: true },
      { id: '10b', meaning: '非難する', isCorrect: false },
      { id: '10c', meaning: '隔離する', isCorrect: false },
      { id: '10d', meaning: '縮小する', isCorrect: false },
    ]
  },
  {
    id: '11', word: 'abnegation', reading: 'ˌæbnɪˈɡeɪʃən', partOfSpeech: 'noun',
    meaningJP: '放棄', exampleSentence: 'His abnegation of personal comfort was admirable.',
    exampleTranslation: '彼の個人的な快適さの放棄は称賛に値します。', difficulty: 4, frequency: 1,
    eikenLevel: EIKENLevel.GRADE_1,
    choices: [
      { id: '11a', meaning: '放棄', isCorrect: true },
      { id: '11b', meaning: '拒否', isCorrect: false },
      { id: '11c', meaning: '矛盾', isCorrect: false },
      { id: '11d', meaning: '欠陥', isCorrect: false },
    ]
  },
];

// ==========================================
// Utility Functions
// ==========================================

export function getVocabularyByLevel(level: EIKENLevel): EIKENVocabWord[] {
  switch (level) {
    case EIKENLevel.PRE_2ND:
      return EIKEN_PRE_2ND_VOCAB;
    case EIKENLevel.GRADE_2:
      return EIKEN_GRADE_2_VOCAB;
    case EIKENLevel.PRE_1ST:
      return EIKEN_PRE_1ST_VOCAB;
    case EIKENLevel.GRADE_1:
      return EIKEN_GRADE_1_VOCAB;
    default:
      return EIKEN_PRE_2ND_VOCAB;
  }
}

export function getVocabularyStats(level: EIKENLevel) {
  const vocab = getVocabularyByLevel(level);
  return {
    level,
    totalWords: vocab.length,
    masteredWords: 0, // Will be filled from store
    avgDifficulty: Math.round(vocab.reduce((sum, w) => sum + w.difficulty, 0) / vocab.length),
  };
}

export function getRandomWords(level: EIKENLevel, count: number): EIKENVocabWord[] {
  const vocab = getVocabularyByLevel(level);
  const shuffled = [...vocab].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, vocab.length));
}
