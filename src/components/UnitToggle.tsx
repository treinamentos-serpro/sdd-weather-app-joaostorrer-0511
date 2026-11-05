import type { TemperatureUnit } from '../types/weather';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

const options: { label: string; value: TemperatureUnit }[] = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 p-1"
      role="group"
    >
      {options.map((option) => (
        <button
          aria-pressed={unit === option.value}
          className={`min-w-11 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
            unit === option.value
              ? 'bg-white text-night-900 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}