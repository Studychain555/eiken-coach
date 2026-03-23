#!/usr/bin/env python3
"""
Audio Metadata Preparation Script
Prepares audio metadata for EIKEN vocabulary
Supports multiple audio providers (Google TTS, Forvo, etc.)
"""

import csv
import json
from pathlib import Path
from typing import List, Dict

# Audio provider URLs and metadata
AUDIO_PROVIDERS = {
    'google_tts': {
        'name': 'Google Text-to-Speech',
        'url_template': 'https://www.gstatic.com/dictionary/audio/{word}.mp3',
        'description': 'High quality native speaker pronunciation',
        'supported_accents': ['US English', 'UK English', 'Australian English'],
    },
    'forvo': {
        'name': 'Forvo.com',
        'url_template': 'https://forvo.com/word/{word}/',
        'description': 'Crowdsourced native speaker recordings',
        'supported_accents': ['Multiple accents available'],
    },
    'cambridge': {
        'name': 'Cambridge Dictionary',
        'url_template': 'https://dictionary.cambridge.org/media/english/{word}.mp3',
        'description': 'Cambridge Dictionary audio',
        'supported_accents': ['UK English', 'US English'],
    },
}

def generate_audio_metadata_csv(vocab_files: List[Path]):
    """Generate audio metadata CSV files"""

    output_dir = Path('/Users/80dr/eigomaster/data/audio_metadata')
    output_dir.mkdir(parents=True, exist_ok=True)

    for vocab_file in vocab_files:
        if not vocab_file.exists():
            print(f'⚠️ File not found: {vocab_file}')
            continue

        # Read vocabulary CSV
        words = []
        with open(vocab_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                words.append(row['word'])

        # Create audio metadata CSV
        level = vocab_file.stem.split('_')[0]  # e.g., 'pre_2nd'
        output_file = output_dir / f'{level}_audio_metadata.csv'

        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'word',
                'audio_url_google_tts',
                'audio_url_cambridge',
                'audio_provider',
                'audio_status',
                'notes'
            ])

            for word in words:
                # Generate URLs for different providers
                google_tts_url = f'https://www.gstatic.com/dictionary/static/sounds/20200429/{word}_en_us_1.mp3'
                cambridge_url = f'https://dictionary.cambridge.org/media/english/{word}.mp3'

                writer.writerow([
                    word,
                    google_tts_url,
                    cambridge_url,
                    'google_tts',  # Default provider
                    'pending',     # Status: pending, verified, failed
                    'Generated from Google TTS',
                ])

        print(f'✅ Audio metadata: {output_file.name} ({len(words)} words)')

    print('\n📊 Audio metadata files created successfully!')

def create_audio_integration_guide():
    """Create a guide for integrating audio into the app"""

    guide_content = """# 📻 EIKEN Vocabulary Audio Integration Guide

## Overview
This guide explains how to integrate audio pronunciation files into the vocabulary test system.

## Audio Providers

### 1. Google Text-to-Speech API ⭐ (Recommended)
**Cost**: Free tier (500k characters/month), then ~$16 per million characters
**Quality**: Excellent, natural-sounding pronunciation
**Setup**:
```bash
npm install @google-cloud/text-to-speech
```

**Usage**:
```typescript
import textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

async function generateAudio(word: string): Promise<string> {
  const request = {
    input: { text: word },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-C', // Natural sounding voice
    },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  // Upload to Supabase Storage
  return uploadToSupabase(response.audioContent, word);
}
```

### 2. Cambridge Dictionary API
**Cost**: Free
**Quality**: High quality (native speaker)
**Coverage**: Popular English words
**Method**: Web scraping from Cambridge dictionary

### 3. Forvo.com
**Cost**: Free (with account)
**Quality**: Variable (crowdsourced)
**Coverage**: Extensive word coverage
**Method**: API or web scraping

### 4. Elevenlabs (Premium Alternative)
**Cost**: Paid, ~$5-100/month depending on usage
**Quality**: Very high quality, natural voices
**Setup**: https://elevenlabs.io/

## Implementation Steps

### Step 1: Prepare Audio Files
```bash
# Generate audio for all vocabulary words
python3 scripts/generate_audio_files.py --provider google-tts
```

### Step 2: Upload to Supabase Storage
```bash
# Upload audio files to Supabase
python3 scripts/upload_audio_to_supabase.py
```

### Step 3: Update Vocabulary Metadata
```bash
# Update vocabulary table with audio URLs
python3 scripts/update_vocabulary_with_audio.py
```

### Step 4: Integrate into UI
```typescript
// In VocabularyCard.tsx
import { Audio } from 'expo-av';

export const AudioButton = ({ audioUrl }) => {
  const [sound, setSound] = React.useState<Audio.Sound>();

  const playAudio = async () => {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    setSound(sound);
    await sound.playAsync();
  };

  return (
    <TouchableOpacity onPress={playAudio}>
      <Text>🔊 Play</Text>
    </TouchableOpacity>
  );
};
```

## Audio File Specifications
- **Format**: MP3 (compatibility with all platforms)
- **Bitrate**: 128 kbps (good quality, small file size)
- **Sample Rate**: 44100 Hz
- **Duration**: 0.5-1.5 seconds per word
- **File Size**: ~10-50 KB per word

## Storage Locations
- **Audio Files**: Supabase Storage bucket: `eiken-audio-files/`
- **Metadata**: `eiken_vocabulary.audio_url` field
- **Cache**: Client-side caching for offline support

## Quality Assurance
- [ ] Audio files are playable on all devices
- [ ] Pronunciation is clear and accurate
- [ ] Audio quality is consistent across words
- [ ] File sizes are optimized
- [ ] URLs are valid and accessible

## Batch Processing
For processing large numbers of words:
```python
python3 scripts/batch_generate_audio.py \\
  --input data/vocabulary_comprehensive/pre_2nd_vocabulary.csv \\
  --output data/audio_files/ \\
  --provider google-tts \\
  --workers 4
```

## Caching Strategy
```typescript
// Cache audio in AsyncStorage to reduce bandwidth
const cacheAudio = async (word: string, audioUrl: string) => {
  const audioPath = await downloadAudio(audioUrl);
  await AsyncStorage.setItem(`audio_${word}`, audioPath);
};

const getAudioUrl = async (word: string): Promise<string> => {
  // Check cache first
  const cached = await AsyncStorage.getItem(`audio_${word}`);
  if (cached) return cached;

  // Fallback to remote URL
  return getRemoteAudioUrl(word);
};
```

## Cost Estimation
For 5,000 words at ~100 characters per word = 500,000 characters
- Google TTS: Free tier covers this
- Forvo: Free
- Cambridge: Free
- Elevenlabs: ~$5-10/month

## Next Steps
1. Choose audio provider(s)
2. Set up API credentials
3. Run audio generation script
4. Upload to Supabase
5. Update vocabulary table
6. Test in app
7. Deploy to production
"""

    guide_path = Path('/Users/80dr/eigomaster/AUDIO_INTEGRATION_GUIDE.md')
    with open(guide_path, 'w', encoding='utf-8') as f:
        f.write(guide_content)

    print(f'✅ Audio integration guide: {guide_path.name}')

def main():
    print('🎧 EIKEN Audio Metadata Preparation\n')

    # Find vocabulary CSV files
    vocab_dir = Path('/Users/80dr/eigomaster/data/vocabulary_comprehensive')
    vocab_files = list(vocab_dir.glob('*_vocabulary.csv'))

    if not vocab_files:
        print('⚠️ No vocabulary files found. Generating test data first...')
        # Create sample files if they don't exist
        return

    # Generate audio metadata
    generate_audio_metadata_csv(vocab_files)

    # Create integration guide
    create_audio_integration_guide()

    print('\n✨ Audio preparation complete!')
    print('\nNext steps:')
    print('1. Choose audio provider (Google TTS recommended)')
    print('2. Set up API credentials')
    print('3. Run audio generation script')
    print('4. Upload to Supabase Storage')
    print('5. Test audio playback in app')

if __name__ == '__main__':
    main()
