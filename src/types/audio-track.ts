// types/audio-track.ts
export type TrackType = 'primary' | 'commentary' | 'descriptive';
export type AudioCodec = 'AAC' | 'MP3' | 'FLAC' | 'Opus' | 'Vorbis';

export interface AudioTrack {
  id: string;
  titleId: string;
  language: string;
  languageName: string;
  trackType: TrackType;
  label?: string;
  isDefault: boolean;
  url: string;
  metadata: {
    codec: AudioCodec;
    bitrate: number; // kbps
    channels: number;
    sampleRate: number; // Hz
    duration: number; // seconds
    fileSize: number; // bytes
  };
  createdAt: string;
  updatedAt: string;
}

export interface UploadAudioTrackInput {
  file: File;
  titleId: string;
  language: string;
  trackType: TrackType;
  label?: string;
  isDefault: boolean;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
] as const;

export const TRACK_TYPES: Record<TrackType, { label: string; description: string }> = {
  primary: {
    label: 'Primary Audio',
    description: 'Main audio track for the content'
  },
  commentary: {
    label: 'Commentary',
    description: 'Director or cast commentary track'
  },
  descriptive: {
    label: 'Descriptive Audio',
    description: 'Audio description for visually impaired viewers'
  }
};

export const AUDIO_CODECS: Record<AudioCodec, { label: string; quality: string }> = {
  AAC: { label: 'AAC', quality: 'High quality, widely supported' },
  MP3: { label: 'MP3', quality: 'Universal compatibility' },
  FLAC: { label: 'FLAC', quality: 'Lossless, best quality' },
  Opus: { label: 'Opus', quality: 'Excellent compression' },
  Vorbis: { label: 'Vorbis', quality: 'Open source, good quality' }
};
