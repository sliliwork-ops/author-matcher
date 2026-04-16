import { Check } from 'lucide-react';
import { TopicCard as ITopicCard } from '@/lib/quiz-logic';

interface TopicCardProps {
  topic: ITopicCard;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const labelMap: Record<ITopicCard['labelColor'], string> = {
  expert: 'Для экспертности',
  client: 'Для клиентов',
  brand: 'Для личного бренда',
};

export default function TopicCardComponent({ topic, selected, disabled, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 ${
        selected
          ? 'border-[hsl(var(--hero-bg))] bg-[hsl(var(--hero-light))]'
          : disabled
          ? 'border-border bg-card opacity-40 cursor-not-allowed'
          : 'border-border bg-card hover:border-[hsl(var(--hero-bg))]/40 hover:bg-[hsl(var(--hero-light))]'
      }`}
    >
      {/* Checkbox circle */}
      <span
        className={`mt-0.5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
          selected
            ? 'border-[hsl(var(--hero-bg))] bg-[hsl(var(--hero-bg))]'
            : 'border-muted-foreground/30 bg-transparent'
        }`}
        style={{ width: '18px', height: '18px', minWidth: '18px' }}
      >
        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`font-body text-sm leading-snug transition-colors ${selected ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
          {topic.title}
        </p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">
          {labelMap[topic.labelColor]}
        </p>
      </div>
    </button>
  );
}
