/**
 * 英検準1級 リスニング問題データ（サンプル）
 */

export interface ListeningQuestion {
  id: string;
  title: string;
  audioUrl: string; // 実際の音声ファイルURL
  script: string; // 完全なスクリプト
  choices: string[]; // 4択選択肢
  correctAnswer: number; // 正解のインデックス (0-3)
  difficulty: number; // 難易度 1-5
  explanation: string; // 解説
}

export const LISTENING_SAMPLE_DATA: ListeningQuestion[] = [
  {
    id: '1',
    title: '会話問題 1',
    audioUrl: 'https://example.com/audio/listening_1.mp3',
    script: `
Woman: Excuse me, do you work here at the bookstore?
Man: Yes, I do. Can I help you?
Woman: I'm looking for a book about environmental issues. Do you have anything like that?
Man: We have quite a few books on that topic. What level are you looking for? Academic or for general readers?
Woman: Something for general readers would be nice. I want something that explains the current situation clearly.
Man: I think we have just the right book for you. Let me check our system.
    `,
    choices: [
      '女性は環境問題についての学術的な本を探している',
      '女性は一般読者向けの環境問題についての本を探している',
      '男性は環境問題の専門家である',
      '本屋は環境問題の本を在庫していない',
    ],
    correctAnswer: 1,
    difficulty: 2,
    explanation:
      'スクリプトから、女性は "Something for general readers would be nice" と明確に述べており、学術的ではなく一般読者向けの本を探していることが分かります。',
  },
  {
    id: '2',
    title: '講演文 1',
    audioUrl: 'https://example.com/audio/listening_2.mp3',
    script: `
Today, I'd like to discuss the impact of remote work on corporate culture.
Over the past few years, many companies have shifted to hybrid or fully remote work models.
While this offers flexibility for employees, it also presents challenges to maintaining company culture.
Some companies report that communication between teams has become more difficult.
Others have found that remote work has improved work-life balance for their employees.
The key is to establish clear communication protocols and regular virtual team meetings.
    `,
    choices: [
      'リモートワークは企業文化に負の影響しかない',
      'すべての会社がリモートワークに完全に移行している',
      'リモートワークは利点と課題の両方を持っている',
      '企業文化を維持することはリモートワークの主な利点である',
    ],
    correctAnswer: 2,
    difficulty: 2,
    explanation:
      'スピーカーは "While this offers flexibility... it also presents challenges" と述べており、リモートワークが利点と課題の両方を持つことを明確に説明しています。',
  },
  {
    id: '3',
    title: '日常会話 1',
    audioUrl: 'https://example.com/audio/listening_3.mp3',
    script: `
A: Hi! Did you enjoy the concert last night?
B: Yes, it was amazing! The performance was incredible.
A: I heard the tickets were really hard to get.
B: They were! I was lucky to get one through a friend.
A: Which part did you enjoy the most?
B: The second half was especially good. The orchestra played beautifully.
    `,
    choices: [
      'Bはチケットを正規ルートで購入した',
      'Bはコンサートの前半が最も良かったと思った',
      'Bは友人経由でチケットを入手した',
      'Aはコンサートに参加した',
    ],
    correctAnswer: 2,
    difficulty: 1,
    explanation:
      'スクリプトで、B が "I was lucky to get one through a friend" と明確に述べており、友人経由でチケットを入手したことが分かります。',
  },
  {
    id: '4',
    title: '講演文 2',
    audioUrl: 'https://example.com/audio/listening_4.mp3',
    script: `
The digital transformation has revolutionized how businesses operate.
Cloud computing, artificial intelligence, and data analytics have become essential tools.
However, many organizations struggle with implementing these technologies effectively.
One major challenge is the lack of skilled professionals in these fields.
Another issue is the resistance to change from employees who are accustomed to traditional methods.
To address these challenges, companies need to invest in training and development programs.
They should also foster a culture that embraces innovation and continuous learning.
    `,
    choices: [
      'デジタル変革は簡単に実装できる',
      'すべての従業員が新しい技術を受け入れている',
      '企業が直面する課題には、スキル不足と変化への抵抗が含まれる',
      'クラウドコンピューティングは不要な技術である',
    ],
    correctAnswer: 2,
    difficulty: 3,
    explanation:
      'スピーカーは "One major challenge is the lack of skilled professionals" と "resistance to change from employees" の両方を課題として述べています。',
  },
  {
    id: '5',
    title: '会話問題 2',
    audioUrl: 'https://example.com/audio/listening_5.mp3',
    script: `
Student: Professor, I'm having trouble with the assignment. Could I come to your office hours?
Professor: Of course. I have office hours on Tuesday and Thursday from 2 to 4 PM.
Student: Thursday works better for me. Do I need to bring anything?
Professor: Just bring your work and any specific questions you have. We can go through it together.
Student: That sounds great. I'll see you on Thursday.
    `,
    choices: [
      '教授のオフィスアワーは月曜日と水曜日である',
      '学生は課題を終えており、確認が必要ない',
      '学生は木曜日に教授のオフィスを訪問する予定である',
      '教授は学生の質問に答えることができない',
    ],
    correctAnswer: 2,
    difficulty: 1,
    explanation:
      'スクリプトから、教授は "Thursday works better for you" と確認しており、学生が木曜日にオフィスを訪問する予定であることが明らかです。',
  },
];

/**
 * 4つのランダムな選択肢を生成（正解1 + 誤答3）
 */
export function generateMultipleChoices(correctAnswer: string, difficulty: number): string[] {
  // 実際のアプリでは、正解と同じレベルの難易度を持つ誤答を生成します
  const sampleWrongAnswers = [
    '別の可能性1',
    '別の可能性2',
    '別の可能性3',
    '別の可能性4',
    '別の可能性5',
  ];

  const selected = sampleWrongAnswers.slice(0, 3);
  const choices = [correctAnswer, ...selected].sort(() => Math.random() - 0.5);

  return choices;
}
