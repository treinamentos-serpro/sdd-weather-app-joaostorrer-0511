import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities as searchCitiesService } from '../services/weatherService';
import type { CitySearchResult, TemperatureUnit, WeatherCity } from '../types/weather';

type SearchStatus = 'idle' | 'loading' | 'results' | 'empty' | 'error';
type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

export default function useWeather() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [searchError, setSearchError] = useState('');
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);
  const [weather, setWeather] = useState<WeatherCity | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('idle');
  const [weatherError, setWeatherError] = useState('');
  const searchController = useRef<AbortController | null>(null);
  const weatherController = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      searchController.current?.abort();
      weatherController.current?.abort();
    },
    [],
  );

  async function search(query: string) {
    searchController.current?.abort();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setSearchResults([]);
      setSearchStatus('idle');
      setSearchError('');
      return;
    }

    const controller = new AbortController();
    searchController.current = controller;
    setSearchStatus('loading');
    setSearchResults([]);
    setSearchError('');
    try {
      const results = await searchCitiesService(normalizedQuery, controller.signal);
      if (controller.signal.aborted) return;
      setSearchResults(results);
      setSearchStatus(results.length ? 'results' : 'empty');
    } catch {
      if (controller.signal.aborted) return;
      setSearchError('Não foi possível buscar cidades. Tente novamente.');
      setSearchStatus('error');
    }
  }

  async function loadWeather(city: CitySearchResult) {
    weatherController.current?.abort();
    const controller = new AbortController();
    weatherController.current = controller;
    setSelectedCity(city);
    setWeather(null);
    setWeatherStatus('loading');
    setWeatherError('');
    try {
      const result = await getWeather(city, controller.signal);
      if (controller.signal.aborted) return;
      setWeather(result);
      setWeatherStatus('success');
    } catch {
      if (controller.signal.aborted) return;
      setWeatherError('Não foi possível carregar a previsão. Tente novamente.');
      setWeatherStatus('error');
    }
  }

  function selectCity(city: CitySearchResult) {
    searchController.current?.abort();
    setSearchStatus('idle');
    setSearchResults([]);
    void loadWeather(city);
  }

  function retryWeather() {
    if (selectedCity) void loadWeather(selectedCity);
  }

  return {
    unit,
    setUnit,
    search,
    searchStatus,
    searchResults,
    searchError,
    selectedCity,
    selectCity,
    weather,
    weatherStatus,
    weatherError,
    retryWeather,
  };
}
