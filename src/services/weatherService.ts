import type { CitySearchResult, ForecastDay, WeatherCity } from '../types/weather';
import { describeWeatherCode } from '../utils/weatherCode';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Resposta meteorológica inválida: ${key}`);
  }
  return value;
}

function optionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readOptionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  return optionalFiniteNumber(record[key]);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Resposta meteorológica inválida: ${key}`);
  }
  return value;
}

async function getJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });
  if (signal?.aborted) abortRequest();

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Open-Meteo respondeu com HTTP ${response.status}`);
    return (await response.json()) as unknown;
  } catch (error) {
    if (timedOut) throw new Error('Tempo limite excedido ao consultar a Open-Meteo');
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequest);
  }
}

export async function searchCities(
  query: string,
  signal?: AbortSignal,
): Promise<CitySearchResult[]> {
  const name = query.trim();
  if (!name) return [];

  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({ name, count: '5', language: 'pt', format: 'json' }).toString();
  const payload = await getJson(url, signal);
  if (!isRecord(payload)) throw new Error('Resposta de geocodificação inválida');
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) throw new Error('Resposta de geocodificação inválida');

  return payload.results.map((item: unknown) => {
    if (!isRecord(item)) throw new Error('Cidade inválida na resposta de geocodificação');
    const latitude = readNumber(item, 'latitude');
    const longitude = readNumber(item, 'longitude');
    const nameValue = readString(item, 'name');
    const id = typeof item.id === 'number' ? String(item.id) : `${latitude},${longitude}`;
    return {
      id,
      name: nameValue,
      region: typeof item.admin1 === 'string' ? item.admin1 : undefined,
      country: typeof item.country === 'string' ? item.country : undefined,
      latitude,
      longitude,
      timezone: typeof item.timezone === 'string' ? item.timezone : undefined,
    };
  });
}

function formatLocalDate(dateValue: string): string {
  const date = new Date(`${dateValue}T12:00:00Z`);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '');
}

function formatLocalDay(dateValue: string, index: number): string {
  if (index === 0) return 'Hoje';
  const date = new Date(`${dateValue}T12:00:00Z`);
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(date)
    .replace('.', '');
}

function isValidLocalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function getWeather(
  city: CitySearchResult,
  signal?: AbortSignal,
): Promise<WeatherCity> {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  }).toString();

  const payload = await getJson(url, signal);
  if (!isRecord(payload)) throw new Error('Resposta de previsão inválida');

  const current = isRecord(payload.current) ? payload.current : {};
  const daily = isRecord(payload.daily) ? payload.daily : {};
  const currentCode = readOptionalNumber(current, 'weather_code');
  const currentCondition =
    currentCode === undefined ? { condition: '—', icon: '🌡️' } : describeWeatherCode(currentCode);
  const currentTime =
    typeof current.time === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(current.time)
      ? current.time
      : undefined;

  const dates = daily.time;
  const codes = daily.weather_code;
  const highs = daily.temperature_2m_max;
  const lows = daily.temperature_2m_min;
  const precipitation = daily.precipitation_probability_max;
  const hasFiveDates =
    Array.isArray(dates) && dates.length >= 5 && dates.slice(0, 5).every(isValidLocalDate);
  const dailyDates = hasFiveDates ? (dates.slice(0, 5) as string[]) : [];
  const dailyCodes = Array.isArray(codes) ? codes : [];
  const dailyHighs = Array.isArray(highs) ? highs : [];
  const dailyLows = Array.isArray(lows) ? lows : [];
  const dailyPrecipitation = Array.isArray(precipitation) ? precipitation : [];

  const forecast: ForecastDay[] = dailyDates.map((date, index) => {
    const code = dailyCodes[index];
    const condition =
      typeof code === 'number' ? describeWeatherCode(code) : { condition: '—', icon: '🌡️' };
    return {
      day: formatLocalDay(date, index),
      date: formatLocalDate(date),
      icon: condition.icon,
      condition: condition.condition,
      highCelsius: optionalFiniteNumber(dailyHighs[index]),
      lowCelsius: optionalFiniteNumber(dailyLows[index]),
      precipitationProbability: optionalFiniteNumber(dailyPrecipitation[index]),
    };
  });

  const dateValue = currentTime?.slice(0, 10) ?? dailyDates[0];
  const timeValue = currentTime?.slice(11, 16);
  const currentDate = dateValue ? new Date(`${dateValue}T12:00:00Z`) : undefined;
  const localDate =
    currentDate && !Number.isNaN(currentDate.getTime())
      ? new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          timeZone: 'UTC',
        }).format(currentDate)
      : '—';

  return {
    id: city.id,
    name: city.name,
    region: city.region,
    country: city.country,
    localDate: `${localDate.charAt(0).toLocaleUpperCase('pt-BR')}${localDate.slice(1)}`,
    updatedAt: timeValue ? `Atualizado às ${timeValue}` : '—',
    icon: currentCondition.icon,
    condition: currentCondition.condition,
    temperatureCelsius: readOptionalNumber(current, 'temperature_2m'),
    humidity: readOptionalNumber(current, 'relative_humidity_2m'),
    windKph: readOptionalNumber(current, 'wind_speed_10m'),
    precipitationMm: readOptionalNumber(current, 'precipitation'),
    pressureHpa: readOptionalNumber(current, 'surface_pressure'),
    forecast,
  };
}
