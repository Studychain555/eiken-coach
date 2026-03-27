/**
 * スキーマバリデーション
 *
 * 機能:
 * - API レスポンスのバリデーション
 * - 予期しないデータ型の検出
 * - スキーマ違反時の詳細ログ
 */

import { z, ZodSchema, ZodError } from 'zod';
import { globalErrorHandler } from './globalErrorHandler';
import { ErrorType } from './errorHandler';
import { debugError } from './debugUtils';

/**
 * レスポンススキーマ定義
 */
export const schemas = {
  // リスニング問題
  listeningQuestion: z.object({
    id: z.string().uuid(),
    text: z.string().min(1),
    audioUrl: z.string().url(),
    options: z.array(z.string()).min(2).max(4),
    correctAnswerIndex: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    createdAt: z.string().datetime().optional(),
  }),

  listeningQuestions: z.array(
    z.object({
      id: z.string().uuid(),
      text: z.string().min(1),
      audioUrl: z.string().url(),
      options: z.array(z.string()).min(2).max(4),
      correctAnswerIndex: z.number().int().min(0).max(3),
      explanation: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      createdAt: z.string().datetime().optional(),
    })
  ),

  // ユーザープログレス
  userProgress: z.object({
    userId: z.string().uuid(),
    questionId: z.string().uuid(),
    answered: z.boolean(),
    correct: z.boolean(),
    answeredAt: z.string().datetime(),
    duration: z.number().int().optional(),
  }),

  userProgressList: z.array(
    z.object({
      userId: z.string().uuid(),
      questionId: z.string().uuid(),
      answered: z.boolean(),
      correct: z.boolean(),
      answeredAt: z.string().datetime(),
      duration: z.number().int().optional(),
    })
  ),

  // スコア情報
  listeningScore: z.object({
    userId: z.string().uuid(),
    totalCorrect: z.number().int().min(0),
    totalAttempts: z.number().int().min(0),
    accuracy: z.number().min(0).max(100),
    lastAttemptDate: z.string().datetime().optional(),
  }),

  // ユーザープロフィール
  userProfile: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    displayName: z.string().min(1).max(100),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    lastLoginAt: z.string().datetime().optional(),
  }),

  // 単語
  vocabularyWord: z.object({
    id: z.string().uuid(),
    text: z.string().min(1),
    pronunciation: z.string(),
    meaning: z.string(),
    exampleSentence: z.string().optional(),
    stage: z.number().int().min(1),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),

  vocabularyWords: z.array(
    z.object({
      id: z.string().uuid(),
      text: z.string().min(1),
      pronunciation: z.string(),
      meaning: z.string(),
      exampleSentence: z.string().optional(),
      stage: z.number().int().min(1),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    })
  ),

  // ライティング課題
  writingTask: z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string(),
    maxWords: z.number().int().min(10),
    minWords: z.number().int().min(10),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  }),
};

/**
 * バリデーション関数
 */
export async function validateResponse<T>(
  data: any,
  schema: ZodSchema
): Promise<T> {
  try {
    return schema.parse(data) as T;
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));

      debugError('ValidationError', 'Schema validation failed', {
        errors,
        dataType: typeof data,
        dataKeys: Object.keys(data || {}),
      });

      globalErrorHandler.registerError(
        {
          type: ErrorType.VALIDATION,
          message: `スキーマバリデーション失敗: ${err.errors[0].message}`,
          originalError: err as any,
          timestamp: new Date(),
        },
        undefined,
        {
          errors,
          schema: schema.toString(),
        }
      );

      throw err;
    }

    throw err;
  }
}

/**
 * リスト形式のレスポンスをバリデーション
 */
export async function validateListResponse<T>(
  data: any,
  itemSchema: ZodSchema
): Promise<T[]> {
  try {
    if (!Array.isArray(data)) {
      throw new Error('Expected array response');
    }

    return z.array(itemSchema).parse(data) as T[];
  } catch (err) {
    debugError('ValidationError', 'List validation failed', {
      error: err instanceof Error ? err.message : String(err),
      itemCount: Array.isArray(data) ? data.length : 'N/A',
    });

    globalErrorHandler.registerError(
      {
        type: ErrorType.VALIDATION,
        message: 'リストのバリデーション失敗',
        originalError: err instanceof Error ? err : new Error(String(err)),
        timestamp: new Date(),
      }
    );

    throw err;
  }
}

/**
 * オプショナルバリデーション（エラーはスロー）
 */
export function validateOptional<T>(
  data: any,
  schema: ZodSchema
): T | null {
  try {
    return schema.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * 使用例:
 *
 * import { validateResponse, schemas } from '@/lib/validation';
 *
 * try {
 *   const response = await fetch('/api/listening/questions');
 *   const data = await response.json();
 *   const validatedData = await validateResponse(data, schemas.listeningQuestions);
 *   console.log(validatedData);
 * } catch (error) {
 *   // エラーは globalErrorHandler に登録済み
 * }
 */
