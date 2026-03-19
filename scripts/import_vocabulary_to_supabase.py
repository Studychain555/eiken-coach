#!/usr/bin/env python3
"""
Import EIKEN Vocabulary Data to Supabase
Reads CSV files and imports into eiken_vocabulary and eiken_vocabulary_choices tables
"""

import csv
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://tbtwegsiumpiskeuhgfjs.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

# Use supabase-py or requests library
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    print('⚠️ supabase-py not installed. Install with: pip install supabase-py')
    SUPABASE_AVAILABLE = False

class VocabularyImporter:
    def __init__(self):
        if SUPABASE_AVAILABLE and SUPABASE_KEY:
            self.client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        else:
            self.client = None
            print('⚠️ Supabase client not available. Using local JSON output.')

    def read_vocabulary_csv(self, csv_file: Path) -> List[Dict]:
        """Read vocabulary data from CSV file"""
        words = []
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                words.append(row)
        return words

    def prepare_vocabulary_record(self, row: Dict) -> Dict:
        """Prepare vocabulary record for Supabase insertion"""
        return {
            'word': row['word'],
            'reading': row['reading'],
            'part_of_speech': row['part_of_speech'],
            'meaning_jp': row['meaning_jp'],
            'example_sentence': row['example_sentence'],
            'example_translation': row['example_translation'],
            'eiken_level': row.get('eiken_level', 'pre_2nd'),
            'difficulty': int(row['difficulty']),
            'frequency': int(row['frequency']),
            'is_verified': False,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'attempt_count': 0,
            'correct_count': 0,
        }

    def prepare_choice_records(self, word_id: str, row: Dict) -> List[Dict]:
        """Prepare choice records for Supabase insertion"""
        choices = []
        for i in range(1, 5):  # Expecting 4 choices
            meaning_key = f'choice{i}_meaning'
            is_correct_key = f'choice{i}_is_correct'

            if meaning_key in row and row[meaning_key]:
                choices.append({
                    'word_id': word_id,
                    'meaning': row[meaning_key],
                    'is_correct': row[is_correct_key].lower() in ['true', '1', 'yes'],
                    'difficulty': 2,  # Default difficulty
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat(),
                })

        return choices

    def insert_vocabulary(self, vocab_records: List[Dict]) -> List[Tuple[str, str]]:
        """Insert vocabulary records into Supabase"""
        if not self.client:
            print('⚠️ Supabase client not available. Skipping insertion.')
            return []

        inserted = []
        failed = []

        for record in vocab_records:
            try:
                response = self.client.table('eiken_vocabulary').insert(record).execute()
                if response.data:
                    inserted.append((record['word'], response.data[0]['id']))
                    print(f'  ✅ {record["word"]}')
            except Exception as e:
                failed.append((record['word'], str(e)))
                print(f'  ❌ {record["word"]}: {e}')

        return inserted, failed

    def insert_choices(self, choice_records: List[Dict]) -> Tuple[int, int]:
        """Insert choice records into Supabase"""
        if not self.client:
            print('⚠️ Supabase client not available. Skipping insertion.')
            return 0, 0

        inserted = 0
        failed = 0

        for record in choice_records:
            try:
                self.client.table('eiken_vocabulary_choices').insert(record).execute()
                inserted += 1
            except Exception as e:
                failed += 1
                print(f'  ❌ Choice insertion failed: {e}')

        return inserted, failed

    def import_csv_file(self, csv_file: Path) -> Dict:
        """Import single CSV file to Supabase"""
        print(f'\n📥 Importing {csv_file.name}...')

        # Read CSV
        records = self.read_vocabulary_csv(csv_file)
        print(f'  📖 Found {len(records)} words')

        # Prepare data
        vocab_records = []
        all_choice_records = []

        for row in records:
            vocab_record = self.prepare_vocabulary_record(row)
            vocab_records.append(vocab_record)

        # Insert vocabulary records
        print(f'  📤 Inserting vocabulary...')
        inserted_vocab, failed_vocab = self.insert_vocabulary(vocab_records)

        # Map words to IDs and prepare choices
        word_id_map = {word: word_id for word, word_id in inserted_vocab}

        for i, row in enumerate(records):
            word = row['word']
            if word in word_id_map:
                choice_records = self.prepare_choice_records(word_id_map[word], row)
                all_choice_records.extend(choice_records)

        # Insert choices
        print(f'  📤 Inserting choices...')
        inserted_choices, failed_choices = self.insert_choices(all_choice_records)

        return {
            'file': csv_file.name,
            'vocab_inserted': len(inserted_vocab),
            'vocab_failed': len(failed_vocab),
            'choices_inserted': inserted_choices,
            'choices_failed': failed_choices,
        }

    def import_all_files(self, vocab_dir: Path) -> Dict:
        """Import all CSV files from directory"""
        results = {}
        for csv_file in vocab_dir.glob('*_vocabulary.csv'):
            result = self.import_csv_file(csv_file)
            results[csv_file.stem] = result

        return results

def export_to_json(vocab_dir: Path, output_dir: Path):
    """Export vocabulary data to JSON for local testing"""
    output_dir.mkdir(parents=True, exist_ok=True)

    for csv_file in vocab_dir.glob('*_vocabulary.csv'):
        print(f'\n📄 Processing {csv_file.name}...')

        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            data = list(reader)

        output_file = output_dir / f'{csv_file.stem}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f'  ✅ Exported to {output_file.name}')

def main():
    print('🗂️ EIKEN Vocabulary Supabase Import\n')

    vocab_dir = Path('/Users/80dr/eigomaster/data/vocabulary_comprehensive')

    if not vocab_dir.exists():
        print(f'❌ Vocabulary directory not found: {vocab_dir}')
        sys.exit(1)

    # Export to JSON for local testing/reference
    json_export_dir = Path('/Users/80dr/eigomaster/data/vocabulary_json')
    export_to_json(vocab_dir, json_export_dir)

    # Import to Supabase
    importer = VocabularyImporter()

    if importer.client:
        print('\n📡 Importing to Supabase...')
        results = importer.import_all_files(vocab_dir)

        print('\n📊 Import Summary:')
        total_vocab_inserted = 0
        total_choices_inserted = 0

        for level, result in results.items():
            print(f'\n  {level}:')
            print(f'    Vocabulary: {result["vocab_inserted"]} inserted, {result["vocab_failed"]} failed')
            print(f'    Choices: {result["choices_inserted"]} inserted, {result["choices_failed"]} failed')
            total_vocab_inserted += result['vocab_inserted']
            total_choices_inserted += result['choices_inserted']

        print(f'\n✨ Import Complete!')
        print(f'  Total vocabulary words: {total_vocab_inserted}')
        print(f'  Total choices: {total_choices_inserted}')
    else:
        print('\n⚠️ Supabase not configured. Using local JSON export only.')
        print(f'  JSON files exported to: {json_export_dir}')
        print('\n📋 To import to Supabase later:')
        print('  1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
        print('  2. Install supabase-py: pip install supabase-py')
        print('  3. Run this script again')

if __name__ == '__main__':
    main()
