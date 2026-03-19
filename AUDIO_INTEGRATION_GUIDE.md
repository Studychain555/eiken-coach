# 📻 EIKEN Vocabulary Audio Integration Guide

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
python3 scripts/batch_generate_audio.py \
  --input data/vocabulary_comprehensive/pre_2nd_vocabulary.csv \
  --output data/audio_files/ \
  --provider google-tts \
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
