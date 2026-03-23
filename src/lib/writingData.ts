/**
 * 英検準1級 ライティング問題データ
 */

export interface WritingPrompt {
  id: string;
  topic: string;
  description: string;
  instructions: string;
  wordLimit: number;
  difficulty: number;
}

export const WRITING_SAMPLE_PROMPTS: WritingPrompt[] = [
  {
    id: '1',
    topic: 'Technology and Society',
    description: 'Discuss the impact of smartphones on modern society',
    instructions:
      'Write an essay explaining both positive and negative effects of smartphones on society. Support your opinion with examples.',
    wordLimit: 150,
    difficulty: 2,
  },
  {
    id: '2',
    topic: 'Environmental Protection',
    description: 'What should governments do to address climate change?',
    instructions:
      'Write an essay proposing concrete actions governments should take to combat climate change. Include at least two specific measures.',
    wordLimit: 150,
    difficulty: 3,
  },
  {
    id: '3',
    topic: 'Education and Career',
    description: 'Is university education necessary for success?',
    instructions:
      'Write an essay discussing whether a university degree is essential for career success in modern times. Provide examples to support your view.',
    wordLimit: 150,
    difficulty: 2,
  },
  {
    id: '4',
    topic: 'Work-Life Balance',
    description: 'Remote work has changed the modern workplace',
    instructions:
      'Discuss how remote work has changed workplace culture and employee satisfaction. What are the advantages and disadvantages?',
    wordLimit: 150,
    difficulty: 3,
  },
  {
    id: '5',
    topic: 'Cultural Exchange',
    description: 'The benefits of international student exchange programs',
    instructions:
      'Write an essay explaining why international student exchange programs are valuable. Include specific benefits for students and society.',
    wordLimit: 150,
    difficulty: 2,
  },
];

/**
 * ライティング採点結果の型
 */
export interface WritingScore {
  contentScore: number; // 0-4
  structureScore: number; // 0-4
  vocabularyScore: number; // 0-4
  grammarScore: number; // 0-4
  totalScore: number; // 0-16
  feedback: string;
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  modelAnswer: string;
}
