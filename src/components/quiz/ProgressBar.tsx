interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-body text-muted-foreground">
          Вопрос {current} из {total}
        </span>
        <span className="text-xs font-body text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1 w-full bg-[hsl(var(--hero-mid))] rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
