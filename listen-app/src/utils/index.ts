export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // Pad seconds with a leading zero if they are less than 10 (e.g., 5 becomes 05)
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
