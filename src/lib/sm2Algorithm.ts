/**
 * SM-2 Algorithm Implementation
 * 間隔反復学習アルゴリズム
 */

export interface SM2State {
  interval: number; // 日数
  easeFactor: number; // 難易度係数（1.3以上）
  repetitions: number; // 繰り返し回数
}

export interface SM2Result {
  nextReviewDate: Date;
  newState: SM2State;
  isMastered: boolean; // 3回連続正解で修得
}

const DEFAULT_EASE_FACTOR = 2.5; // デフォルト難易度係数
const INITIAL_INTERVAL = 1; // 初期間隔（日）

/**
 * SM-2 アルゴリズムで次の復習日を計算
 * @param isCorrect 正解したかどうか
 * @param quality フィードバック品質 (0-5, 5=完全正解)
 * @param state 現在のSM2状態
 * @returns 次の復習日と新しい状態
 */
export function calculateSM2(
  isCorrect: boolean,
  quality: number = 5, // デフォルトは完全正解
  state: SM2State = {
    interval: 1,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
  }
): SM2Result {
  let newState = { ...state };
  let nextReviewDate = new Date();
  let isMastered = false;

  if (isCorrect) {
    // 正解時
    newState.repetitions += 1;

    // 難易度係数を更新
    newState.easeFactor = Math.max(
      1.3,
      newState.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );

    // 復習間隔を計算
    if (newState.repetitions === 1) {
      newState.interval = 1; // 1日後
    } else if (newState.repetitions === 2) {
      newState.interval = 3; // 3日後
    } else {
      newState.interval = Math.round(newState.interval * newState.easeFactor);
    }

    // 3回連続正解で修得
    if (newState.repetitions >= 3) {
      isMastered = true;
    }
  } else {
    // 不正解時
    newState.repetitions = 0; // リセット
    newState.interval = 1; // 明日から復習
    newState.easeFactor = Math.max(1.3, newState.easeFactor - 0.2);
  }

  // 次の復習日を計算
  nextReviewDate.setDate(nextReviewDate.getDate() + newState.interval);

  return {
    nextReviewDate,
    newState,
    isMastered,
  };
}

/**
 * 復習対象の単語を決定
 * @param progress 単語の進捗情報配列
 * @returns 復習対象の単語IDのリスト
 */
export function selectWordsForReview(
  progress: Array<{
    wordId: string;
    nextReviewAt: Date | null;
    isMastered: boolean;
  }>
): string[] {
  const now = new Date();
  return progress
    .filter(p => {
      // 修得していない かつ （次の復習日が過去 または 未設定）
      return !p.isMastered && (!p.nextReviewAt || new Date(p.nextReviewAt) <= now);
    })
    .map(p => p.wordId)
    .slice(0, 10); // 一度に10個までの復習対象を返す
}
