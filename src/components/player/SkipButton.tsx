// components/player/SkipButton.tsx
/**
 * =============================================================================
 * Skip Button Component - Netflix-Style
 * =============================================================================
 * Features:
 * - Skip Intro button
 * - Skip Credits button
 * - Skip Recap button
 * - Auto-show/hide based on markers
 * - Smooth animation
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";

export interface SceneMarker {
  id: string;
  episode_id: string;
  marker_type: "intro" | "credits" | "recap" | "preview";
  start_time_seconds: number;
  end_time_seconds: number;
}

interface SkipButtonProps {
  marker: SceneMarker;
  currentTime: number;
  onSkip: (toTime: number) => void;
  className?: string;
}

export function SkipButton({ marker, currentTime, onSkip, className }: SkipButtonProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasSkipped, setHasSkipped] = React.useState(false);

  React.useEffect(() => {
    // Show button when entering marker range
    const inRange =
      currentTime >= marker.start_time_seconds &&
      currentTime < marker.end_time_seconds;

    setIsVisible(inRange && !hasSkipped);

    // Reset hasSkipped when marker range ends
    if (!inRange) {
      setHasSkipped(false);
    }
  }, [currentTime, marker, hasSkipped]);

  const handleSkip = () => {
    onSkip(marker.end_time_seconds);
    setHasSkipped(true);
    setIsVisible(false);
  };

  const getLabel = () => {
    switch (marker.marker_type) {
      case "intro":
        return "Skip Intro";
      case "credits":
        return "Skip Credits";
      case "recap":
        return "Skip Recap";
      case "preview":
        return "Skip Preview";
      default:
        return "Skip";
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleSkip}
      className={cn(
        "group flex items-center gap-2 rounded-md bg-white/90 px-6 py-3 font-semibold text-black shadow-lg transition-all hover:bg-white hover:scale-105",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
        className
      )}
    >
      <span>{getLabel()}</span>
      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

/**
 * =============================================================================
 * Skip Markers Manager - Handles multiple markers
 * =============================================================================
 */

interface SkipMarkersManagerProps {
  episodeId?: string;
  currentTime: number;
  onSkip: (toTime: number) => void;
  markers?: SceneMarker[];
}

export function SkipMarkersManager({
  episodeId,
  currentTime,
  onSkip,
  markers: providedMarkers,
}: SkipMarkersManagerProps) {
  const [markers, setMarkers] = React.useState<SceneMarker[]>(providedMarkers || []);

  // Fetch markers if episode ID provided and no markers given
  React.useEffect(() => {
    if (episodeId && !providedMarkers) {
      fetch(`/api/v1/episodes/${episodeId}/markers`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setMarkers(data))
        .catch(() => setMarkers([]));
    }
  }, [episodeId, providedMarkers]);

  // Find active marker (priority: recap > intro > credits)
  const activeMarker = React.useMemo(() => {
    const inRange = markers.filter(
      m => currentTime >= m.start_time_seconds && currentTime < m.end_time_seconds
    );

    // Priority order
    const priority = ["recap", "intro", "credits", "preview"];
    for (const type of priority) {
      const marker = inRange.find(m => m.marker_type === type);
      if (marker) return marker;
    }

    return null;
  }, [markers, currentTime]);

  if (!activeMarker) return null;

  return (
    <div className="absolute bottom-24 right-8 z-20">
      <SkipButton
        marker={activeMarker}
        currentTime={currentTime}
        onSkip={onSkip}
      />
    </div>
  );
}
