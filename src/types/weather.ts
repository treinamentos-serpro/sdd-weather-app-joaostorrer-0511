export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface CitySearchResult {
  id: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface ForecastDay {
  day: string;
  date: string;
  icon: string;
  condition: string;
  highCelsius?: number;
  lowCelsius?: number;
  precipitationProbability?: number;
}

export interface WeatherCity {
  id: string;
  name: string;
  region?: string;
  country?: string;
  currentAvailable: boolean;
  localDate: string;
  updatedAt: string;
  icon: string;
  condition: string;
  temperatureCelsius?: number;
  humidity?: number;
  windKph?: number;
  precipitationMm?: number;
  pressureHpa?: number;
  forecast: ForecastDay[];
}
