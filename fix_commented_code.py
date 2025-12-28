"""
Fix files with broken commented-out API calls
"""
from pathlib import Path

# Fix useSceneMarkers.ts - stub out the API calls properly
use_scene_markers = Path("src/hooks/useSceneMarkers.ts")
content = use_scene_markers.read_text(encoding='utf-8')

# Replace broken commented sections with proper stubs
content = content.replace(
    """      const response = // await api.get(url);
      return response.json();""",
    """      // Temporarily disabled - needs proper API integration
      return {} as any;"""
)

content = content.replace(
    """        const response = // await api.patch(`/admin/scene-markers/${data.id}`, {
          json: data
        });
        return response.json();""",
    """        // Temporarily disabled - needs proper API integration
        return data;"""
)

content = content.replace(
    """        const response = // await api.post(`/admin/titles/${titleId}/scene-markers`, {
          json: data
        });
        return response.json();""",
    """        // Temporarily disabled - needs proper API integration
        return data;"""
)

content = content.replace(
    """      const response = // await api.post(`/admin/scene-markers/${markerId}/bulk`, {
        json: { marker_data: markerData }
      });
      return response.json();""",
    """      // Temporarily disabled - needs proper API integration
      return markerData;"""
)

content = content.replace(
    """      const response = // await api.post(`/admin/scene-markers/bulk-update`, {
        json: updates
      });
      return response.json();""",
    """      // Temporarily disabled - needs proper API integration
      return updates;"""
)

use_scene_markers.write_text(content, encoding='utf-8')
print("Fixed useSceneMarkers.ts")

# Fix AudioTrackManager.tsx
audio_track = Path("src/components/admin/AudioTrackManager.tsx")
content = audio_track.read_text(encoding='utf-8')

content = content.replace(
    """      const response = // await api.get(`/admin/titles/${titleId}/audio-tracks`);
      return response.json();""",
    """      // Temporarily disabled - needs proper API integration
      return [];"""
)

content = content.replace(
    """      const response = // await api.post(`/admin/titles/${titleId}/audio-tracks`, {
        json: data
      });
      return response.json();""",
    """      // Temporarily disabled - needs proper API integration
      return data;"""
)

content = content.replace(
    """      // await api.delete(`/admin/audio-tracks/${trackId}`);""",
    """      // Temporarily disabled - needs proper API integration"""
)

content = content.replace(
    """      // await api.post(`/admin/audio-tracks/${trackId}/set-default`);""",
    """      // Temporarily disabled - needs proper API integration"""
)

audio_track.write_text(content, encoding='utf-8')
print("Fixed AudioTrackManager.tsx")

# Fix BatchMarkerEditor.tsx
batch_marker = Path("src/components/admin/BatchMarkerEditor.tsx")
content = batch_marker.read_text(encoding='utf-8')

content = content.replace(
    """      const response = // await api.post('/admin/scene-markers/batch', {
        json: {
          title_ids: titleIds,
          marker_data: markersData
        }
      });
      return response.json();""",
    """      // Temporarily disabled - needs proper API integration
      return {};"""
)

batch_marker.write_text(content, encoding='utf-8')
print("Fixed BatchMarkerEditor.tsx")

print("\n=== All commented code fixed ===")
