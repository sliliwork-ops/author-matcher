import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { QuizResult, TopicCard } from '@/lib/quiz-logic';
import { QuizAnswers } from '@/lib/quiz-logic';
import { Book, BOOKS } from '@/lib/quiz-data';
import TopicCardComponent from './TopicCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface QuizResultsProps {
  result: QuizResult;
  answers: QuizAnswers;
  onApply: (topic: string, book: Book) => void;
  sessionId: string;
}

interface AIInsight {
  whoYouAre: string | null;
  primaryBookTitle: string | null;
  publishDate: string | null;
  entryDeadline: string | null;
  whyThisBook: string | null;
  chapterType: string | null;
  topicAngle: string | null;
  nextStep: string | null;
  alternativeBookTitle: string | null;
  alternativeReason: string | null;
  fromFallback: boolean;
  topics?: { title: string; labelColor: string }[];
  insight?: string;
}

function ConsentCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-start gap-3 text-left group w-full"
    >
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center ${
          checked
            ? 'bg-accent border-accent scale-110'
            : 'border-border group-hover:border-accent/50'
        }`}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="text-sm font-body text-muted-foreground leading-relaxed">
        Я согласен(на) на обработку персональных данных и принимаю{' '}
        <a href="#" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity">
          Политику обработки ПД
        </a>{' '}
        и{' '}
        <a href="#" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity">
          Пользовательское соглашение
        </a>
        .
      </span>
    </button>
  );
}

function DisableableButton({
  disabled,
  tooltipText,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tooltipText?: string }) {
  if (disabled && tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="w-full">
            <button {...props} disabled className={props.className}>
              {children}
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  );
}


export default function QuizResults({ result, answers, onApply, sessionId }: QuizResultsProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [ownTopic, setOwnTopic] = useState('');
  const [showOwnTopic, setShowOwnTopic] = useState(false);
  const [showAllBooks, setShowAllBooks] = useState(false);
  const [selectedAltBook, setSelectedAltBook] = useState<Book | null>(null);
  const [altBookTopics, setAltBookTopics] = useState<TopicCard[]>([]);
  const [altBookLoading, setAltBookLoading] = useState(false);
  const [altSelectedTopics, setAltSelectedTopics] = useState<string[]>([]);
  const [accordion, setAccordion] = useState<'format' | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [discussBookId, setDiscussBookId] = useState<string | null>(null);
  const [discussText, setDiscussText] = useState('');
  const [consentPD, setConsentPD] = useState(false);

  const { primaryBook, topics } = result;

  useEffect(() => {
    let cancelled = false;
    setInsightLoading(true);
    setAiInsight(null);

    async function fetchInsight() {
      try {
        const { data, error } = await supabase.functions.invoke('generate-insight', {
          body: { answers },
        });
        if (cancelled) return;
        if (error || !data) {
          setAiInsight({ fromFallback: true, insight: null, whoYouAre: null, primaryBookTitle: null, publishDate: null, entryDeadline: null, whyThisBook: null, chapterType: null, topicAngle: null, nextStep: null, alternativeBookTitle: null, alternativeReason: null });
        } else {
          setAiInsight(data as AIInsight);
        }
      } catch {
        if (!cancelled) {
          setAiInsight({ fromFallback: true, insight: null, whoYouAre: null, primaryBookTitle: null, publishDate: null, entryDeadline: null, whyThisBook: null, chapterType: null, topicAngle: null, nextStep: null, alternativeBookTitle: null, alternativeReason: null });
        }
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    }

    fetchInsight();
    return () => { cancelled = true; };
  }, []);

  function toggleTopic(title: string) {
    setSelectedTopics((prev) => {
      if (prev.includes(title)) return prev.filter((t) => t !== title);
      if (prev.length < 2) return [...prev, title];
      return [prev[1], title];
    });
  }

  function toggleAltTopic(title: string) {
    setAltSelectedTopics((prev) => {
      if (prev.includes(title)) return prev.filter((t) => t !== title);
      if (prev.length < 2) return [...prev, title];
      return [prev[1], title];
    });
  }

  const displayTopics: TopicCard[] =
    aiInsight?.topics?.length
      ? (aiInsight.topics as TopicCard[])
      : topics;

  function handleApply() {
    const topic =
      selectedTopics.length > 0 ? selectedTopics.join(', ') : displayTopics[0].title;
    onApply(topic, displayBook);
  }

  function handleOwnTopicSubmit() {
    if (ownTopic.trim()) {
      onApply(ownTopic, displayBook);
    }
  }

  async function handleSelectBook(book: Book) {
    setSelectedAltBook(book);
    setAltBookLoading(true);
    setAltBookTopics([]);
    setAltSelectedTopics([]);
    try {
      const { data } = await supabase.functions.invoke('generate-insight', {
        body: { answers, forceBookId: book.id },
      });
      if (data?.topics?.length) {
        setAltBookTopics(data.topics as TopicCard[]);
      }
    } catch {
      // silent fail
    } finally {
      setAltBookLoading(false);
    }
  }

  function toggleAccordion(key: 'format' | null) {
    setAccordion((prev) => (prev === key ? null : key));
  }

  const ctaLabel =
    selectedTopics.length === 2 ? 'Согласовать 2 темы' : 'Согласовать тему';

  const hasStructured = !aiInsight?.fromFallback && aiInsight && !!aiInsight.primaryBookTitle;

  const displayBook = useMemo(() => {
    if (hasStructured && aiInsight?.primaryBookTitle) {
      const aiTitle = aiInsight.primaryBookTitle.toLowerCase();
      const found = BOOKS.find(
        (b) =>
          b.title.toLowerCase().includes(aiTitle) ||
          aiTitle.includes(b.title.toLowerCase())
      );
      return found || primaryBook;
    }
    return primaryBook;
  }, [aiInsight, hasStructured, primaryBook]);

  // Build message for Telegram / MAX buttons
  const niche = Array.isArray(answers.q1) ? answers.q1.join(', ') : (answers.q1 || '');
  const format = Array.isArray(answers.q4) ? answers.q4.join(', ') : (answers.q4 || '');
  const selectedTheme = selectedTopics.length > 0 ? selectedTopics.join(', ') : (displayTopics[0]?.title || '');
  const ctaMessage = `Здравствуйте! Прошла квиз, у меня тема: ${selectedTheme}. Ниша: ${niche}. Формат: ${format}. Хочу обсудить соавторство.`;

  const TOOLTIP_TEXT = 'Поставьте галочку согласия';
  const MAX_URL = 'https://max.ru/u/f9LHodD0cOJF8s4Orzg-6Vt6TZqUsl45AdY4q3T02maycfiRkQkmLI-poMM';

  function handleTelegramClick() {
    window.open('https://t.me/lili_saraeva_assistant?text=' + encodeURIComponent(ctaMessage), '_blank');
  }

  async function handleMaxClick() {
    try {
      await navigator.clipboard.writeText(ctaMessage);
      toast.success('✅ Текст темы скопирован. Вставь его в чат с редактором.', { duration: 4000 });
    } catch {
      toast.error('Не удалось скопировать текст');
    }
    setTimeout(() => {
      window.open(MAX_URL, '_blank');
    }, 500);
  }

  function handleThinkClick() {
    window.open('https://t.me/litAgentLS_bot?start=quiz_warm_' + sessionId, '_blank');
  }

  return (
    <TooltipProvider>
    <div className="w-full max-w-xl mx-auto pb-24">

      {/* ── Eyebrow ─────────────────────────────────────────── */}
      <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground mb-4">
        Книга, в которой вы можете стать соавтором уже в{' '}
        <span className="font-bold text-accent normal-case text-base">{displayBook.publishDate}</span>
      </p>

      {/* ── Book cover + title ──────────────────────────────── */}
      <div className="flex gap-4 mb-2">
        <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden shadow-md">
          {displayBook.coverImage
            ? <img src={displayBook.coverImage} alt={displayBook.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-accent flex items-center justify-center p-1.5">
                <span className="font-display text-[8px] font-bold text-accent-foreground text-center leading-tight uppercase tracking-wide line-clamp-4">
                  {displayBook.title}
                </span>
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-0">
            «{displayBook.title}»
          </h2>
        </div>
      </div>

      {/* ── Audience line ───────────────────────────────────── */}
      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
        {displayBook.description}
      </p>

      {/* ── Meta strip ──────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-body text-xs text-muted-foreground">
          <span>Срок подачи заявки на участие: <span className="font-semibold text-foreground">{displayBook.deadline}</span></span>
          <span className="opacity-30">·</span>
          <button
            onClick={() => setShowPriceDetails((v) => !v)}
            className="inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Участие: <span className="font-semibold">37 000 ₽</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showPriceDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showPriceDetails && (
          <div className="mt-3 rounded-xl border border-border bg-card px-4 py-3.5">
            <ul className="flex flex-col gap-2">
              {[
                'Глава до 15 000 знаков',
                'Профессиональная подготовка текста',
                'Юридическая проверка',
                'Вёрстка и дизайн книги',
                'Публикация и размещение более чем в 30 магазинах',
                'Фотография автора',
                'Ссылки и QR-код на ваши ресурсы и воронки',
                'Статус автора',
                '2 печатных экземпляра',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 font-body text-xs text-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="w-12 h-0.5 bg-[hsl(var(--hero-bg))] mb-8" />

      {/* ── Topics section ──────────────────────────────────── */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-foreground mb-0.5">
          Выберите тему вашей главы
        </h3>
        <p className="font-body text-xs text-muted-foreground mb-5">
          Можно выбрать одну или две
        </p>

        <div className="flex flex-col gap-2.5 mb-5">
          {insightLoading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))
            : displayTopics.map((topic, i) => (
                <TopicCardComponent
                  key={i}
                  topic={topic}
                  selected={selectedTopics.includes(topic.title)}
                  onClick={() => toggleTopic(topic.title)}
                />
              ))}
        </div>

        {/* ── Consent checkbox ──────────────────────────────── */}
        <div className="mb-5">
          <ConsentCheckbox checked={consentPD} onChange={() => setConsentPD((v) => !v)} />
        </div>

        {/* ── 3 CTA buttons ─────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Button 1 — Telegram */}
          <DisableableButton
            onClick={handleTelegramClick}
            disabled={!consentPD}
            tooltipText={TOOLTIP_TEXT}
            className={`w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-body font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] ${
              consentPD
                ? 'bg-[#E67E22] text-white shadow-lg hover:bg-[#CF6E19]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Согласовать тему с редактором в Telegram
          </DisableableButton>

          {/* Button 2 — MAX */}
          <DisableableButton
            onClick={handleMaxClick}
            disabled={!consentPD}
            tooltipText={TOOLTIP_TEXT}
            className={`w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-body font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] border-2 ${
              consentPD
                ? 'border-[#E67E22] text-[#E67E22] bg-transparent hover:bg-[#E67E22] hover:text-white'
                : 'border-muted text-muted-foreground cursor-not-allowed bg-transparent'
            }`}
          >
            Согласовать тему с редактором  в MAX
          </DisableableButton>

          {/* Button 3 — Think */}
          <DisableableButton
            onClick={handleThinkClick}
            disabled={!consentPD}
            tooltipText={TOOLTIP_TEXT}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-body font-medium text-sm tracking-wide transition-all duration-200 active:scale-[0.98] ${
              consentPD
                ? 'bg-[#9CA3AF] text-white shadow-md hover:bg-[#6B7280]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            📚 Хочу подумать
          </DisableableButton>
        </div>

        <p className="font-body text-xs text-muted-foreground text-center mt-2.5">
          Проверим, свободна ли тема, и можно ли закрепить её за вами
        </p>
      </div>

      {/* ── Own topic ───────────────────────────────────────── */}
      <div className="mb-4">
        <button
          onClick={() => setShowOwnTopic((v) => !v)}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card font-body text-sm font-medium text-foreground hover:border-accent/60 hover:bg-accent/5 transition-all duration-200"
        >
          {showOwnTopic ? 'Скрыть' : 'Предложить свою тему'}
        </button>

        {showOwnTopic && (
          <div className="mt-3 border border-border rounded-2xl p-5 bg-card">
            <h4 className="font-display text-base font-bold text-foreground mb-1">
              Напишите свою тему
            </h4>
            <p className="font-body text-xs text-muted-foreground mb-3">
              Опишите, какую тему вы хотели бы раскрыть в своей главе книги
            </p>
            <textarea
              value={ownTopic}
              onChange={(e) => setOwnTopic(e.target.value)}
              placeholder="Опишите вашу тему..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-body text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-accent mb-3 placeholder:text-muted-foreground"
            />
            <DisableableButton
              onClick={handleOwnTopicSubmit}
              disabled={!ownTopic.trim() || !consentPD}
              tooltipText={!consentPD ? TOOLTIP_TEXT : undefined}
              className="w-full px-4 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Отправить тему на согласование
            </DisableableButton>
          </div>
        )}
      </div>

      {/* ── All books ───────────────────────────────────────── */}
      <div className="mb-8">
        <button
          onClick={() => setShowAllBooks((v) => !v)}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card font-body text-sm font-medium text-foreground hover:border-accent/60 hover:bg-accent/5 transition-all duration-200"
        >
          {showAllBooks ? 'Скрыть книги' : 'Посмотреть все книги, планируемые к изданию'}
        </button>

        {showAllBooks && (
          <div className="mt-4 flex flex-col gap-3">
            {BOOKS.filter((book) => book.id !== displayBook.id).map((book) => (
              <div key={book.id} className="border border-border rounded-2xl p-4 bg-card shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex gap-3 mb-3">
                  <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden shadow-sm">
                    {book.coverImage
                      ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-accent flex items-center justify-center p-1">
                          <span className="font-display text-[7px] font-bold text-accent-foreground text-center leading-tight uppercase tracking-wide line-clamp-5">
                            {book.title}
                          </span>
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold text-foreground leading-snug">«{book.title}»</p>
                    <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 font-body text-xs text-muted-foreground">
                  <span>Срок издания: <span className="font-semibold text-foreground">{book.publishDate}</span></span>
                  <span className="opacity-30">·</span>
                  <span>Срок подачи заявки на участие: <span className="font-semibold text-foreground">{book.deadline}</span></span>
                </div>

                <DisableableButton
                  onClick={() => {
                    setDiscussBookId((prev) => (prev === book.id ? null : book.id));
                    setDiscussText('');
                  }}
                  disabled={!consentPD}
                  tooltipText={TOOLTIP_TEXT}
                  className={`mt-3 w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-body text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                    consentPD
                      ? 'bg-accent text-accent-foreground hover:opacity-90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Обсудить с редактором
                </DisableableButton>

                {discussBookId === book.id && (
                  <div className="mt-3 rounded-xl border border-border bg-background p-4">
                    <p className="font-body text-xs text-muted-foreground mb-2 leading-relaxed">
                      Напишите вашу тему или расскажите, о чём хотели бы написать — редактор свяжется с вами
                    </p>
                    <textarea
                      value={discussText}
                      onChange={(e) => setDiscussText(e.target.value)}
                      placeholder="Опишите вашу идею или вопрос..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-body text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-accent mb-3 placeholder:text-muted-foreground"
                    />
                    <DisableableButton
                      onClick={() => { if (discussText.trim()) onApply(discussText, book); }}
                      disabled={!discussText.trim() || !consentPD}
                      tooltipText={!consentPD ? TOOLTIP_TEXT : undefined}
                      className="w-full px-4 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      Отправить редактору
                    </DisableableButton>
                  </div>
                )}
                {selectedAltBook?.id === book.id && (
                  <div className="mt-4 flex flex-col gap-2.5">
                    {altBookLoading
                      ? [0, 1, 2].map((i) => (
                          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                        ))
                      : altBookTopics.map((topic, i) => (
                          <TopicCardComponent
                            key={i}
                            topic={topic}
                            selected={altSelectedTopics.includes(topic.title)}
                            onClick={() => toggleAltTopic(topic.title)}
                          />
                        ))}

                    {!altBookLoading && altBookTopics.length > 0 && (
                      <DisableableButton
                        onClick={() => {
                          const topic =
                            altSelectedTopics.length > 0
                              ? altSelectedTopics.join(', ')
                              : altBookTopics[0].title;
                          onApply(topic, book);
                        }}
                        disabled={!consentPD}
                        tooltipText={TOOLTIP_TEXT}
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-body text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                          consentPD
                            ? 'bg-accent text-accent-foreground shadow-md hover:opacity-90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {altSelectedTopics.length === 2 ? 'Согласовать 2 темы' : 'Согласовать тему'}
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </DisableableButton>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
    </TooltipProvider>
  );
}
