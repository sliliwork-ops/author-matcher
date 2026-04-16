import { CheckCircle, Calendar, BookOpen, RotateCcw, ExternalLink } from 'lucide-react';
import { Book } from '@/lib/quiz-data';
import { FormData } from './QuizForm';

interface QuizSuccessProps {
  formData: FormData;
  book: Book;
  onRestart: () => void;
}

export default function QuizSuccess({ formData, book, onRestart }: QuizSuccessProps) {
  return (
    <div className="w-full max-w-xl mx-auto pb-20">
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[hsl(var(--hero-light))] flex items-center justify-center">
          <CheckCircle size={28} className="text-[hsl(var(--hero-bg))]" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground text-center mb-4 leading-snug">
        ✅ Заявка принята
      </h2>
      <p className="text-sm text-muted-foreground font-body text-center leading-relaxed mb-4 max-w-md mx-auto">
        Редактор свяжется в течение 2 часов в рабочее время (10:00–19:00 МСК).
      </p>
      <p className="text-sm text-muted-foreground font-body text-center leading-relaxed mb-8 max-w-md mx-auto">
        А пока — кейсы соавторов в Telegram-канале:
      </p>

      {/* Channel button */}
      <div className="flex justify-center mb-10">
        <a
          href="https://t.me/saraeva_lm"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-accent text-accent-foreground font-body font-semibold text-sm shadow-md hover:opacity-90 transition-all duration-200 active:scale-[0.98]"
        >
          <ExternalLink size={15} />
          Открыть канал
        </a>
      </div>

      {/* Summary Card */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-card mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <BookOpen size={15} className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-body text-muted-foreground mb-0.5">Книга</p>
              <p className="text-sm font-body font-medium text-foreground">«{book.title}»</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-3.5 h-3.5 flex-shrink-0">
              <span className="block w-1.5 h-1.5 rounded-full bg-accent mx-auto mt-1" />
            </div>
            <div>
              <p className="text-xs font-body text-muted-foreground mb-0.5">Тема</p>
              <p className="text-sm font-body font-medium text-foreground">{formData.topic}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-start gap-3">
            <Calendar size={15} className="text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-body text-muted-foreground mb-0.5">Срок издания книги</p>
              <p className="text-sm font-body font-medium text-foreground">{book.publishDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restart */}
      <div className="flex justify-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw size={14} />
          Вернуться к проектам
        </button>
      </div>
    </div>
  );
}
