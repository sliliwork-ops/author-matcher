import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Назад
        </button>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">
          Политика конфиденциальности
        </h1>

        <div className="prose prose-sm max-w-none font-body text-foreground space-y-6 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Общие положения</h2>
            <p className="text-sm text-muted-foreground">
              Настоящая Политика конфиденциальности регулирует порядок обработки и использования
              персональных данных пользователей сайта, осуществляемой ИП Сараева Лилия Масгутовна
              (ИНН 023402641316, ОГРНИП 323237500348750), далее — «Оператор».
            </p>
            <p className="text-sm text-muted-foreground">
              Используя сайт и заполняя формы, вы выражаете согласие с настоящей Политикой.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Какие данные мы собираем</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Имя и фамилия</li>
              <li>Контактные данные: Telegram, WhatsApp, номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Информация, добавленная вами в поле «Комментарий»</li>
              <li>Тема главы и выбранная книга</li>
              <li>Ответы на вопросы анкеты-квиза</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Цели обработки данных</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Связь с вами для согласования участия в книжном проекте</li>
              <li>Проверка доступности и подбор темы главы</li>
              <li>Направление коммерческих предложений и информационных материалов (при наличии согласия)</li>
              <li>Улучшение качества сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Хранение и защита данных</h2>
            <p className="text-sm text-muted-foreground">
              Персональные данные хранятся на защищённых серверах и не передаются третьим лицам
              без вашего согласия, за исключением случаев, предусмотренных законодательством
              Российской Федерации.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Права пользователя</h2>
            <p className="text-sm text-muted-foreground">
              Вы вправе в любой момент отозвать согласие на обработку персональных данных,
              а также запросить их удаление, направив письмо на электронный адрес:
            </p>
            <a
              href="mailto:LS-media.work@yandex.ru"
              className="text-accent text-sm underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              LS-media.work@yandex.ru
            </a>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Реквизиты оператора</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>ИП Сараева Лилия Масгутовна</p>
              <p>ИНН: 023402641316</p>
              <p>ОГРНИП: 323237500348750</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:LS-media.work@yandex.ru"
                  className="text-accent underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  LS-media.work@yandex.ru
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Изменения политики</h2>
            <p className="text-sm text-muted-foreground">
              Оператор оставляет за собой право вносить изменения в настоящую Политику.
              Актуальная версия всегда доступна на данной странице.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
