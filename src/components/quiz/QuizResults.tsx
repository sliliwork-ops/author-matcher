import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Mail } from 'lucide-react';
import { z } from 'zod';
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

// ─── PLACEHOLDERS ─────────────────────────────────────────────
const WEBHOOK_URL = 'REPLACE_WITH_WEBHOOK_URL';
const PRIVACY_POLICY_URL = 'REPLACE_WITH_PRIVACY_POLICY_URL';
const USER_AGREEMENT_URL = 'REPLACE_WITH_USER_AGREEMENT_URL';
const TG_BOT_URL_PREFIX = 'https://t.me/litAgentLS_bot?start=quiz_';
const MAX_URL = 'https://max.ru/u/f9LHodD0cOJF8s4Orzg-6Vt6TZqUsl45AdY4q3T02maycfiRkQkmLI-poMM';

const emailSchema = z.string().trim().email({ message: 'Введите корректный email' }).max(255);

function getUtm() {
  if (typeof window === 'undefined') return { utm_source: null, utm_medium: null, utm_campaign: null };
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source'),
    utm_medium: p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
  };
}

async function postWebhook(payload: Record<string, unknown>) {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
  } catch {
    // silent fail — analytics shouldn't block UX
  }
}

function ConsentCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onChange} className="flex items-start gap-3 text-left group w-full">
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center ${
          checked ? 'bg-accent border-accent scale-110' : 'border-border group-hover:border-accent/50'
        }`}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="text-sm font-body text-muted-foreground leading-relaxed">{children}</span>
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
          <span className="w-full inline-block">
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
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [consentPD, setConsentPD] = useState(false);

  // Email block state
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const { primaryBook, topics } = result;

  useEffect(() => {
    let cancelled = false;
    setInsightLoading(true);
    setAiInsight(null);

    async function fetchInsight() {
      try {
        const { data, error } = await supabase.functions.invoke('generate-insight', { body: { answers } });
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

  const hasStructured = !aiInsight?.fromFallback && aiInsight && !!aiInsight.primaryBookTitle;

  const displayBook = useMemo(() => {
    if (hasStructured && aiInsight?.primaryBookTitle) {
      const aiTitle = aiInsight.primaryBookTitle.toLowerCase();
      const found = BOOKS.find(
        (b) => b.title.toLowerCase().includes(aiTitle) || aiTitle.includes(b.title.toLowerCase())
      );
      return found || primaryBook;
    }
    return primaryBook;
  }, [aiInsight, hasStructured, primaryBook]);

  const displayTopics: TopicCard[] = aiInsight?.topics?.length
    ? (aiInsight.topics as TopicCard[])
    : topics;

  const niche = Array.isArray(answers.q1) ? answers.q1.join(', ') : (answers.q1 || '');
  const selectedTheme = selectedTopics.length > 0 ? selectedTopics.join(', ') : (displayTopics[0]?.title || '');
  const TOOLTIP_TEXT = 'Поставьте галочку согласия';

  async function handleEmailSubmit() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!consentPD) {
      toast.error(TOOLTIP_TEXT);
      return;
    }
    setEmailSubmitting(true);
    const utm = getUtm();
    await postWebhook({
      event: 'email_submitted',
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      email: parsed.data,
      marketing_consent: marketingConsent,
      niche,
      themes: displayTopics.map((t) => t.title),
      selected_theme: selectedTopics.length > 0 ? selectedTheme : null,
      book_title: displayBook.title,
      ...utm,
    });
    setEmailSubmitting(false);
    setEmailSubmitted(true);
  }

  function handleTelegramCta() {
    if (!consentPD) return;
    postWebhook({
      event: 'cta_bot_click',
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      email,
      selected_theme: selectedTheme,
      action: 'bot_tg',
    });
    window.open(`${TG_BOT_URL_PREFIX}${sessionId}`, '_blank');
  }

  async function handleMaxCta() {
    if (!consentPD) return;
    const msg = `Здравствуйте! Прошла квиз, у меня тема: ${selectedTheme}. Ниша: ${niche}. Хочу обсудить соавторство.`;
    try {
      await navigator.clipboard.writeText(msg);
      toast.success('✅ Текст скопирован. Вставьте в чат с редактором');
    } catch {
      toast.error('Не удалось скопировать текст');
    }
    postWebhook({
      event: 'cta_bot_click',
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      email,
      selected_theme: selectedTheme,
      action: 'max',
    });
    setTimeout(() => window.open(MAX_URL, '_blank'), 500);
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-xl mx-auto pb-24">
        {/* ── BLOCK 1: RESULT ──────────────────────────────── */}
        <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground mb-4">
          Книга, в которой вы можете стать соавтором уже в{' '}
          <span className="font-bold text-accent normal-case text-base">{displayBook.publishDate}</span>
        </p>

        <div className="flex gap-4 mb-2">
          <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden shadow-md">
            {displayBook.coverImage ? (
              <img src={displayBook.coverImage} alt={displayBook.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center p-1.5">
                <span className="font-display text-[8px] font-bold text-accent-foreground text-center leading-tight uppercase tracking-wide line-clamp-4">
                  {displayBook.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-0">
              «{displayBook.title}»
            </h2>
          </div>
        </div>

        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
          {displayBook.description}
        </p>

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

        <div className="w-12 h-0.5 bg-[hsl(var(--hero-bg))] mb-8" />

        {/* ── Topics ─────────────────────────────────────── */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-0.5">Выберите тему вашей главы</h3>
          <p className="font-body text-xs text-muted-foreground mb-5">Можно выбрать одну или две</p>

          <div className="flex flex-col gap-2.5 mb-2">
            {insightLoading
              ? [0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)
              : displayTopics.map((topic, i) => (
                  <TopicCardComponent
                    key={i}
                    topic={topic}
                    selected={selectedTopics.includes(topic.title)}
                    onClick={() => toggleTopic(topic.title)}
                  />
                ))}
          </div>
        </div>

        {/* ── BLOCK 3: PD CONSENT (placed before email so it gates it) ── */}
        <div className="mb-6">
          <ConsentCheckbox checked={consentPD} onChange={() => setConsentPD((v) => !v)}>
            Я согласен(на) на обработку персональных данных и принимаю{' '}
            <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity">
              Политику обработки ПД
            </a>{' '}
            и{' '}
            <a href={USER_AGREEMENT_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity">
              Пользовательское соглашение
            </a>
            .
          </ConsentCheckbox>
        </div>

        {/* ── BLOCK 2: EMAIL CAPTURE ─────────────────────── */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold text-foreground mb-1">Получить концепцию книги на почту</h3>
          <p className="font-body text-xs text-muted-foreground mb-4">
            Персональный разбор: тема, структура, для кого подойдёт и как усилит вашу экспертность
          </p>

          {!emailSubmitted ? (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 rounded-xl border border-border bg-background px-4 font-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <DisableableButton
                  onClick={handleEmailSubmit}
                  disabled={!consentPD || emailSubmitting}
                  tooltipText={!consentPD ? TOOLTIP_TEXT : undefined}
                  className={`h-12 px-5 rounded-xl font-body font-bold text-sm transition-all duration-200 active:scale-[0.98] text-white ${
                    consentPD && !emailSubmitting
                      ? 'bg-[#2D5016] hover:bg-[#1A3A0E]'
                      : 'bg-[#2D5016]/40 cursor-not-allowed'
                  }`}
                >
                  {emailSubmitting ? 'Отправка…' : 'Отправить концепцию'}
                </DisableableButton>
              </div>

              <button
                type="button"
                onClick={() => setMarketingConsent((v) => !v)}
                className="flex items-start gap-2.5 text-left group w-full"
              >
                <span
                  className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                    marketingConsent ? 'bg-accent border-accent' : 'border-border group-hover:border-accent/50'
                  }`}
                >
                  {marketingConsent && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="font-body leading-relaxed" style={{ fontSize: '14px', color: '#6B7280' }}>
                  Хочу получать полезные материалы о книгах и экспертности
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3">
              <Check size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-foreground leading-relaxed">
                Концепция будет отправлена в течение 15 минут
              </p>
            </div>
          )}
        </div>

        {/* ── BLOCK 4: CTA (visible only after email submitted) ── */}
        {emailSubmitted && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <DisableableButton
              onClick={handleTelegramCta}
              disabled={!consentPD}
              tooltipText={TOOLTIP_TEXT}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-body font-bold text-base tracking-wide transition-all duration-200 active:scale-[0.98] text-white ${
                consentPD ? 'bg-[#E67E22] hover:bg-[#CF6E19] shadow-lg' : 'bg-[#E67E22]/40 cursor-not-allowed'
              }`}
            >
               Обсудить тему с редактором
            </DisableableButton>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleMaxCta}
                disabled={!consentPD}
                className="font-body underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '14px', color: '#9CA3AF' }}
                onMouseEnter={(e) => { if (consentPD) e.currentTarget.style.color = '#6B7280'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              >
                Нет Telegram? Написать в MAX
              </button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
