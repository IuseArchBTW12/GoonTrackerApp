/**
 * Format duration in seconds to a human-readable string
 * Shows hours:minutes:seconds for longer durations
 * Shows minutes:seconds for medium durations
 * Shows seconds for short durations
 */
export function formatDuration(seconds: number, compact = false): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (compact) {
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}s`;
}

/**
 * Format duration in seconds to minutes with decimal
 * Used for displaying total time in analytics
 */
export function formatDurationToMinutes(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = seconds / 60;
  return minutes % 1 === 0 ? `${Math.floor(minutes)} min` : `${minutes.toFixed(1)} min`;
}
