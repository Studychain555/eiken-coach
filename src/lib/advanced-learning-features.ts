/**
 * Advanced Learning Features for EIKEN Vocabulary
 * - Mnemonics and memory aids
 * - Etymology and word families
 * - Adaptive difficulty (SM2+ algorithm)
 * - Learning pattern analysis
 */

export interface Mnemonic {
  technique: 'rhyme' | 'association' | 'story' | 'visual' | 'acronym';
  description: string;
  example: string;
  effectiveness: number; // 1-5, how effective this mnemonic usually is
}

export interface Etymology {
  origin: string;
  rootMeaning: string;
  relatedWords: string[];
  historicalContext?: string;
}

export interface WordFamily {
  root: string;
  forms: {
    word: string;
    partOfSpeech: string;
    meaning: string;
  }[];
}

export interface LearningMetrics {
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  averageResponseTime: number;
  masteryLevel: number; // 0-100
  lastReviewDate: Date;
  nextReviewDate: Date;
  difficulty: number; // 1-5
  stability: number; // How stable the memory is (0-1)
  retrievability: number; // Current retrieval success probability (0-1)
}

/**
 * Mnemonics Database
 */
const MNEMONICS_DB: Record<string, Mnemonic[]> = {
  'abandon': [
    {
      technique: 'association',
      description: 'Think of "A band on" - like a band that left the stage',
      example: 'A BAND ON stage, then they abandoned it',
      effectiveness: 4,
    },
    {
      technique: 'story',
      description: 'A pirate band abandoned their ship',
      example: 'The pirate band abandoned the treasure map',
      effectiveness: 3,
    },
  ],
  'ability': [
    {
      technique: 'acronym',
      description: '"Able + Bility" = having the power to do',
      example: 'To be ABLE is an ABILITY',
      effectiveness: 4,
    },
    {
      technique: 'visual',
      description: 'Picture someone flexing muscles - showing ability',
      example: 'Strong muscles = ability',
      effectiveness: 3,
    },
  ],
  'absolute': [
    {
      technique: 'etymology',
      description: 'Ab- (away) + solute (loosened) = not bound',
      example: 'ABSOLUTE freedom means no one can bind you',
      effectiveness: 5,
    },
  ],
  'acceptable': [
    {
      technique: 'association',
      description: 'Accept + able = can be accepted',
      example: 'Behavior that is ACCEPT-ABLE',
      effectiveness: 4,
    },
  ],
};

/**
 * Etymology Database
 */
const ETYMOLOGY_DB: Record<string, Etymology> = {
  'abandon': {
    origin: 'Old French "abandoner"',
    rootMeaning: 'to surrender, leave behind',
    relatedWords: ['band', 'banish'],
    historicalContext: 'From "à" (to) + "bandon" (power, control)',
  },
  'ability': {
    origin: 'Old French "abilité"',
    rootMeaning: 'power to do something',
    relatedWords: ['able', 'unable', 'capability'],
    historicalContext: 'From Latin "habilis" (easily handled)',
  },
  'absolute': {
    origin: 'Latin "absolutus"',
    rootMeaning: 'completed, unconditional',
    relatedWords: ['absolve', 'solution', 'solve'],
    historicalContext: 'From "absolvere" (to set free)',
  },
  'accept': {
    origin: 'Latin "acceptare"',
    rootMeaning: 'to receive willingly',
    relatedWords: ['acceptable', 'acceptance', 'except'],
    historicalContext: 'From "accipere" (to take, receive)',
  },
};

/**
 * Word Family Database
 */
const WORD_FAMILY_DB: Record<string, WordFamily> = {
  'accept': {
    root: 'cept/capt (take, hold)',
    forms: [
      { word: 'accept', partOfSpeech: 'verb', meaning: 'to receive' },
      { word: 'except', partOfSpeech: 'verb', meaning: 'to exclude' },
      { word: 'acceptable', partOfSpeech: 'adjective', meaning: 'able to be accepted' },
      { word: 'acceptance', partOfSpeech: 'noun', meaning: 'act of accepting' },
      { word: 'exception', partOfSpeech: 'noun', meaning: 'something excluded' },
      { word: 'reception', partOfSpeech: 'noun', meaning: 'act of receiving' },
    ],
  },
  'abandon': {
    root: 'band (control, power)',
    forms: [
      { word: 'abandon', partOfSpeech: 'verb', meaning: 'to leave behind' },
      { word: 'abandoned', partOfSpeech: 'adjective', meaning: 'left behind, wild' },
      { word: 'bandit', partOfSpeech: 'noun', meaning: 'outlaw' },
      { word: 'band', partOfSpeech: 'noun', meaning: 'group' },
    ],
  },
};

/**
 * SM2+ Algorithm for Spaced Repetition
 * Enhanced SM2 with adaptive difficulty adjustment
 */
export class AdaptiveSM2Algorithm {
  private readonly defaultFactor = 2.5;
  private readonly minFactor = 1.3;
  private readonly maxFactor = 2.5;

  /**
   * Calculate next review interval (in days)
   */
  calculateNextInterval(
    attempt: number,
    quality: number, // 0-5, user's answer quality
    lastEF: number = this.defaultFactor,
    previousInterval: number = 0
  ): {
    interval: number;
    ef: number;
    difficulty: number;
  } {
    let nextInterval: number;
    let nextEF: number;
    let difficulty: number;

    if (attempt === 1) {
      // First attempt
      nextInterval = 1;
    } else if (attempt === 2) {
      // Second attempt
      nextInterval = 3;
    } else {
      // Subsequent attempts
      nextInterval = Math.round(previousInterval * lastEF);
    }

    // Calculate new EF (Easiness Factor)
    nextEF = Math.max(
      this.minFactor,
      lastEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    nextEF = Math.min(nextEF, this.maxFactor);

    // Calculate difficulty (1-5)
    // Inversely related to how easy the word is
    difficulty = Math.max(1, Math.round(6 - nextEF));

    return {
      interval: Math.max(1, nextInterval),
      ef: nextEF,
      difficulty,
    };
  }

  /**
   * Predict next retrieval success probability
   * Using Leitner system + SM2 hybrid
   */
  predictRetrievability(
    daysSinceReview: number,
    stability: number,
    difficulty: number
  ): number {
    // Exponential decay based on days since review
    const decayFactor = Math.exp(-daysSinceReview / (stability + 1));

    // Adjust by difficulty
    const difficultyFactor = (5 - difficulty) / 5;

    return Math.max(0, Math.min(1, decayFactor * (0.5 + difficultyFactor * 0.5)));
  }
}

/**
 * Learning Pattern Analyzer
 */
export class LearningPatternAnalyzer {
  /**
   * Analyze user's learning patterns
   */
  analyzeLearningPattern(metrics: LearningMetrics[]): {
    strengths: string[];
    weaknesses: string[];
    recommendedFocus: string[];
    studyHabit: string;
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendedFocus: string[] = [];

    // Analyze overall accuracy
    const overallAccuracy = metrics.reduce((acc, m) => acc + m.masteryLevel, 0) / metrics.length;

    if (overallAccuracy > 80) {
      strengths.push('高い正答率');
    } else if (overallAccuracy < 50) {
      weaknesses.push('基礎の理解が必要');
      recommendedFocus.push('基本的な単語から復習');
    }

    // Analyze response time
    const avgResponseTime = metrics.reduce((acc, m) => acc + m.averageResponseTime, 0) / metrics.length;
    if (avgResponseTime < 3000) {
      strengths.push('素早い反応');
    } else {
      weaknesses.push('思い出しに時間がかかる');
      recommendedFocus.push('ニーモニック技法を活用');
    }

    // Determine study habit
    let studyHabit = '一貫性のある学習';
    const recentMetrics = metrics.slice(-7);
    const recentAvg = recentMetrics.reduce((acc, m) => acc + m.correctCount, 0) / recentMetrics.length;
    if (recentAvg > overallAccuracy) {
      studyHabit = '継続的な改善';
    } else if (recentAvg < overallAccuracy * 0.8) {
      studyHabit = '最近学習が停滞気味';
      recommendedFocus.push('短期集中復習をお勧めします');
    }

    return {
      strengths,
      weaknesses,
      recommendedFocus,
      studyHabit,
    };
  }

  /**
   * Recommend study schedule
   */
  recommendStudySchedule(metrics: LearningMetrics[]): {
    dailyTarget: number;
    focusAreas: string[];
    reviewSchedule: Array<{ day: string; count: number }>;
  } {
    const dailyTarget = Math.max(10, Math.min(50, Math.round(metrics.length / 10)));

    // Identify weak areas
    const weakAreas = metrics
      .filter(m => m.masteryLevel < 70)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 5)
      .map((_, i) => `弱点${i + 1}`);

    // Create 7-day review schedule
    const reviewSchedule = [];
    for (let i = 0; i < 7; i++) {
      const day = ['月', '火', '水', '木', '金', '土', '日'][i];
      const count = Math.round(dailyTarget + (Math.random() - 0.5) * 10);
      reviewSchedule.push({ day, count });
    }

    return {
      dailyTarget,
      focusAreas: weakAreas,
      reviewSchedule,
    };
  }
}

/**
 * Get mnemonics for a word
 */
export function getMnemonics(word: string): Mnemonic[] {
  return MNEMONICS_DB[word.toLowerCase()] || [];
}

/**
 * Get etymology for a word
 */
export function getEtymology(word: string): Etymology | null {
  return ETYMOLOGY_DB[word.toLowerCase()] || null;
}

/**
 * Get word family for a word
 */
export function getWordFamily(word: string): WordFamily | null {
  return WORD_FAMILY_DB[word.toLowerCase()] || null;
}

/**
 * Create default learning metrics
 */
export function createDefaultMetrics(): LearningMetrics {
  const now = new Date();
  return {
    totalAttempts: 0,
    correctCount: 0,
    incorrectCount: 0,
    averageResponseTime: 0,
    masteryLevel: 0,
    lastReviewDate: now,
    nextReviewDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    difficulty: 3,
    stability: 1,
    retrievability: 0,
  };
}

export default {
  getMnemonics,
  getEtymology,
  getWordFamily,
  AdaptiveSM2Algorithm,
  LearningPatternAnalyzer,
};
