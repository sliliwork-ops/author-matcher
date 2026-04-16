import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { QuizQuestion as IQuestion } from '@/lib/quiz-data';

interface QuizQuestionProps {
  question: IQuestion;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  questionIndex: number;
  total: number;
}

export default function QuizQuestion({
  question,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  questionIndex,
  total,
}: QuizQuestionProps) {
  const [textVal, setTextVal] = useState(typeof value === 'string' ? value : '');
  const [otherText, setOtherText] = useState('');

  const isSingle = question.type === 'single';
  const isMulti = question.type === 'multi';
  const isText = question.type === 'text';

  const selectedSingle = typeof value === 'string' ? value : '';
  const selectedMulti = Array.isArray(value) ? value : [];

  // Check if "Другое" is selected
  const otherSelected = isSingle
    ? selectedSingle === 'Другое'
    : selectedMulti.some((v) => v === 'Другое' || v.startsWith('Другое: '));

  const canProceed = isText
    ? question.optional || textVal.trim().length > 0
    : isSingle
    ? selectedSingle !== ''
    : selectedMulti.length > 0;

  function handleSingle(opt: string) {
    if (opt === 'Другое') {
      onChange('Другое');
    } else {
      onChange(opt);
    }
  }

  function handleMulti(opt: string) {
    if (opt === 'Другое') {
      const hasOther = selectedMulti.some((v) => v === 'Другое' || v.startsWith('Другое: '));
      if (hasOther) {
        // Deselect Другое
        onChange(selectedMulti.filter((v) => v !== 'Другое' && !v.startsWith('Другое: ')));
        setOtherText('');
      } else if (!question.maxSelect || selectedMulti.length < question.maxSelect) {
        onChange([...selectedMulti, 'Другое']);
      }
    } else {
      if (selectedMulti.includes(opt)) {
        onChange(selectedMulti.filter((v) => v !== opt));
      } else if (!question.maxSelect || selectedMulti.length < question.maxSelect) {
        onChange([...selectedMulti, opt]);
      }
    }
  }

  function handleOtherTextChange(text: string) {
    setOtherText(text);
    if (isMulti) {
      const withoutOther = selectedMulti.filter((v) => v !== 'Другое' && !v.startsWith('Другое: '));
      const newVal = text.trim() ? `Другое: ${text.trim()}` : 'Другое';
      onChange([...withoutOther, newVal]);
    } else {
      onChange(text.trim() ? `Другое: ${text.trim()}` : 'Другое');
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTextVal(e.target.value);
    onChange(e.target.value);
  }

  function handleNext() {
    if (isText) onChange(textVal);
    if (canProceed) onNext();
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 leading-snug">
        {question.text}
      </h2>

      {isMulti && question.maxSelect && (
        <p className="text-sm text-muted-foreground font-body mb-6">
          Можно выбрать до {question.maxSelect} вариантов
        </p>
      )}
      {isMulti && !question.maxSelect && (
        <p className="text-sm text-muted-foreground font-body mb-6">
          Можно выбрать несколько вариантов
        </p>
      )}
      {!isMulti && !isText && <div className="mb-6" />}

      {/* Options */}
      {(isSingle || isMulti) && (
        <div className="flex flex-col gap-2.5">
          {question.options?.map((opt) => {
            const selected = isSingle
              ? selectedSingle === opt || (opt === 'Другое' && selectedSingle.startsWith('Другое: '))
              : selectedMulti.includes(opt) || (opt === 'Другое' && selectedMulti.some((v) => v.startsWith('Другое: ')));
            return (
              <div key={opt}>
                <button
                  onClick={() => (isSingle ? handleSingle(opt) : handleMulti(opt))}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border font-body text-sm transition-all duration-150 flex items-center justify-between gap-3 ${
                    selected
                      ? 'border-[hsl(var(--hero-bg))] bg-[hsl(var(--hero-light))] text-foreground shadow-sm'
                      : 'border-border bg-card text-foreground hover:border-[hsl(var(--hero-bg))]/40 hover:bg-[hsl(var(--hero-light))]'
                  }`}
                >
                  <span>{opt}</span>
                  {selected && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--hero-bg))] flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </span>
                  )}
                </button>
                {/* «Другое» text input */}
                {opt === 'Другое' && selected && (
                  <div className="mt-2 ml-2">
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => handleOtherTextChange(e.target.value)}
                      placeholder="Укажите свой вариант..."
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border border-accent/40 bg-background text-foreground font-body text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Text input */}
      {isText && (
      <div className="flex flex-col gap-3">
          <textarea
            value={textVal}
            onChange={handleTextChange}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl border border-border bg-card text-foreground font-body text-sm resize-none focus:outline-none focus:border-accent placeholder:text-muted-foreground transition-colors"
          />
          {question.optional && (
            <p className="text-xs text-muted-foreground font-body">
              Необязательно — можете пропустить этот вопрос
            </p>
          )}
          {question.hint && (
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              <span className="font-medium">Например:</span> {question.hint}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 gap-4">
        {!isFirst ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground font-body text-sm hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={16} />
            Назад
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-body text-sm font-medium transition-all duration-150 ${
            canProceed
              ? 'bg-accent text-accent-foreground hover:opacity-90 active:scale-[0.98] shadow-md'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isLast ? 'Показать результат' : 'Далее'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
