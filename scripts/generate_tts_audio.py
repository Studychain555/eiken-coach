#!/usr/bin/env python3
"""
Google TTS Audio Generation for EIKEN Vocabulary
Generates MP3 pronunciation files for all 1,482 vocabulary words
Uses Google Cloud Text-to-Speech API with retry logic and parallel processing
"""

import os
import json
import csv
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TTSGenerator:
    """Google Cloud TTS Audio Generator"""

    def __init__(
        self,
        google_cloud_api_key: Optional[str] = None,
        output_dir: str = "public/audio/eiken",
        max_workers: int = 4,
        max_retries: int = 3,
        language_code: str = "en-US",
        voice_name: str = "en-US-Neural2-C"  # Female voice
    ):
        """
        Initialize TTS Generator

        Args:
            google_cloud_api_key: Google Cloud API key (or use env var)
            output_dir: Output directory for MP3 files
            max_workers: Number of concurrent TTS requests
            max_retries: Maximum retry attempts for failed requests
            language_code: Language code (en-US for English)
            voice_name: Voice profile name
        """
        self.api_key = google_cloud_api_key or os.getenv('GOOGLE_CLOUD_API_KEY')
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.max_workers = max_workers
        self.max_retries = max_retries
        self.language_code = language_code
        self.voice_name = voice_name
        self.api_endpoint = "https://texttospeech.googleapis.com/v1/text:synthesize"

        # Statistics
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'failed_words': []
        }

    def _should_skip(self, word: Dict) -> bool:
        """Check if word should be skipped"""
        # Skip if audio URL already exists
        if word.get('audio_url'):
            return True
        # Skip if no english_word
        if not word.get('english_word'):
            return True
        return False

    def _calculate_backoff(self, attempt: int) -> float:
        """Calculate exponential backoff delay"""
        return min(2 ** attempt, 32)

    def generate_audio_for_word(self, word: Dict) -> Optional[Dict]:
        """
        Generate audio file for a single word

        Returns:
            Dict with word data and audio_url, or None if failed
        """
        word_text = word.get('english_word', '')
        word_id = word.get('id', '')

        if not word_text or not word_id:
            logger.warning(f"Skipping word with missing fields: {word}")
            self.stats['skipped'] += 1
            return None

        # Output filename
        audio_filename = f"{word_id}.mp3"
        audio_path = self.output_dir / audio_filename

        # Skip if already exists
        if audio_path.exists():
            logger.debug(f"Audio already exists: {audio_filename}")
            self.stats['skipped'] += 1
            word['audio_url'] = f"/{self.output_dir.as_posix()}/{audio_filename}"
            return word

        # Try to generate audio
        for attempt in range(self.max_retries):
            try:
                if self._generate_audio_file(word_text, audio_path):
                    self.stats['successful'] += 1
                    word['audio_url'] = f"/{self.output_dir.as_posix()}/{audio_filename}"
                    logger.info(f"✓ Generated: {word_text} -> {audio_filename}")
                    return word
                else:
                    logger.warning(f"Failed to generate: {word_text}")
                    self.stats['failed'] += 1
                    self.stats['failed_words'].append(word_text)
                    return None

            except Exception as e:
                if attempt < self.max_retries - 1:
                    backoff = self._calculate_backoff(attempt)
                    logger.warning(
                        f"Attempt {attempt + 1}/{self.max_retries} failed for '{word_text}': {e}. "
                        f"Retrying in {backoff}s..."
                    )
                    import time
                    time.sleep(backoff)
                else:
                    logger.error(f"Failed to generate audio for '{word_text}' after {self.max_retries} attempts")
                    self.stats['failed'] += 1
                    self.stats['failed_words'].append(word_text)
                    return None

        return None

    def _generate_audio_file(self, text: str, output_path: Path) -> bool:
        """
        Call Google TTS API to generate audio file

        Returns:
            True if successful, False otherwise
        """
        if not self.api_key:
            # Demo mode: create empty file
            logger.info(f"DEMO MODE: Creating placeholder audio file for: {text}")
            output_path.touch()
            return True

        try:
            request_body = {
                'input': {'text': text},
                'voice': {
                    'languageCode': self.language_code,
                    'name': self.voice_name
                },
                'audioConfig': {
                    'audioEncoding': 'MP3',
                    'pitch': 0.0,
                    'speakingRate': 1.0
                }
            }

            params = {'key': self.api_key}

            response = requests.post(
                self.api_endpoint,
                json=request_body,
                params=params,
                timeout=30
            )

            if response.status_code == 200:
                audio_content = response.json().get('audioContent')
                if audio_content:
                    import base64
                    audio_bytes = base64.b64decode(audio_content)
                    with open(output_path, 'wb') as f:
                        f.write(audio_bytes)
                    return True
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                return False

        except requests.Timeout:
            logger.error(f"Request timeout for: {text}")
            return False
        except Exception as e:
            logger.error(f"Error generating audio for '{text}': {e}")
            return False

    def generate_batch(self, words: List[Dict]) -> List[Dict]:
        """
        Generate audio files for a batch of words in parallel

        Args:
            words: List of vocabulary word dictionaries

        Returns:
            List of words with audio_url populated
        """
        self.stats['total'] = len(words)
        results = []

        logger.info(f"Starting TTS generation for {len(words)} words with {self.max_workers} workers...")

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(self.generate_audio_for_word, word): word
                for word in words
            }

            for i, future in enumerate(as_completed(futures), 1):
                result = future.result()
                if result:
                    results.append(result)

                # Progress logging
                if i % 50 == 0:
                    logger.info(f"Progress: {i}/{len(words)} ({i*100//len(words)}%)")

        return results

    def generate_from_csv(self, csv_path: str) -> Tuple[List[Dict], Dict]:
        """
        Generate audio from CSV file

        Args:
            csv_path: Path to vocabulary CSV file

        Returns:
            Tuple of (updated_words, stats)
        """
        words = []

        logger.info(f"Reading vocabulary from: {csv_path}")

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            words = list(reader)

        logger.info(f"Loaded {len(words)} words from CSV")

        # Generate audio
        updated_words = self.generate_batch(words)

        return updated_words, self.stats

    def save_results(self, words: List[Dict], output_path: str = "/tmp/tts_generation_results.csv"):
        """
        Save updated vocabulary with audio URLs to CSV

        Args:
            words: List of vocabulary dictionaries with audio_url
            output_path: Output CSV file path
        """
        if not words:
            logger.warning("No words to save")
            return

        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            fieldnames = words[0].keys()
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(words)

        logger.info(f"Saved results to: {output_path}")

    def print_stats(self):
        """Print generation statistics"""
        print("\n" + "=" * 60)
        print("TTS Generation Statistics")
        print("=" * 60)
        print(f"Total words:     {self.stats['total']}")
        print(f"Successful:      {self.stats['successful']} ({self.stats['successful']*100//max(1,self.stats['total'])}%)")
        print(f"Failed:          {self.stats['failed']}")
        print(f"Skipped:         {self.stats['skipped']}")

        if self.stats['failed_words']:
            print(f"\nFailed words: {', '.join(self.stats['failed_words'][:10])}")
            if len(self.stats['failed_words']) > 10:
                print(f"... and {len(self.stats['failed_words']) - 10} more")
        print("=" * 60 + "\n")


def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description="Generate TTS audio for EIKEN vocabulary")
    parser.add_argument(
        "--csv",
        default="/tmp/eiken_vocabulary_1482.csv",
        help="Path to vocabulary CSV file"
    )
    parser.add_argument(
        "--output-dir",
        default="public/audio/eiken",
        help="Output directory for MP3 files"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of concurrent TTS requests"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without actually generating files"
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="Google Cloud API key (or use GOOGLE_CLOUD_API_KEY env var)"
    )

    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("EigoMaster TTS Audio Generator")
    print("=" * 60)
    print(f"CSV Input:   {args.csv}")
    print(f"Output Dir:  {args.output_dir}")
    print(f"Workers:     {args.workers}")
    if args.dry_run:
        print("Mode:        DRY RUN (no files will be generated)")
    print("=" * 60 + "\n")

    # Create generator
    generator = TTSGenerator(
        google_cloud_api_key=args.api_key,
        output_dir=args.output_dir,
        max_workers=args.workers
    )

    # Check if CSV exists
    if not os.path.exists(args.csv):
        logger.error(f"CSV file not found: {args.csv}")
        logger.info("First run: python3 scripts/expand_to_1482_vocabulary.py")
        return

    # Generate audio
    start_time = datetime.now()

    if args.dry_run:
        logger.info("DRY RUN: Reading CSV and calculating what would be done...")
        with open(args.csv, 'r', encoding='utf-8') as f:
            words = list(csv.DictReader(f))
        logger.info(f"Would process {len(words)} words")
    else:
        logger.info("Starting audio generation...")
        words, stats = generator.generate_from_csv(args.csv)
        generator.save_results(words)
        generator.print_stats()

    elapsed = datetime.now() - start_time
    logger.info(f"Completed in {elapsed}")

    print("\nNext steps:")
    print("1. Upload audio files to Cloudflare CDN (if needed)")
    print("2. Import vocabulary CSV to Supabase:")
    print(f"   psql -h <supabase-host> -U postgres -d postgres -c \"\\COPY eiken_vocabulary FROM '{args.csv}' CSV HEADER;\"")
    print("3. Run: python3 scripts/manage_beta_testers.py enroll --phase 1 --count 100")


if __name__ == "__main__":
    main()
