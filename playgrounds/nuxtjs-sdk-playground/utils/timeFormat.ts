export function humanizeOffset(seconds: number): string {
  const absoluteSeconds = Math.max(0, Math.floor(Math.abs(seconds)));

  if (absoluteSeconds < 60) {
    return `${absoluteSeconds}s`;
  }

  if (absoluteSeconds < 3600) {
    return `${Math.floor(absoluteSeconds / 60)}m`;
  }

  return `${Math.floor(absoluteSeconds / 3600)}h`;
}

export function formatUnixTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

export function formatHHMMSS(seconds: number): string {
  const clampedSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const remainingSeconds = clampedSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}