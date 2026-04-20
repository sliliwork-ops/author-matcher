
## Удаление email-блока из финального экрана

### Что удаляется

**В файле `src/components/quiz/QuizResults.tsx`:**

1. **Импорт:** удалить `Mail` из `lucide-react` (больше не используется).

2. **State (строки 128–132):** удалить переменные:
   - `email`, `setEmail`
   - `marketingConsent`, `setMarketingConsent`
   - `emailSubmitting`, `setEmailSubmitting`
   - `emailSubmitted`, `setEmailSubmitted`

3. **Функция `handleEmailSubmit` (строки 192–218):** удалить целиком.

4. **JSX-блок (строки 386–430):** удалить весь блок «EMAIL CAPTURE (soft lead magnet)».

### Что остаётся

- Все остальные импорты и функции (`handleTelegramCta`, `handleMaxCta`, `postWebhook`, `ConsentCheckbox`, `DisableableButton`, `getUtm`, `emailSchema`).
- Чекбокс ПД (гейтит CTA-кнопки).
- CTA-кнопки «Обсудить тему с редактором» и «Написать в MAX».

### Итоговая структура экрана

```text
┌─ Книга + описание + дедлайн/цена
├─ Темы главы (1-2 выбор)
│
├─ ☐ Я согласен на обработку ПД
│
├─ [ОРАНЖЕВАЯ CTA] Обсудить тему с редактором
└─ [ссылка] Нет Telegram? Написать в MAX
```
