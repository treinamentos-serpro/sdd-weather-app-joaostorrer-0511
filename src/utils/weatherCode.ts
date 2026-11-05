export interface WeatherDescription {
  condition: string;
  icon: string;
}

export function describeWeatherCode(code: number): WeatherDescription {
  if (code === 0) return { condition: 'Céu limpo', icon: '☀️' };
  if (code === 1) return { condition: 'Predominantemente limpo', icon: '🌤️' };
  if (code === 2) return { condition: 'Parcialmente nublado', icon: '⛅' };
  if (code === 3) return { condition: 'Nublado', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Neblina', icon: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Garoa', icon: '🌦️' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { condition: 'Chuva', icon: '🌧️' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Neve', icon: '🌨️' };
  if ([95, 96, 99].includes(code)) return { condition: 'Trovoada', icon: '⛈️' };
  return { condition: 'Condição indisponível', icon: '🌡️' };
}
