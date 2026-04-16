import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Book } from '@/lib/quiz-data';
import { QuizAnswers } from '@/lib/quiz-logic';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface QuizFormProps {
  selectedTopic: string;
  book: Book;
  answers: QuizAnswers;
  onBack: () => void;
  onSubmit: (data: FormData) => void;
}

export interface FormData {
  name: string;
  contact: string;
  maxWhatsapp: string;
  email: string;
  topic: string;
  comment: string;
  confirmTopicCheck: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
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
          <Check
            size={11}
            className="text-accent-foreground animate-[bounce-in_0.3s_ease-out]"
          />
        )}
      </span>
      <span className="text-sm font-body text-muted-foreground leading-relaxed">
        {children}
      </span>
    </button>
  );
}

export default function QuizForm({ selectedTopic, book, answers, onBack, onSubmit }: QuizFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contact: '',
    maxWhatsapp: '',
    email: '',
    topic: selectedTopic,
    comment: '',
    confirmTopicCheck: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const [wasJustUnlocked, setWasJustUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const prevCanSubmit = useRef(false);

  const hasAtLeastOneContact =
    !!formData.contact.trim() || !!formData.maxWhatsapp.trim() || !!formData.email.trim();

  const canSubmit =
    !!formData.name.trim() &&
    !!formData.topic.trim() &&
    formData.agreePrivacy &&
    hasAtLeastOneContact;

  useEffect(() => {
    if (canSubmit && !prevCanSubmit.current) {
      setWasJustUnlocked(true);
      const t = setTimeout(() => setWasJustUnlocked(false), 700);
      return () => clearTimeout(t);
    }
    prevCanSubmit.current = canSubmit;
  }, [canSubmit]);

  useEffect(() => {
    if (hasAtLeastOneContact) {
      setContactError('');
    }
  }, [hasAtLeastOneContact]);

  function handleChange(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!hasAtLeastOneContact) {
      setContactError('Оставьте хотя бы один способ связи');
      return;
    }
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const joinArr = (v: string | string[]) => Array.isArray(v) ? v.join(', ') : v;
      const payload = {
        question1: joinArr(answers.q1),
        question2: joinArr(answers.q2),
        question3: joinArr(answers.q4),
        question4: joinArr(answers.q5),
        question5: answers.q3,
        question6: joinArr(answers.q6),
        selectedbook: book.title,
        name: formData.name,
        telegramwhatsapp: formData.contact,
        maxwhatsapp: formData.maxWhatsapp,
        email: formData.email,
        selectedtopic: formData.topic,
        comment: formData.comment,
        consentpersonaldata: formData.agreePrivacy,
        consentmarketing: formData.agreeMarketing,
      };

      const { data, error } = await supabase.functions.invoke('submit-quiz', {
        body: payload,
      });

      if (error) throw error;
      onSubmit(formData);
    } catch {
      toast.error('Не удалось отправить данные. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const TOOLTIP_TEXT = 'Поставьте галочку согласия';

  return (
    <TooltipProvider>
    <div className="w-full max-w-xl mx-auto pb-16">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        Назад к результатам
      </button>

      {/* Heading */}
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-2 leading-snug">
        Оставьте контакт для согласования темы
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-8 leading-relaxed">
        Мы проверим, свободна ли тема, подходит ли она под концепцию книги и успеваете ли
        вы войти в текущий поток.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-body font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Имя <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ваше имя"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
        </div>

        {/* Telegram (optional) */}
        <div>
          <label className="block text-xs font-body font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Telegram{' '}
            <span className="text-muted-foreground font-normal normal-case">(необязательно)</span>
          </label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            placeholder="@username"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
        </div>

        {/* MAX / WhatsApp / Phone (optional) */}
        <div>
          <label className="block text-xs font-body font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            MAX или WhatsApp или телефон{' '}
            <span className="text-muted-foreground font-normal normal-case">(необязательно)</span>
          </label>
          <input
            type="text"
            value={formData.maxWhatsapp}
            onChange={(e) => handleChange('maxWhatsapp', e.target.value)}
            placeholder="@username в MAX / +7..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
        </div>

        {/* Email (optional) */}
        <div>
          <label className="block text-xs font-body font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Email{' '}
            <span className="text-muted-foreground font-normal normal-case">(необязательно)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
        </div>

        {/* Contact validation error */}
        {contactError && (
          <p className="text-xs text-destructive font-body -mt-2">
            {contactError}
          </p>
        )}

        {/* Hint */}
        <p className="text-xs text-muted-foreground font-body -mt-2">
          Заполните хотя бы одно из трёх полей: Telegram, MAX/WhatsApp или Email
        </p>

        {/* Topic */}
        <div>
          <label className="block text-xs font-body font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Выбранная тема <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            placeholder="Тема вашей главы..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20">
            <BookOpen size={12} className="text-accent flex-shrink-0" />
            <span className="text-xs font-body text-accent font-medium">«{book.title}»</span>
            <span className="text-xs text-muted-foreground font-body">· {book.deadline}</span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-body font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Комментарий{' '}
            <span className="text-muted-foreground font-normal normal-case">(необязательно)</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            placeholder="Что-то важное о вас или вашей теме..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-body text-sm resize-none focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
        </div>

        {/* Consent checkboxes */}
        <div className="flex flex-col gap-3 pt-2 pb-1 border-t border-border">
          {/* Privacy policy + User agreement — required */}
          <ConsentCheckbox
            checked={formData.agreePrivacy}
            onChange={() => handleChange('agreePrivacy', !formData.agreePrivacy)}
          >
            Я даю согласие на обработку персональных данных в соответствии с{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Политикой обработки ПД
            </Link>
            {' '}и{' '}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Пользовательским соглашением
            </a>
            {' '}<span className="text-accent">*</span>
          </ConsentCheckbox>

          {/* Marketing — optional */}
          <ConsentCheckbox
            checked={formData.agreeMarketing}
            onChange={() => handleChange('agreeMarketing', !formData.agreeMarketing)}
          >
            Я согласен(а) получать рекламные и информационные сообщения о книжных проектах
          </ConsentCheckbox>
        </div>

        {/* Submit */}
        <div className="pt-2">
          {!canSubmit && formData.agreePrivacy === false ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full block">
                  <button
                    type="submit"
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-body font-semibold text-sm bg-muted text-muted-foreground cursor-not-allowed"
                  >
                    <BookOpen size={16} />
                    Отправить на согласование
                    <ArrowRight size={14} />
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{TOOLTIP_TEXT}</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-body font-semibold text-sm transition-all duration-300 ${
                wasJustUnlocked ? 'animate-[wiggle_0.4s_ease-in-out]' : ''
              } ${
                canSubmit && !isSubmitting
                  ? 'bg-accent text-accent-foreground hover:opacity-90 shadow-md'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <BookOpen
                    size={16}
                    className={wasJustUnlocked ? 'animate-[bounce-in_0.4s_ease-out]' : ''}
                  />
                  Отправить на согласование
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}

          {!formData.agreePrivacy && (formData.name.trim() || formData.contact.trim()) && (
            <p className="text-xs text-center text-accent/70 font-body mt-2">
              Пожалуйста, примите политику конфиденциальности
            </p>
          )}

          <p className="text-xs text-center text-muted-foreground font-body mt-3 leading-relaxed">
            Если тема подойдёт, вы сможете войти в книгу с указанным сроком издания.
          </p>
        </div>
      </form>
    </div>
    </TooltipProvider>
  );
}
