import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../src/utils/temperature';

describe('temperature utilities', () => {
  it('converts Celsius to Fahrenheit for common and negative values', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(22, 'fahrenheit')).toBe(72);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('keeps Celsius values rounded to whole degrees', () => {
    expect(convertTemperature(18.6, 'celsius')).toBe(19);
  });

  it('formats the value together with its selected unit', () => {
    expect(formatTemperature(22, 'celsius')).toBe('22°C');
    expect(formatTemperature(22, 'fahrenheit')).toBe('72°F');
  });

  it('uses an em dash for missing or non-finite temperatures', () => {
    expect(formatTemperature(undefined, 'celsius')).toBe('—');
    expect(formatTemperature(Number.NaN, 'fahrenheit')).toBe('—');
  });
});
