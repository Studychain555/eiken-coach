/**
 * Analytics Engine for Teacher Dashboard
 * Provides data processing, calculations, and insights
 */

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface PerformanceTrend {
  date: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface StudentRanking {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  change: number; // rank change from previous period
}

export interface SkillGap {
  skillName: string;
  classAverage: number;
  studentScore: number;
  gap: number;
  recommendation: string;
}

export class AnalyticsEngine {
  /**
   * Calculate average score from array of scores
   */
  static calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  /**
   * Calculate median score
   */
  static calculateMedian(scores: number[]): number {
    if (scores.length === 0) return 0;
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate standard deviation
   */
  static calculateStdDev(scores: number[]): number {
    const avg = this.calculateAverage(scores);
    const variance = scores.reduce((sum, score) => {
      return sum + Math.pow(score - avg, 2);
    }, 0) / scores.length;
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  /**
   * Calculate score distribution
   */
  static getScoreDistribution(scores: number[]): ScoreDistribution[] {
    const ranges = [
      { range: '90-100', min: 90, max: 100 },
      { range: '80-89', min: 80, max: 89 },
      { range: '70-79', min: 70, max: 79 },
      { range: '60-69', min: 60, max: 69 },
      { range: '0-59', min: 0, max: 59 },
    ];

    return ranges.map((r) => {
      const count = scores.filter((s) => s >= r.min && s <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: Math.round((count / scores.length) * 100),
      };
    });
  }

  /**
   * Generate performance trend
   */
  static getPerformanceTrend(historicalScores: number[]): PerformanceTrend[] {
    return historicalScores.map((score, index) => {
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (index > 0) {
        const diff = score - historicalScores[index - 1];
        if (diff > 5) trend = 'up';
        else if (diff < -5) trend = 'down';
      }

      return {
        date: new Date(Date.now() - (historicalScores.length - index - 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        score,
        trend,
      };
    });
  }

  /**
   * Create student ranking
   */
  static rankStudents(students: Array<{ id: string; name: string; score: number }>): StudentRanking[] {
    const sorted = [...students].sort((a, b) => b.score - a.score);

    return sorted.map((student, index) => ({
      rank: index + 1,
      studentId: student.id,
      studentName: student.name,
      score: student.score,
      change: 0, // TODO: Calculate from previous rankings
    }));
  }

  /**
   * Identify skill gaps
   */
  static identifySkillGaps(
    classAverage: number,
    studentScore: number,
    skillName: string
  ): SkillGap {
    const gap = classAverage - studentScore;
    let recommendation = '';

    if (gap > 15) {
      recommendation = `${skillName}の学習時間を週3日以上確保してください。`;
    } else if (gap > 5) {
      recommendation = `${skillName}を強化するため、練習問題の反復をお勧めします。`;
    } else if (gap < -10) {
      recommendation = `${skillName}が得意です。発展的な問題にチャレンジしてみてください。`;
    } else {
      recommendation = `${skillName}の学習が順調に進んでいます。`;
    }

    return {
      skillName,
      classAverage,
      studentScore,
      gap,
      recommendation,
    };
  }

  /**
   * Calculate mastery percentage for vocabulary
   */
  static calculateMasteryPercentage(masteredWords: number, totalWords: number): number {
    if (totalWords === 0) return 0;
    return Math.round((masteredWords / totalWords) * 100);
  }

  /**
   * Generate learning recommendations
   */
  static generateRecommendations(studentData: {
    listeningAccuracy: number;
    vocabularyProgress: number;
    writingScore: number;
    studyHours: number;
  }): string[] {
    const recommendations: string[] = [];

    if (studentData.listeningAccuracy < 60) {
      recommendations.push('リスニングが課題です。毎日15分以上の練習をお勧めします。');
    }

    if (studentData.vocabularyProgress < 50) {
      recommendations.push('単語学習の進捗が遅れています。単語帳の使用を検討してください。');
    }

    if (studentData.writingScore < 65) {
      recommendations.push('ライティング力の向上が必要です。定期的なフィードバック指導をお勧めします。');
    }

    if (studentData.studyHours < 5) {
      recommendations.push('週間学習時間が不足しています。学習計画の見直しをご検討ください。');
    }

    if (recommendations.length === 0) {
      recommendations.push('学習が順調に進んでいます。現在のペースを維持してください。');
    }

    return recommendations;
  }

  /**
   * Calculate learning velocity (improvement rate)
   */
  static calculateLearningVelocity(scores: number[]): number {
    if (scores.length < 2) return 0;

    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const avgFirstHalf = this.calculateAverage(firstHalf);
    const avgSecondHalf = this.calculateAverage(secondHalf);

    return Math.round((avgSecondHalf - avgFirstHalf) * 100) / 100;
  }

  /**
   * Identify at-risk students
   */
  static identifyAtRiskStudents(
    students: Array<{ id: string; name: string; score: number; studyHours: number }>
  ): Array<{ studentId: string; studentName: string; reason: string; priority: 'high' | 'medium' }> {
    return students
      .filter((s) => s.score < 60 || s.studyHours < 3)
      .map((s) => ({
        studentId: s.id,
        studentName: s.name,
        reason:
          s.score < 60 && s.studyHours < 3
            ? 'スコア低、学習時間不足'
            : s.score < 60
              ? 'スコアが低下'
              : '学習時間不足',
        priority: s.score < 40 || s.studyHours < 1 ? 'high' : 'medium',
      }));
  }

  /**
   * Calculate class engagement rate
   */
  static calculateEngagementRate(students: Array<{ studyHours: number }>): number {
    const activeStudents = students.filter((s) => s.studyHours > 0).length;
    return Math.round((activeStudents / students.length) * 100);
  }

  /**
   * Format data for chart display
   */
  static formatChartData(
    labels: string[],
    datasets: Array<{ label: string; data: number[]; color: string }>
  ): any {
    return {
      labels,
      datasets: datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        fill: false,
        backgroundColor: ds.color,
        borderColor: ds.color,
        tension: 0.4,
      })),
    };
  }

  /**
   * Calculate weekly study statistics
   */
  static calculateWeeklyStats(dailyData: Record<string, number>): {
    totalMinutes: number;
    averagePerDay: number;
    mostActiveDay: string;
  } {
    const minutes = Object.values(dailyData);
    const totalMinutes = minutes.reduce((a, b) => a + b, 0);
    const averagePerDay = Math.round(totalMinutes / minutes.length);

    let mostActiveDay = 'Mon';
    let maxMinutes = 0;
    Object.entries(dailyData).forEach(([day, mins]) => {
      if (mins > maxMinutes) {
        maxMinutes = mins;
        mostActiveDay = day;
      }
    });

    return {
      totalMinutes,
      averagePerDay,
      mostActiveDay,
    };
  }

  /**
   * Export analytics summary as JSON
   */
  static generateAnalyticsSummary(classStats: {
    totalStudents: number;
    averageScore: number;
    averageProgressRate: number;
    totalStudyMinutes: number;
  }): object {
    return {
      summary: {
        classSize: classStats.totalStudents,
        overallScore: classStats.averageScore,
        progressRate: classStats.averageProgressRate + '%',
        totalStudyTime: Math.round(classStats.totalStudyMinutes / 60) + 'h',
        generatedAt: new Date().toISOString(),
      },
      healthScore: this.calculateClassHealthScore(classStats),
    };
  }

  /**
   * Calculate overall class health score
   */
  private static calculateClassHealthScore(classStats: {
    totalStudents: number;
    averageScore: number;
    averageProgressRate: number;
    totalStudyMinutes: number;
  }): number {
    const scoreWeight = classStats.averageScore / 100;
    const progressWeight = classStats.averageProgressRate / 100;
    const engagementWeight = Math.min(classStats.totalStudyMinutes / 10000, 1);

    return Math.round((scoreWeight * 40 + progressWeight * 35 + engagementWeight * 25) * 100) / 100;
  }
}
