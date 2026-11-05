import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { CitySearchResult } from '../../src/types/weather';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('weatherService', () => {
  it('queries geocoding and normalizes city results', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities('São Paulo');

    expect(cities).toEqual([
      {
        id: '3448439',
        name: 'São Paulo',
        region: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
    ]);
    const [requestUrl] = fetchMock.mock.calls[0];
    const url = new URL(String(requestUrl));
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(url.searchParams.get('count')).toBe('5');
    expect(url.searchParams.get('language')).toBe('pt');
    expect(url.searchParams.get('format')).toBe('json');
  });

  it('requests and normalizes current weather plus five daily forecasts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        current: {
          time: '2026-11-05T09:41',
          temperature_2m: 22,
          relative_humidity_2m: 67,
          wind_speed_10m: 12,
          surface_pressure: 1017,
          precipitation: 0.2,
          weather_code: 1,
        },
        daily: {
          time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
          weather_code: [1, 0, 80, 61, 3],
          temperature_2m_max: [24, 25, 22, 20, 21],
          temperature_2m_min: [16, 16, 15, 14, 14],
          precipitation_probability_max: [20, 10, 60, 55, 0],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const city: CitySearchResult = {
      id: '3448439',
      name: 'São Paulo',
      region: 'São Paulo',
      country: 'Brasil',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    };

    const weather = await getWeather(city);

    expect(weather.temperatureCelsius).toBe(22);
    expect(weather.currentAvailable).toBe(true);
    expect(weather.humidity).toBe(67);
    expect(weather.precipitationMm).toBe(0.2);
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toMatchObject({
      day: 'Hoje',
      highCelsius: 24,
      lowCelsius: 16,
      precipitationProbability: 20,
      condition: 'Predominantemente limpo',
    });

    const [requestUrl] = fetchMock.mock.calls[0];
    const url = new URL(String(requestUrl));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('current')).toContain('weather_code');
    expect(url.searchParams.get('daily')).toContain('precipitation_probability_max');
  });

  it('returns an empty result without requesting geocoding for a blank query', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unsuccessful API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)));

    await expect(searchCities('Curitiba')).rejects.toThrow('HTTP 503');
  });

  it('surfaces geocoding network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));

    await expect(searchCities('Curitiba')).rejects.toThrow('Network unavailable');
  });

  it('rejects malformed geocoding JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{ invalid json')));

    await expect(searchCities('Curitiba')).rejects.toThrow(SyntaxError);
  });

  it('preserves usable current data when optional weather fields are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          current: { temperature_2m: 18.5, time: '2026-11-05T10:00' },
          daily: { time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'] },
        }),
      ),
    );
    const city: CitySearchResult = {
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };

    const weather = await getWeather(city);

    expect(weather.temperatureCelsius).toBe(18.5);
    expect(weather.currentAvailable).toBe(false);
    expect(weather.humidity).toBeUndefined();
    expect(weather.windKph).toBeUndefined();
    expect(weather.region).toBeUndefined();
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0].highCelsius).toBeUndefined();
    expect(weather.forecast[0].condition).toBe('—');
  });

  it('aborts a request that exceeds the network timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, options?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );

    const request = searchCities('Curitiba');
    const rejection = expect(request).rejects.toThrow('Tempo limite excedido');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
  });

  it('surfaces forecast HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)));
    const city: CitySearchResult = {
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };

    await expect(getWeather(city)).rejects.toThrow('HTTP 503');
  });

  it('surfaces forecast network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Forecast network unavailable')),
    );
    const city: CitySearchResult = {
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };

    await expect(getWeather(city)).rejects.toThrow('Forecast network unavailable');
  });

  it('rejects malformed forecast JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{ invalid json')));
    const city: CitySearchResult = {
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };

    await expect(getWeather(city)).rejects.toThrow(SyntaxError);
  });

  it('aborts a forecast request that exceeds the network timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, options?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    const city: CitySearchResult = {
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };

    const request = getWeather(city);
    const rejection = expect(request).rejects.toThrow('Tempo limite excedido');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
  });

  it('does not present malformed forecast dates as valid days', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          current: { time: '2026-02-31T99:99', temperature_2m: 18 },
          daily: { time: ['2026-02-31', 'bad', '2026-03-02', '2026-03-03', '2026-03-04'] },
        }),
      ),
    );
    const city: CitySearchResult = {
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    };

    const weather = await getWeather(city);

    expect(weather.temperatureCelsius).toBe(18);
    expect(weather.localDate).toBe('—');
    expect(weather.updatedAt).toBe('—');
    expect(weather.forecast).toEqual([]);
  });

  it('preserves a valid forecast when the current weather object is null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          current: null,
          daily: {
            time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
            weather_code: [1, 0, 80, 61, 3],
            temperature_2m_max: [24, 25, 22, 20, 21],
            temperature_2m_min: [16, 16, 15, 14, 14],
            precipitation_probability_max: [20, 10, 60, 55, 0],
          },
        }),
      ),
    );

    const weather = await getWeather({
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    });

    expect(weather.currentAvailable).toBe(false);
    expect(weather.temperatureCelsius).toBeUndefined();
    expect(weather.forecast).toHaveLength(5);
  });

  it('rejects duplicate, out-of-order, or gapped dates as a five-day forecast', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          current: { time: '2026-11-05T09:41', temperature_2m: 22, weather_code: 0 },
          daily: {
            time: ['2026-11-05', '2026-11-06', '2026-11-06', '2026-11-08', '2026-11-09'],
          },
        }),
      ),
    );

    const weather = await getWeather({
      id: '1',
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
    });

    expect(weather.currentAvailable).toBe(true);
    expect(weather.forecast).toEqual([]);
  });
});
