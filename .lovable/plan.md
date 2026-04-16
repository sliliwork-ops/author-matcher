

## Plan: Redesign CTA block with clear hierarchy

**Problem:** After compacting the messenger buttons, the main action ("Согласовать тему") потерялась — непонятно, как она соотносится с "Хочу подумать".

**Solution:** Сделать одну большую главную кнопку «Согласовать тему с редактором» с выбором мессенджера, а «Хочу подумать» визуально отделить как текстовую ссылку.

### Layout (top to bottom)

```text
┌─────────────────────────────────────────┐
│  🟠  Согласовать тему с редактором      │  ← big orange button
└─────────────────────────────────────────┘
   Написать в:  [Telegram]  [MAX]          ← small pill buttons below
                                           
         Хочу подумать →                   ← text link, no box
```

### Changes in `src/components/quiz/QuizResults.tsx` (lines 352-402)

1. **Main CTA** — full-width orange filled button (`bg-[#E67E22] text-white`), large padding, bold text. On click — opens Telegram by default (most popular).

2. **Messenger pills** — a small row below: "Написать в:" + two compact pill buttons (Telegram filled accent, MAX outlined). These just switch the messenger, same action.

3. **"Хочу подумать"** — replace the gray button with a simple text link (`text-muted-foreground underline hover:text-foreground`), visually quiet. No box, no background.

4. Keep the hint text "Проверим, свободна ли тема..." below.

### Technical details

- Single file edit: `src/components/quiz/QuizResults.tsx`, lines 352-402
- No new components needed
- Consent/disabled logic stays the same

