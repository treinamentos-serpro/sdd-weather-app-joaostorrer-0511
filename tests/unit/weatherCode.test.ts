import { describe, expect, it } from 'vitest';
import { describeWeatherCode } from '../../src/utils/weatherCode';

describe('weather condition descriptions', () => {
  it.each([
    [0, 'Céu limpo'],
    [3, 'Nublado'],
    [45, 'Neblina'],
    [61, 'Chuva'],
    [71, 'Neve'],
    [95, 'Trovoada'],
  ])('describes WMO code %i', (code, condition) => {
    expect(describeWeatherCode(code).condition).toBe(condition);
    expect(describeWeatherCode(code).icon).not.toBe('');
  });

  it('provides a readable fallback for unknown codes', () => {
    expect(describeWeatherCode(999)).toEqual({
      condition: 'Condição indisponível',
      icon: '🌡️',
    });
  });
});
