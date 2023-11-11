export const formatTime = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
) => {
  return new Date(timestamp).toLocaleTimeString('UTC', {
    timeZone: 'UTC',
    hour: timestamp >= 60 * 60 * 1000 ? '2-digit' : undefined,
    minute: '2-digit',
    second: '2-digit',
    ...options,
  });
};
