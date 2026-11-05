import { expect, type Page, test } from '@playwright/test';

const currentWeather = {
  time: '2026-11-05T09:41',
  temperature_2m: 22,
  relative_humidity_2m: 67,
  wind_speed_10m: 12,
  surface_pressure: 1017,
  precipitation: 0.2,
  weather_code: 1,
};

const forecast = {
  time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
  weather_code: [1, 0, 80, 61, 3],
  temperature_2m_max: [24, 25, 22, 20, 21],
  temperature_2m_min: [16, 16, 15, 14, 14],
  precipitation_probability_max: [20, 10, 60, 55, 0],
};

async function mockOpenMeteo(page: Page) {
  await page.route('https://**/*', async (route) => {
    const hostname = new URL(route.request().url()).hostname;
    if (hostname.endsWith('open-meteo.com')) {
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('name');
    if (query === 'Sem resultados') {
      await route.fulfill({ json: { results: [] } });
      return;
    }
    await route.fulfill({
      json: {
        results: [
          {
            id: 1,
            name: 'Curitiba',
            admin1: 'Paraná',
            country: 'Brasil',
            latitude: -25.43,
            longitude: -49.27,
            timezone: 'America/Sao_Paulo',
          },
          {
            id: 2,
            name: 'Curitiba',
            admin1: 'Santa Catarina',
            country: 'Brasil',
            latitude: -26.25,
            longitude: -49.58,
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: { current: currentWeather, daily: forecast } });
  });
}

async function searchAndSelectCuritiba(page: Page) {
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Curitiba');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /Curitiba.*Paraná, Brasil/ }).click();
}

test.beforeEach(async ({ page }) => {
  await mockOpenMeteo(page);
});

test('busca cidade, identifica homônimos, consulta o tempo e alterna unidade', async ({ page }) => {
  await page.goto('/');
  await searchAndSelectCuritiba(page);

  const current = page.getByRole('region', { name: /Curitiba/ });
  await expect(current.getByText('22°C')).toBeVisible();
  await expect(current.getByText('Predominantemente limpo')).toBeVisible();
  await expect(current.getByText('Atualizado às 09:41')).toBeVisible();

  const forecastRegion = page.getByRole('region', { name: 'Próximos dias' });
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);
  await expect(forecastRegion.getByText('20% chance de chuva')).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();
  await expect(current.getByText('72°F')).toBeVisible();
  await expect(forecastRegion.getByText('75°F')).toBeVisible();
  await expect(page.getByText(/\d+°C/)).toHaveCount(0);
});

test('informa quando a busca não encontra cidades e permite nova consulta', async ({ page }) => {
  await page.goto('/');
  const searchbox = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await searchbox.fill('Sem resultados');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('status')).toHaveText('Nenhuma cidade encontrada');

  await searchAndSelectCuritiba(page);
  await expect(page.getByRole('region', { name: /Curitiba/ }).getByText('22°C')).toBeVisible();
});

test('recupera a previsão após indisponibilidade temporária da API', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    if (forecastRequests === 1) {
      await route.fulfill({ status: 503, json: { reason: 'service unavailable' } });
      return;
    }
    await route.fulfill({ json: { current: currentWeather, daily: forecast } });
  });

  await page.goto('/');
  await searchAndSelectCuritiba(page);
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar a previsão');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('region', { name: /Curitiba/ }).getByText('22°C')).toBeVisible();
});

test('permite completar a consulta por teclado em viewport mobile sem overflow horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  const searchbox = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await searchbox.fill('Curitiba');
  await searchbox.press('Enter');
  const cityOption = page.getByRole('button', { name: /Curitiba.*Paraná, Brasil/ });
  await expect(cityOption).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(cityOption).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('region', { name: /Curitiba/ }).getByText('22°C')).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByRole('region', { name: /Curitiba/ }).getByText('72°F')).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
