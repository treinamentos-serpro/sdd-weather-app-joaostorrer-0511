import type { TemperatureUnit } from '../types/weather';

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
}

export function formatTemperature(
  celsius: number | null | undefined,
  unit: TemperatureUnit,
): string {
  if (typeof celsius !== 'number' || !Number.isFinite(celsius)) return '—';
  const value = convertTemperature(celsius, unit);
  return `${value}°${unit === 'celsius' ? 'C' : 'F'}`;
}
