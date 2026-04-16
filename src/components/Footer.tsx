import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="max-w-xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          ИП Сараева Лилия Масгутовна · ИНН 023402641316 · ОГРНИП 323237500348750
        </p>
        <div className="flex items-center gap-3 font-body text-xs text-muted-foreground">
          <a
            href="mailto:LS-media.work@yandex.ru"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            LS-media.work@yandex.ru
          </a>
          <span className="opacity-30">·</span>
          <Link
            to="/privacy"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
