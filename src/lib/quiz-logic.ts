import { BOOKS, Book } from './quiz-data';

export interface QuizAnswers {
  q1: string[];
  q2: string[];
  q3: string;
  q4: string[];
  q5: string[];
  q6: string[];
}

export interface TopicCard {
  title: string;
  label: string;
  labelColor: 'expert' | 'client' | 'brand';
}

export interface QuizResult {
  primaryBook: Book;
  alternativeBooks: Book[];
  topics: TopicCard[];
}

function arrStr(arr: string[]): string {
  return arr.join(' ').toLowerCase();
}

function scoreBook(bookId: string, answers: QuizAnswers): number {
  let score = 0;
  const sphere = arrStr(answers.q1);
  const requests = answers.q2.map((r) => r.toLowerCase());
  const result = (answers.q3 || '').toLowerCase();
  const format = arrStr(answers.q4);
  const audience = arrStr(answers.q5);
  const goal = arrStr(answers.q6);

  if (bookId === 'real-estate') {
    if (sphere.includes('недвижимость')) score += 10;
    if (result.includes('недвижимост') || result.includes('ипотек') || result.includes('инвестиц')) score += 3;
    if (audience.includes('инвестор') || audience.includes('семь')) score += 2;
    if (requests.some((r) => r.includes('избежать ошибок') || r.includes('безопасно принять'))) score += 2;
  }

  if (bookId === 'expert-system-business') {
    if (
      sphere.includes('маркетинг') ||
      sphere.includes('продажи') ||
      sphere.includes('бизнес') ||
      sphere.includes('управление') ||
      sphere.includes('масштабирование') ||
      sphere.includes('финансы') ||
      sphere.includes('консалтинг') ||
      sphere.includes('hr')
    )
      score += 8;
    if (
      requests.some(
        (r) =>
          r.includes('систему') ||
          r.includes('масштабировать') ||
          r.includes('продаж') ||
          r.includes('упаковать')
      )
    )
      score += 3;
    if (
      format.includes('система') ||
      format.includes('методика') ||
      format.includes('пошаговые') ||
      format.includes('аналитика')
    )
      score += 2;
    if (
      audience.includes('предприниматель') ||
      audience.includes('руководитель') ||
      audience.includes('эксперт') ||
      audience.includes('инвестор')
    )
      score += 2;
    if (goal.includes('клиент') || goal.includes('систем') || goal.includes('нишу')) score += 1;
  }

  if (bookId === 'novaya') {
    if (
      sphere.includes('психологи') ||
      sphere.includes('коучинг') ||
      sphere.includes('личный бренд') ||
      sphere.includes('блогинг') ||
      sphere.includes('медиа')
    )
      score += 8;
    if (audience.includes('женщин')) score += 5;
    if (requests.some((r) => r.includes('кризис') || r.includes('личный бренд'))) score += 3;
    if (format.includes('личная история') || format.includes('путь')) score += 3;
    if (result.includes('кризис') || result.includes('трансформ') || result.includes('опор')) score += 2;
    if (goal.includes('бренд') || goal.includes('медийн') || goal.includes('пр')) score += 1;
  }

  return score;
}

export function matchBook(answers: QuizAnswers): QuizResult {
  const scored = BOOKS.map((book) => ({
    book,
    score: scoreBook(book.id, answers),
  })).sort((a, b) => b.score - a.score);

  const primaryBook = scored[0].book;
  const alternativeBooks = scored
    .slice(1)
    .filter((s) => s.score > 0)
    .map((s) => s.book);

  const topics = generateTopics(answers, primaryBook);

  return { primaryBook, alternativeBooks, topics };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getExpertKeyword(sphere: string): string {
  if (sphere.includes('недвижимость')) return 'в недвижимости';
  if (sphere.includes('маркетинг')) return 'в маркетинге';
  if (sphere.includes('продажи')) return 'в продажах';
  if (sphere.includes('бизнес')) return 'в бизнесе';
  if (sphere.includes('психологи')) return 'в психологии';
  if (sphere.includes('коучинг')) return 'в коучинге';
  if (sphere.includes('финансы')) return 'в финансах';
  if (sphere.includes('hr')) return 'в HR';
  if (sphere.includes('личный бренд')) return 'в личном брендинге';
  return 'в вашей нише';
}

export function generateTopics(answers: QuizAnswers, book: Book, seed: number = 0): TopicCard[] {
  const sphere = answers.q1.join(', ');
  const requests = answers.q2;
  const clientResult = answers.q3 || 'достигают своих целей';
  const format = answers.q4.join(', ');
  const audience = answers.q5.join(', ');
  const goal = answers.q6.join(', ');

  const expertKw = getExpertKeyword(sphere.toLowerCase());
  const audienceLower = audience.toLowerCase();
  const clientText = clientResult.length > 60 ? clientResult.slice(0, 57) + '…' : clientResult;

  const allTopicSets: TopicCard[][] = [
    // Set 0 — default
    [
      {
        title: `${capitalize(sphere)}: как я помогаю клиентам ${clientText}`,
        label: 'Для усиления экспертности',
        labelColor: 'expert',
      },
      {
        title: `${requests[0] || 'Системный подход'}: практическое руководство ${expertKw}`,
        label: 'Для заявок и клиентов',
        labelColor: 'client',
      },
      {
        title: `Мой путь ${expertKw}: как формируется настоящая экспертность`,
        label: 'Для PR и личного бренда',
        labelColor: 'brand',
      },
    ],
    // Set 1
    [
      {
        title: `3 главных ошибки, которые совершают клиенты ${expertKw}, и как их избежать`,
        label: 'Для усиления экспертности',
        labelColor: 'expert',
      },
      {
        title: `Как ${audienceLower || 'клиенты'} получают результат: моя пошаговая система`,
        label: 'Для заявок и клиентов',
        labelColor: 'client',
      },
      {
        title: `${goal.includes('бренд') || goal.includes('статус') ? 'Как эксперт становится автором' : 'Экспертность как актив'}: история трансформации`,
        label: 'Для PR и личного бренда',
        labelColor: 'brand',
      },
    ],
    // Set 2
    [
      {
        title: `Авторский метод: как я выстраиваю работу с клиентами ${expertKw}`,
        label: 'Для усиления экспертности',
        labelColor: 'expert',
      },
      {
        title: `${requests[1] || 'Как системно расти'} — кейсы и разборы из практики`,
        label: 'Для заявок и клиентов',
        labelColor: 'client',
      },
      {
        title: `Почему ${audienceLower || 'клиенты'} выбирают именно меня: честный взгляд изнутри`,
        label: 'Для PR и личного бренда',
        labelColor: 'brand',
      },
    ],
  ];

  const idx = seed % allTopicSets.length;
  return allTopicSets[idx];
}

export function generateTopicsForDirection(direction: string): TopicCard[] {
  return [
    {
      title: `${capitalize(direction)}: с чего начать и как не допустить типичных ошибок`,
      label: 'Для усиления экспертности',
      labelColor: 'expert',
    },
    {
      title: `Практическое руководство по теме «${direction}»: кейсы и инструменты`,
      label: 'Для заявок и клиентов',
      labelColor: 'client',
    },
    {
      title: `${capitalize(direction)} как профессиональный бренд: как я стал(а) экспертом`,
      label: 'Для PR и личного бренда',
      labelColor: 'brand',
    },
  ];
}
