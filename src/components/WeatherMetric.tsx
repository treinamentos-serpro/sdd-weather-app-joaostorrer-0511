interface WeatherMetricProps {
  icon: string;
  label: string;
  value: string;
}

export default function WeatherMetric({ icon, label, value }: WeatherMetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/[0.12] px-3 py-3 sm:px-4">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-lg"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-100 sm:text-base">{value}</p>
      </div>
    </div>
  );
}
