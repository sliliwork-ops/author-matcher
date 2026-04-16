import { useState, useMemo } from 'react';
import { QUIZ_QUESTIONS } from '@/lib/quiz-data';
import { QuizAnswers, matchBook, QuizResult } from '@/lib/quiz-logic';
import { Book } from '@/lib/quiz-data';
import { FormData } from './quiz/QuizForm';
import QuizIntro from './quiz/QuizIntro';
import QuizQuestion from './quiz/QuizQuestion';
import QuizResults from './quiz/QuizResults';
import QuizForm from './quiz/QuizForm';
import QuizSuccess from './quiz/QuizSuccess';
import ProgressBar from './quiz/ProgressBar';

type Stage = 'intro' | 'questions' | 'results' | 'form' | 'success';

const INITIAL_ANSWERS: QuizAnswers = {
  q1: [],
  q2: [],
  q3: '',
  q4: [],
  q5: [],
  q6: [],
};

const Q_KEYS = ['q1', 'q2', 'q4', 'q5', 'q3', 'q6'] as const;

export default function QuizContainer() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [submittedForm, setSubmittedForm] = useState<FormData | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  function handleStart() {
    setStage('questions');
    setCurrentQ(0);
  }

  function handleAnswerChange(val: string | string[]) {
    const key = Q_KEYS[currentQ];
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  function handleNext() {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const res = matchBook(answers);
      setResult(res);
      setStage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      setCurrentQ((c) => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleApply(topic: string, book: Book) {
    setSelectedTopic(topic);
    setSelectedBook(book);
    setStage('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleFormSubmit(data: FormData) {
    setSubmittedForm(data);
    setStage('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRestart() {
    setAnswers(INITIAL_ANSWERS);
    setCurrentQ(0);
    setResult(null);
    setSelectedTopic('');
    setSelectedBook(null);
    setSubmittedForm(null);
    setStage('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const currentAnswer = answers[Q_KEYS[currentQ]];

  return (
    <div className="min-h-screen bg-background">
      {stage === 'intro' && <QuizIntro onStart={handleStart} />}

      {stage === 'questions' && (
        <div className="min-h-screen flex flex-col px-4 pt-10 pb-16">
          <div className="w-full max-w-xl mx-auto mb-10">
            <ProgressBar current={currentQ + 1} total={QUIZ_QUESTIONS.length} />
          </div>
          <div className="flex-1 w-full max-w-xl mx-auto">
            <QuizQuestion
              question={QUIZ_QUESTIONS[currentQ]}
              value={currentAnswer}
              onChange={handleAnswerChange}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={currentQ === 0}
              isLast={currentQ === QUIZ_QUESTIONS.length - 1}
              questionIndex={currentQ}
              total={QUIZ_QUESTIONS.length}
            />
          </div>
        </div>
      )}

      {stage === 'results' && result && (
        <div className="min-h-screen px-4 pt-10">
          <QuizResults
            result={result}
            answers={answers}
            onApply={handleApply}
            sessionId={sessionId}
          />
        </div>
      )}

      {stage === 'form' && selectedBook && (
        <div className="min-h-screen px-4 pt-10">
          <QuizForm
            selectedTopic={selectedTopic}
            book={selectedBook}
            answers={answers}
            onBack={() => setStage('results')}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {stage === 'success' && selectedBook && submittedForm && (
        <div className="min-h-screen px-4 pt-16 flex flex-col items-center">
          <QuizSuccess
            formData={submittedForm}
            book={selectedBook}
            onRestart={handleRestart}
          />
        </div>
      )}
    </div>
  );
}
