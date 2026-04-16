

## План изменений квиза author-match (5 пунктов)

---

### 1. Чекбокс согласия на ПД на экране результатов

**Файл: `src/components/quiz/QuizResults.tsx`**

- Добавить state `consentPD` (boolean, default false)
- Перед блоком CTA-кнопок (строка ~254) вставить чекбокс:
  - Текст: «Я согласен(на) на обработку персональных данных и принимаю [Политику обработки ПД](#) и [Пользовательское соглашение](#).»
  - Ссылки — `<a href="#" target="_blank">`
- Все CTA-кнопки (`Согласовать тему`, `Отправить тему на согласование`, кнопки в разделе «все книги») — `disabled={!consentPD}`
- На disabled-кнопки обернуть в `Tooltip` из shadcn с текстом «Поставьте галочку согласия»
- Импортировать `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` из `@/components/ui/tooltip`

**Файл: `src/components/quiz/QuizForm.tsx`**

- Чекбокс согласия на ПД уже есть (строка 238–253), но текст нужно обновить: добавить ссылку «Пользовательское соглашение» (`href="#"`) рядом с «Политикой конфиденциальности»
- Кнопка отправки уже disabled без согласия — добавить tooltip «Поставьте галочку согласия» при наведении на неактивную кнопку

---

### 2. Три CTA-кнопки на экране результатов вместо одной

**Файл: `src/components/QuizContainer.tsx`**

- Добавить `sessionId` (UUID) в state, генерировать при монтировании через `crypto.randomUUID()`
- Передать `sessionId` и `answers` в `QuizResults` как пропсы

**Файл: `src/components/quiz/QuizResults.tsx`**

- Принять пропсы `sessionId: string` и обновить интерфейс
- Заменить единственную кнопку «Согласовать тему» (строки 255–261) на три кнопки в вертикальном столбике:

**Кнопка 1** — оранжевая заполненная, крупная:
- Текст: «🔥 Обсудить тему в Telegram»
- onClick: `window.open('https://t.me/lili_saraeva_assistant?text=' + encodeURIComponent(msg))` где msg = «Здравствуйте! Прошла квиз, у меня тема: {selected_theme}. Ниша: {niche}. Формат: {format}. Хочу обсудить соавторство.»
  - `{selected_theme}` = выбранная тема (selectedTopics или displayTopics[0])
  - `{niche}` = answers.q1.join(', ')
  - `{format}` = answers.q4.join(', ')

**Кнопка 2** — оранжевая outline:
- Текст: «💬 Обсудить тему в MAX»
- onClick: скопировать текст (тот же msg но НЕ encoded) в буфер → toast «✅ Текст темы скопирован. Вставь его в чат с редактором.» (duration: 4000) → setTimeout 500ms → window.open MAX URL

**Кнопка 3** — зелёная заполненная, меньшая:
- Текст: «📚 Хочу подумать»
- onClick: `window.open('https://t.me/litAgentLS_bot?start=quiz_warm_' + sessionId)`

- Кнопки «Предложить свою тему» и «Посмотреть все книги» остаются ниже без изменений
- Все три кнопки disabled без consentPD + tooltip

---

### 3. Исправить опечатку «автоворонкку»

Опечатка **не найдена** в коде проекта. Она, вероятно, находится в таблице `book_concepts` в базе данных. Нужно:
- Выполнить SQL-запрос для поиска и замены в полях таблицы `book_concepts`
- Проверить поля: `suitable_topics`, `problems`, `match_keywords`, `sample_output_angle` и др.

---

### 4. Форма «Оставьте контакт» — изменение полей

**Файл: `src/components/quiz/QuizForm.tsx`**

- **Telegram**: убрать `*`, сделать необязательным
- **Добавить поле** `maxWhatsapp` (string): «MAX или WhatsApp или телефон», placeholder «@username в MAX / +7...», необязательное
- **Email**: сделать **обязательным** (добавить `*`, убрать «необязательно»)
- Обновить `FormData` interface: добавить `maxWhatsapp: string`
- **Валидация canSubmit**: имя + тема + agreePrivacy + хотя бы одно из (contact, maxWhatsapp, email) заполнено. Если ни одно — показать ошибку «Оставьте хотя бы один способ связи»
- Обновить payload в handleSubmit: добавить поле `maxwhatsapp`

**Файл: `supabase/functions/submit-quiz/index.ts`**

- Добавить поле `maxwhatsapp` в форматирование Telegram-сообщения

---

### 5. Автоответ после формы — обновить экран успеха

**Файл: `src/components/quiz/QuizSuccess.tsx`**

- Заменить текст на: «✅ Заявка принята. Редактор свяжется в течение 2 часов в рабочее время (10:00–19:00 МСК). А пока — кейсы соавторов в Telegram-канале»
- Добавить кнопку «Открыть канал» → `https://t.me/saraeva_lm`

---

### Плейсхолдеры для ручной замены

После реализации в коде останутся следующие плейсхолдеры:
- `href="#"` — ссылка на **Политику обработки ПД** (2 места: QuizResults, QuizForm)
- `href="#"` — ссылка на **Пользовательское соглашение** (2 места: QuizResults, QuizForm)
- Пиксели **Яндекс.Метрики** и **ВК** — не реализованы, нужны ID для встраивания

---

### Затрагиваемые файлы
1. `src/components/QuizContainer.tsx` — sessionId
2. `src/components/quiz/QuizResults.tsx` — consent, 3 кнопки, tooltip
3. `src/components/quiz/QuizForm.tsx` — поля, валидация, текст consent
4. `src/components/quiz/QuizSuccess.tsx` — новый текст + кнопка канала
5. `supabase/functions/submit-quiz/index.ts` — новое поле в Telegram
6. SQL-миграция — исправление опечатки в book_concepts

