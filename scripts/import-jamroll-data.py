#!/usr/bin/env python3
"""
jamroll API からデータをインポート → Supabase に保存
EigoMaster 分析パイプライン Phase 1 実装
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import requests
from dotenv import load_dotenv

# Supabase クライアント（supabase-py）
try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase パッケージが必要です。実行: pip install supabase")
    sys.exit(1)

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('/tmp/import_jamroll.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class JamrollImporter:
    """jamroll API からのデータインポーター"""

    def __init__(self, jamroll_api_key: str, supabase_url: str, supabase_key: str):
        self.jamroll_api_key = jamroll_api_key
        self.jamroll_base_url = "https://api.jamroll.io/v1"
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def fetch_transcriptions(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        limit: int = 100,
        page: int = 1
    ) -> List[Dict[str, Any]]:
        """jamroll API から文字起こしを取得"""

        params = {
            'limit': limit,
            'page': page,
        }

        if date_from:
            params['from'] = date_from.isoformat()
        if date_to:
            params['to'] = date_to.isoformat()

        headers = {
            'Authorization': f'Bearer {self.jamroll_api_key}',
            'Content-Type': 'application/json',
        }

        try:
            logger.info(f"jamroll API リクエスト: {self.jamroll_base_url}/transcriptions")
            response = requests.get(
                f'{self.jamroll_base_url}/transcriptions',
                params=params,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()

            data = response.json()
            transcriptions = data.get('data', [])
            logger.info(f"取得: {len(transcriptions)} 件")

            return transcriptions

        except requests.exceptions.RequestException as e:
            logger.error(f"jamroll API エラー: {e}")
            raise

    def infer_session_type(self, text: str, type_hint: Optional[str] = None) -> str:
        """セッションタイプを推測"""

        if type_hint:
            normalized = type_hint.lower()
            if 'sales' in normalized or 'consultation' in normalized:
                return 'sales_call'
            if 'lesson' in normalized:
                return 'lesson'

        text_lower = text.lower()
        if any(keyword in text_lower for keyword in ['申し込み', '体験', '料金', 'プラン']):
            return 'sales_call'
        if any(keyword in text_lower for keyword in ['レッスン', '練習', '演習']):
            return 'lesson'
        if any(keyword in text_lower for keyword in ['相談', '質問', 'カウンセリング']):
            return 'consultation'

        return 'unknown'

    def normalize_transcription(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """API レスポンスを正規化"""

        recorded_at = raw.get('recorded_at') or raw.get('created_at') or datetime.now().isoformat()
        duration = raw.get('duration', 0)
        text = raw.get('text', '')
        transcription_id = raw.get('id')

        session_type = self.infer_session_type(text, raw.get('type'))

        return {
            'transcription_id': transcription_id,
            'session_type': session_type,
            'transcript_text': text,
            'duration_minutes': duration,
            'recorded_at': recorded_at,
            'metadata': {
                'original_id': transcription_id,
                'source': 'jamroll',
                **raw
            }
        }

    def import_to_supabase(self, transcriptions: List[Dict[str, Any]]) -> int:
        """正規化したデータを Supabase に保存"""

        if not transcriptions:
            logger.warning("保存するデータなし")
            return 0

        normalized = [self.normalize_transcription(t) for t in transcriptions]

        try:
            logger.info(f"Supabase に {len(normalized)} 件を保存中...")

            # バッチ挿入（Upsert で重複を避ける）
            result = self.supabase.table('jamroll_transcriptions').upsert(
                normalized,
                on_conflict='transcription_id'
            ).execute()

            inserted = len(result.data) if hasattr(result, 'data') and result.data else len(normalized)
            logger.info(f"保存完了: {inserted} 件")

            return inserted

        except Exception as e:
            logger.error(f"Supabase 保存エラー: {e}")
            raise

    def run(
        self,
        days_back: int = 30,
        limit: int = 100,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """メイン実行ロジック"""

        date_to = datetime.now()
        date_from = date_to - timedelta(days=days_back)

        logger.info(f"期間: {date_from} ~ {date_to}")
        logger.info(f"ドライラン: {dry_run}")

        try:
            # jamroll からデータ取得
            transcriptions = self.fetch_transcriptions(
                date_from=date_from,
                date_to=date_to,
                limit=limit,
                page=1
            )

            if dry_run:
                logger.info(f"[DRY RUN] {len(transcriptions)} 件をプレビュー:")
                for t in transcriptions[:3]:
                    logger.info(f"  - {t.get('id')}: {t.get('text', '')[:100]}")
                return {
                    'success': True,
                    'imported': 0,
                    'preview': transcriptions[:3]
                }

            # Supabase に保存
            imported = self.import_to_supabase(transcriptions)

            return {
                'success': True,
                'imported': imported,
                'total_fetched': len(transcriptions),
                'period': {
                    'from': date_from.isoformat(),
                    'to': date_to.isoformat()
                }
            }

        except Exception as e:
            logger.error(f"インポート失敗: {e}")
            return {
                'success': False,
                'error': str(e)
            }


def main():
    """エントリーポイント"""

    # 環境変数ロード
    load_dotenv('/Users/80dr/eigomaster/.env.local')

    jamroll_api_key = os.getenv('JAMROLL_API_KEY')
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if not all([jamroll_api_key, supabase_url, supabase_key]):
        logger.error("必要な環境変数が未設定: JAMROLL_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY")
        sys.exit(1)

    # インポーター実行
    importer = JamrollImporter(jamroll_api_key, supabase_url, supabase_key)

    result = importer.run(
        days_back=30,  # 過去 30 日
        limit=100,
        dry_run=False
    )

    if result['success']:
        logger.info(f"✅ インポート成功: {result['imported']} 件")
        sys.exit(0)
    else:
        logger.error(f"❌ インポート失敗: {result.get('error')}")
        sys.exit(1)


if __name__ == '__main__':
    main()
