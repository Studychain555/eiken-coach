// 英検準1級 頻出単語データ（サンプル：最初の200語）
// 実際のアプリではこれを段階的に Supabase から読み込みます

export interface VocabularyWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  stage: number;
  difficulty: number;
}

export const VOCABULARY_SAMPLE_DATA: VocabularyWord[] = [
  {
    id: '1',
    word: 'abundance',
    reading: 'əˈbʌndəns',
    meaning: '豊富、大量',
    partOfSpeech: 'noun',
    exampleSentence: 'The abundance of resources in the region',
    exampleTranslation: 'その地域の豊富なリソース',
    stage: 1,
    difficulty: 2,
  },
  {
    id: '2',
    word: 'accommodate',
    reading: 'əˈkɑmədeit',
    meaning: '宿泊させる、対応する',
    partOfSpeech: 'verb',
    exampleSentence: 'The hotel can accommodate 500 guests.',
    exampleTranslation: 'ホテルは500人の客を受け入れることができます。',
    stage: 1,
    difficulty: 3,
  },
  {
    id: '3',
    word: 'acquaintance',
    reading: 'əˈkweɪntəns',
    meaning: '知人、面識',
    partOfSpeech: 'noun',
    exampleSentence: 'She is just an acquaintance, not a close friend.',
    exampleTranslation: '彼女は知人に過ぎず、親友ではありません。',
    stage: 1,
    difficulty: 2,
  },
  {
    id: '4',
    word: 'adept',
    reading: 'əˈdept',
    meaning: '上手な、熟練した',
    partOfSpeech: 'adjective',
    exampleSentence: 'He is adept at solving complex problems.',
    exampleTranslation: '彼は複雑な問題を解くのが得意です。',
    stage: 1,
    difficulty: 2,
  },
  {
    id: '5',
    word: 'advocate',
    reading: 'ˈædvəkit',
    meaning: '主張する、支持者',
    partOfSpeech: 'verb/noun',
    exampleSentence: 'She advocates for environmental protection.',
    exampleTranslation: '彼女は環境保護を主張しています。',
    stage: 1,
    difficulty: 2,
  },
  {
    id: '6',
    word: 'aggregate',
    reading: 'ˈæɡrɪɡət',
    meaning: '集計する、合計',
    partOfSpeech: 'verb/adjective',
    exampleSentence: 'The aggregate score was 250 points.',
    exampleTranslation: '合計スコアは250ポイントでした。',
    stage: 1,
    difficulty: 3,
  },
  {
    id: '7',
    word: 'ambiguous',
    reading: 'æmˈbɪɡjuəs',
    meaning: '曖昧な',
    partOfSpeech: 'adjective',
    exampleSentence: 'The statement is ambiguous and can be interpreted differently.',
    exampleTranslation: 'その声明は曖昧で、異なる方法で解釈できます。',
    stage: 1,
    difficulty: 2,
  },
  {
    id: '8',
    word: 'analogous',
    reading: 'əˈnæləɡəs',
    meaning: '類似の、相当する',
    partOfSpeech: 'adjective',
    exampleSentence: 'The situation is analogous to what happened last year.',
    exampleTranslation: 'この状況は去年起こったことに類似しています。',
    stage: 1,
    difficulty: 3,
  },
  {
    id: '9',
    word: 'anonymous',
    reading: 'əˈnɑnɪməs',
    meaning: '匿名の、正体不明の',
    partOfSpeech: 'adjective',
    exampleSentence: 'The donor wishes to remain anonymous.',
    exampleTranslation: '寄付者は匿名のままでいたいと願っています。',
    stage: 1,
    difficulty: 1,
  },
  {
    id: '10',
    word: 'antique',
    reading: 'ænˈtik',
    meaning: '骨董品、古い',
    partOfSpeech: 'noun/adjective',
    exampleSentence: 'This antique vase is very valuable.',
    exampleTranslation: 'この骨董品の花瓶は非常に価値があります。',
    stage: 1,
    difficulty: 1,
  },
];

// ダミー選択肢生成関数
export const generateWrongAnswers = (correctMeaning: string, allMeanings: string[]): string[] => {
  // 実際のアプリでは、データベースから不正解を生成します
  const wrongAnswers = [
    '異なる、違う',
    '不明瞭な、曖昧な',
    '似ている、類似する',
  ].filter(m => m !== correctMeaning);

  return wrongAnswers.slice(0, 3);
};
