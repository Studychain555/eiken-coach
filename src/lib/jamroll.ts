/**
 * jamroll API クライアント
 * 文字起こしデータの取得・パースを管理
 */

interface JamrollTranscription {
  id: string;
  transcriptionId: string;
  sessionType: 'sales_call' | 'lesson' | 'consultation' | 'unknown';
  transcriptText: string;
  durationMinutes: number;
  recordedAt: Date;
  metadata: Record<string, any>;
}

interface JamrollAPIResponse {
  data: Array<{
    id: string;
    text: string;
    duration?: number;
    recorded_at?: string;
    created_at?: string;
    type?: string;
    [key: string]: any;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  error?: string;
}

interface FetchTranscriptionsParams {
  from?: Date;
  to?: Date;
  limit?: number;
  page?: number;
  sessionType?: string;
}

class JamrollClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number = 8000; // 8秒タイムアウト
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    // jamroll API のスタンダードエンドポイント（一般的な想定）
    this.baseUrl = baseUrl || 'https://api.jamroll.io/v1';
  }

  /**
   * 文字起こしデータを取得
   */
  async fetchTranscriptions(
    params: FetchTranscriptionsParams = {}
  ): Promise<JamrollTranscription[]> {
    const queryParams = new URLSearchParams();

    if (params.from) {
      queryParams.append('from', params.from.toISOString());
    }
    if (params.to) {
      queryParams.append('to', params.to.toISOString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.sessionType) {
      queryParams.append('type', params.sessionType);
    }

    const url = `${this.baseUrl}/transcriptions?${queryParams.toString()}`;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data: JamrollAPIResponse = await response.json();

        if (data.error) {
          throw new Error(`API error: ${data.error}`);
        }

        return this.parseTranscriptions(data.data);
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.retryAttempts) {
          // リトライ前に待機
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempt)
          );
          continue;
        }
      }
    }

    throw new Error(
      `Failed to fetch transcriptions after ${this.retryAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * 単一の文字起こしを詳細取得
   */
  async fetchTranscriptionDetail(
    transcriptionId: string
  ): Promise<JamrollTranscription> {
    const url = `${this.baseUrl}/transcriptions/${transcriptionId}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const parsed = this.parseTranscription(data);

      return parsed;
    } catch (error) {
      throw new Error(
        `Failed to fetch transcription detail: ${(error as Error).message}`
      );
    }
  }

  /**
   * タイムアウト付き fetch
   */
  private fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`Request timeout after ${this.timeout}ms`)),
          this.timeout
        )
      ),
    ]);
  }

  /**
   * API レスポンスを解析・正規化
   */
  private parseTranscription(raw: any): JamrollTranscription {
    const recordedAt = new Date(raw.recorded_at || raw.created_at || new Date());
    const durationMinutes = raw.duration || 0;
    const sessionType = this.inferSessionType(raw.text || '', raw.type);

    return {
      id: `jamroll_${raw.id || crypto.randomUUID()}`,
      transcriptionId: raw.id,
      sessionType,
      transcriptText: raw.text || '',
      durationMinutes,
      recordedAt,
      metadata: {
        originalId: raw.id,
        source: 'jamroll',
        ...raw,
      },
    };
  }

  /**
   * 複数の文字起こしをパース
   */
  private parseTranscriptions(items: any[]): JamrollTranscription[] {
    return items.map((item) => this.parseTranscription(item));
  }

  /**
   * セッションタイプを推測（テキスト分析）
   */
  private inferSessionType(
    text: string,
    type?: string
  ): JamrollTranscription['sessionType'] {
    if (type) {
      const normalized = type.toLowerCase();
      if (normalized.includes('sales') || normalized.includes('consultation'))
        return 'sales_call';
      if (normalized.includes('lesson')) return 'lesson';
      if (normalized.includes('consultation')) return 'consultation';
    }

    // テキスト内容から推測
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('申し込み') ||
      lowerText.includes('体験') ||
      lowerText.includes('料金') ||
      lowerText.includes('プラン')
    ) {
      return 'sales_call';
    }
    if (
      lowerText.includes('レッスン') ||
      lowerText.includes('練習') ||
      lowerText.includes('演習')
    ) {
      return 'lesson';
    }
    if (
      lowerText.includes('相談') ||
      lowerText.includes('質問') ||
      lowerText.includes('カウンセリング')
    ) {
      return 'consultation';
    }

    return 'unknown';
  }
}

export { JamrollClient, JamrollTranscription, FetchTranscriptionsParams };
