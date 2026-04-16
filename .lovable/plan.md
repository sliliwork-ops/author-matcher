

## Plan: Update CTA Button Colors on Results Screen

**File:** `src/components/quiz/QuizResults.tsx`, lines 352-395

### Changes

Replace the 3 CTA button class strings with the requested color hierarchy:

**Button 1 "Обсудить тему в Telegram"** (enabled state):
- `bg-[#E67E22] text-white shadow-lg hover:bg-[#CF6E19]`

**Button 2 "Обсудить тему в MAX"** (enabled state):
- `border-[#E67E22] text-[#E67E22] bg-transparent hover:bg-[#E67E22] hover:text-white`

**Button 3 "Хочу подумать"** (enabled state):
- `bg-[#9CA3AF] text-white shadow-md hover:bg-[#6B7280]`

Disabled states remain unchanged (`bg-muted text-muted-foreground cursor-not-allowed`).

