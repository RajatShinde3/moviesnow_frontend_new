// Scene Markers Type Definitions
export type MarkerType =
  | 'intro'
  | 'recap'
  | 'opening'
  | 'ending'
  | 'preview'
  | 'credits';

export interface MarkerRange {
  start: number;  // seconds
  end: number;    // seconds
}

export interface SceneMarkers {
  id?: string;
  titleId: string;
  episodeId?: string;
  intro?: MarkerRange;
  recap?: MarkerRange;
  opening?: MarkerRange;    // Anime OP
  ending?: MarkerRange;     // Anime ED
  preview?: MarkerRange;    // Next episode preview
  credits?: MarkerRange;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkerConfig {
  type: MarkerType;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  skipByDefault: boolean;
  showInTimeline: boolean;
}

export interface VideoMetadata {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
}

export interface TimelinePosition {
  x: number;
  percentage: number;
  time: number;
}

export interface DragState {
  isDragging: boolean;
  markerType: MarkerType | null;
  handleType: 'start' | 'end' | null;
  initialPosition: number;
}
