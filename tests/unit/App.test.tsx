import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockOpenMeteo(
  forecastStatus: number | number[] = 200,
  geocodingStatus: number | number[] = 200,
) {
  let forecastRequestCount = 0;
  let geocodingRequestCount = 0;
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.hostname === 'geocoding-api.open-meteo.com' && url.pathname === '/v1/search') {
      const cityName = url.searchParams.get('name') ?? 'Curitiba';
      const responseStatus = Array.isArray(geocodingStatus)
        ? (geocodingStatus[geocodingRequestCount++] ?? geocodingStatus.at(-1) ?? 200)
        : geocodingStatus;
      if (responseStatus !== 200) return jsonResponse({}, responseStatus);
      if (cityName === 'Sem resultados') return jsonResponse({ results: [] });
      return jsonResponse({
        results: [
          {
            id: 1,
            name: cityName,
            admin1: 'Paraná',
            country: 'Brasil',
            latitude: -25.43,
            longitude: -49.27,
            timezone: 'America/Sao_Paulo',
          },
        ],
      });
    }

    if (url.hostname === 'api.open-meteo.com' && url.pathname === '/v1/forecast') {
      const responseStatus = Array.isArray(forecastStatus)
        ? (forecastStatus[forecastRequestCount++] ?? forecastStatus.at(-1) ?? 200)
        : forecastStatus;
      return jsonResponse(
        {
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
        },
        responseStatus,
      );
    }
    throw new Error(`Endpoint inesperado no mock do App: ${url.origin}${url.pathname}`);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function mockWeatherPayload(payload: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === 'geocoding-api.open-meteo.com' && url.pathname === '/v1/search') {
        return jsonResponse({
          results: [
            {
              id: 1,
              name: 'Curitiba',
              admin1: 'Paraná',
              country: 'Brasil',
              latitude: -25.43,
              longitude: -49.27,
            },
          ],
        });
      }
      if (url.hostname === 'api.open-meteo.com' && url.pathname === '/v1/forecast') {
        return jsonResponse(payload);
      }
      throw new Error(`Endpoint inesperado no mock do App: ${url.origin}${url.pathname}`);
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

async function searchAndSelectCity(user: ReturnType<typeof userEvent.setup>, city: string) {
  await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), city);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  await user.click(await screen.findByRole('button', { name: new RegExp(city) }));
}

describe('Weather App interface', () => {
  it('starts without fabricated weather and invites a city search', () => {
    render(<App />);

    expect(screen.getByText(/Busque uma cidade para consultar/)).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeInTheDocument();
  });

  it('searches Open-Meteo and displays current conditions and five forecast days', async () => {
    const user = userEvent.setup();
    const fetchMock = mockOpenMeteo();
    render(<App />);

    await searchAndSelectCity(user, 'Curitiba');

    expect(await screen.findByRole('heading', { name: /Curitiba/ })).toBeInTheDocument();
    const currentWeather = screen.getByRole('region', { name: /Curitiba/ });
    expect(within(currentWeather).getByText('22°C')).toBeInTheDocument();
    expect(within(currentWeather).getByText('0.2 mm')).toBeInTheDocument();
    expect(within(currentWeather).getByText('67%')).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Próximos dias' })).getAllByRole('article'),
    ).toHaveLength(5);
    expect(screen.getByText('20% chance de chuva')).toBeInTheDocument();

    const [geocodingUrl] = fetchMock.mock.calls[0];
    const searchUrl = new URL(String(geocodingUrl));
    expect(searchUrl.searchParams.get('name')).toBe('Curitiba');
    expect(searchUrl.searchParams.get('count')).toBe('5');
  });

  it('updates current and forecast temperatures when switching units', async () => {
    const user = userEvent.setup();
    mockOpenMeteo();
    render(<App />);

    await searchAndSelectCity(user, 'Curitiba');
    await screen.findByRole('heading', { name: /Curitiba/ });
    await user.click(screen.getByRole('button', { name: '°F' }));

    const currentWeather = screen.getByRole('region', { name: /Curitiba/ });
    expect(within(currentWeather).getByText('72°F')).toBeInTheDocument();
    expect(screen.getByText('75°F')).toBeInTheDocument();
    expect(screen.getByText('10% chance de chuva')).toBeInTheDocument();
  });

  it('recovers from a forecast request failure when retried', async () => {
    const user = userEvent.setup();
    mockOpenMeteo([503, 200]);
    render(<App />);

    await searchAndSelectCity(user, 'Curitiba');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a previsão',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('region', { name: /Curitiba/ })).toHaveTextContent('22°C');
  });

  it('shows an empty search result and allows another search', async () => {
    const user = userEvent.setup();
    mockOpenMeteo();
    render(<App />);

    const searchbox = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(searchbox, 'Sem resultados');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');

    await user.clear(searchbox);
    await user.type(searchbox, 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Curitiba/ }));

    expect(await screen.findByRole('heading', { name: /Curitiba/ })).toBeInTheDocument();
  });

  it('reports a geocoding failure and keeps the search available for retry', async () => {
    const user = userEvent.setup();
    mockOpenMeteo(200, [503, 200]);
    render(<App />);

    const searchbox = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(searchbox, 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível buscar cidades');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /Curitiba/ }));
    expect(await screen.findByRole('region', { name: /Curitiba/ })).toHaveTextContent('22°C');
  });

  it('renders em dashes for missing current and daily measurements', async () => {
    const user = userEvent.setup();
    mockWeatherPayload({
      current: { time: '2026-11-05T09:41', weather_code: 1 },
      daily: {
        time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
        weather_code: [1, 0, 80, 61, 3],
      },
    });
    render(<App />);

    await searchAndSelectCity(user, 'Curitiba');
    const currentWeather = screen.getByRole('region', { name: /Curitiba/ });
    expect(await within(currentWeather).findAllByText('—')).toHaveLength(5);

    const firstForecastDay = within(
      screen.getByRole('region', { name: 'Próximos dias' }),
    ).getAllByRole('article')[0];
    expect(within(firstForecastDay).getAllByText('—')).toHaveLength(3);
  });

  it('keeps current conditions visible when all forecast dates are unavailable', async () => {
    const user = userEvent.setup();
    mockWeatherPayload({
      current: {
        time: '2026-11-05T09:41',
        temperature_2m: 22,
        relative_humidity_2m: 67,
        wind_speed_10m: 12,
        surface_pressure: 1017,
        precipitation: 0.2,
        weather_code: 1,
      },
      daily: {},
    });
    render(<App />);

    await searchAndSelectCity(user, 'Curitiba');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'A previsão de cinco dias está indisponível',
    );
    expect(screen.getByRole('region', { name: /Curitiba/ })).toHaveTextContent('22°C');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  it('keeps city results keyboard reachable while focus moves inside the search form', async () => {
    const user = userEvent.setup();
    mockOpenMeteo();
    render(<App />);
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    await user.type(searchbox, 'Curitiba');
    await user.keyboard('{Enter}');
    const cityOption = await screen.findByRole('button', { name: /Curitiba/ });
    await user.tab();
    await user.tab();

    expect(cityOption).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('region', { name: /Curitiba/ })).toHaveTextContent('22°C');
  });

  it('does not replace newer city results with an older delayed search response', async () => {
    const user = userEvent.setup();
    let resolveOldSearch: (response: Response) => void = () => {};
    const oldSearchResponse = new Promise<Response>((resolve) => {
      resolveOldSearch = resolve;
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === 'geocoding-api.open-meteo.com' && url.pathname === '/v1/search') {
        const name = url.searchParams.get('name');
        if (name === 'Curitiba') return oldSearchResponse;
        if (name === 'Lisboa') {
          return Promise.resolve(
            jsonResponse({
              results: [
                {
                  id: 2,
                  name: 'Lisboa',
                  admin1: 'Lisboa',
                  country: 'Portugal',
                  latitude: 38.72,
                  longitude: -9.14,
                },
              ],
            }),
          );
        }
      }
      throw new Error(`Endpoint inesperado no mock do App: ${url.origin}${url.pathname}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);

    const searchbox = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(searchbox, 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('Buscando cidades...')).toBeInTheDocument();

    await user.clear(searchbox);
    await user.type(searchbox, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('button', { name: /Lisboa.*Portugal/ })).toBeInTheDocument();

    await act(async () => {
      resolveOldSearch(
        jsonResponse({
          results: [
            {
              id: 1,
              name: 'Curitiba',
              admin1: 'Paraná',
              country: 'Brasil',
              latitude: -25.43,
              longitude: -49.27,
            },
          ],
        }),
      );
    });

    expect(screen.getByRole('button', { name: /Lisboa.*Portugal/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Curitiba.*Brasil/ })).not.toBeInTheDocument();
  });

  it('does not display an older city forecast after a newer city has loaded', async () => {
    const user = userEvent.setup();
    let resolveOldForecast: (response: Response) => void = () => {};
    const oldForecastResponse = new Promise<Response>((resolve) => {
      resolveOldForecast = resolve;
    });
    const dates = ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'];
    const makeForecast = (temperature: number) =>
      jsonResponse({
        current: {
          time: '2026-11-05T09:41',
          temperature_2m: temperature,
          relative_humidity_2m: 60,
          wind_speed_10m: 8,
          surface_pressure: 1015,
          precipitation: 0,
          weather_code: 0,
        },
        daily: {
          time: dates,
          weather_code: [0, 0, 0, 0, 0],
          temperature_2m_max: [temperature, temperature, temperature, temperature, temperature],
          temperature_2m_min: [
            temperature - 5,
            temperature - 5,
            temperature - 5,
            temperature - 5,
            temperature - 5,
          ],
          precipitation_probability_max: [0, 0, 0, 0, 0],
        },
      });
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === 'geocoding-api.open-meteo.com' && url.pathname === '/v1/search') {
        const name = url.searchParams.get('name') ?? '';
        const isLisboa = name === 'Lisboa';
        return Promise.resolve(
          jsonResponse({
            results: [
              {
                id: isLisboa ? 2 : 1,
                name,
                admin1: isLisboa ? 'Lisboa' : 'Paraná',
                country: isLisboa ? 'Portugal' : 'Brasil',
                latitude: isLisboa ? 38.72 : -25.43,
                longitude: isLisboa ? -9.14 : -49.27,
              },
            ],
          }),
        );
      }
      if (url.hostname === 'api.open-meteo.com' && url.pathname === '/v1/forecast') {
        if (url.searchParams.get('latitude') === '-25.43') return oldForecastResponse;
        if (url.searchParams.get('latitude') === '38.72') return Promise.resolve(makeForecast(18));
      }
      throw new Error(`Endpoint inesperado no mock do App: ${url.origin}${url.pathname}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);

    await searchAndSelectCity(user, 'Curitiba');
    expect(await screen.findByText(/Carregando previsão para Curitiba/)).toBeInTheDocument();
    await searchAndSelectCity(user, 'Lisboa');
    expect(await screen.findByRole('region', { name: /Lisboa/ })).toHaveTextContent('18°C');

    await act(async () => {
      resolveOldForecast(makeForecast(22));
    });

    expect(screen.getByRole('region', { name: /Lisboa/ })).toHaveTextContent('18°C');
    expect(screen.queryByRole('heading', { name: /Curitiba/ })).not.toBeInTheDocument();
  });
});
