import { ArrowRight, CheckCircle2 } from 'lucide-react';
import heroBg from '@/assets/hero-bg.png';
import heroBgMobile from '@/assets/hero-bg-mobile.png';
import logo from '@/assets/logo.png';

interface QuizIntroProps {
  onStart: () => void;
}

const benefits = [
'Персональный подбор книги',
'3 идеи для главы от AI-редактора на основе нашей базы',
'Возможность согласовать тему с редактором'];


export default function QuizIntro({ onStart }: QuizIntroProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Mobile background */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{ backgroundImage: `url(${heroBgMobile})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
      />
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-[hsl(var(--hero-bg))]/60 pointer-events-none" />
      <div className="relative w-full max-w-xl mx-auto -mt-16">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Логотип" className="h-24 w-auto" />
        </div>

        {/* White divider */}
        <div className="w-10 h-px bg-white/40 mx-auto mb-6" />

        {/* Heading */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl text-white text-center leading-tight mb-6 uppercase tracking-wide">Узнай, какая книга сделает тебя автором в 2026</h1>

        {/* Sub */}
        <p className="text-[hsl(var(--hero-muted))] text-center text-base font-body mb-10 leading-relaxed">Пройдите опрос и получите рекомендации по книге и теме главы</p>

        {/* Benefit list */}
        <ul className="flex flex-col gap-2 mb-12">
          {benefits.map((text, i) =>
          <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0 text-white/80 mt-0.5" />
              <span className="text-sm font-body text-white/85 leading-snug">{text}</span>
            </li>
          )}
        </ul>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-[hsl(var(--hero-bg))] font-body font-medium text-base transition-all duration-200 hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] shadow-lg">
            Подобрать тему главы
            <ArrowRight size={18} />
          </button>
          <span className="text-white/60 text-sm font-body">
            Это займёт 1–2 минуты
          </span>
        </div>
      </div>
    </div>);

}