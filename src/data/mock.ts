import React from 'react';

export type Role = 'Разработчик' | 'Менеджер' | 'Дизайнер' | 'HR' | 'Аналитик' | 'Стажер';
export type WorkSchedule = '5/2' | '2/2' | 'Гибкий' | 'Удаленка' | '4/3' | 'Неполный день' | 'Проектная';
export type EventFormat = 'Онлайн' | 'Оффлайн' | 'Гибрид';
export type EventCategory = 'Обучение' | 'Хакатон' | 'Митап' | 'Конференция';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  interests: string[];
  schedule?: WorkSchedule;
  scheduleStartDate?: string; // ISO date string for shift start
  myEventIds: string[];
  isAdmin?: boolean; // New field for admin users
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  displayDate?: string; // Custom display string for complex dates (e.g. ranges)
  format: EventFormat;
  category: EventCategory;
  location: string;
  tags: string[];
  image: string;
  originalLink?: string;
  partners?: string[];
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_EVENTS: Event[] = [
  {
    id: 'dump-spb-2026',
    title: 'DUMP SPb 2026',
    description: 'Главная IT-конференция Санкт-Петербурга. Доклады от ведущих экспертов, нетворкинг и afterparty.',
    date: '2026-02-13T10:00:00',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Санкт-Петербург, Стартовая улица, 6',
    tags: ['IT', 'Разработка', 'Менеджмент', 'Дизайн'],
    image: 'https://images.unsplash.com/photo-1560523159-94c9d18bcf27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJVCUyMGNvbmZlcmVuY2UlMjB0ZWNobm9sb2d5JTIwY3Jvd2QlMjBoYWxsfGVufDF8fHx8MTc2MzgwNDAzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://dump-spb.ru/'
  },
  {
    id: 'codefest-2026',
    title: 'CodeFest',
    description: 'Легендарная IT-конференция в Сибири. Тонны полезной информации, крутые спикеры и невероятная атмосфера.',
    date: '2026-05-30T10:00:00',
    displayDate: '30-31 мая',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Новосибирск',
    tags: ['IT', 'Community', 'Party', 'Talks'],
    image: 'https://images.unsplash.com/photo-1542764140-f38e04d3e0c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJVCUyMGNvbmZlcmVuY2UlMjBhdWRpZW5jZSUyMHN0YWdlJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzYzODA0NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://16.codefest.ru/'
  },
  {
    id: 'heisenbug-2026',
    title: 'Heisenbug 2026',
    description: 'Крупнейшая техническая конференция по тестированию и качеству ПО. Хардкорные доклады по автоматизации, инструментам и процессам QA.',
    date: '2026-04-27T10:00:00',
    displayDate: '27–28 апреля',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['QA', 'Testing', 'Automation', 'Java'],
    image: 'https://images.unsplash.com/photo-1762330474317-93e7a23d096c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBjb25mZXJlbmNlJTIwcWElMjBidWclMjBjb2RlJTIwc2NyZWVufGVufDF8fHx8MTc2MzgwNDg1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://heisenbug.ru/'
  },
  {
    id: 'flutter-conf-2026',
    title: "Flutter conf'26 Москва",
    description: 'Главная конференция для Flutter-разработчиков. Обсудим архитектуру, производительность и будущее кроссплатформенной разработки.',
    date: '2026-02-27T10:00:00',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['Flutter', 'Dart', 'Mobile', 'Cross-platform'],
    image: 'https://images.unsplash.com/photo-1650601624491-effe3c99dd4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbHV0dGVyJTIwbW9iaWxlJTIwZGV2ZWxvcG1lbnQlMjBjb25mZXJlbmNlfGVufDF8fHx8MTc2MzgwNTc3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://flutterconf.ru/'
  },
  {
    id: 'proit-fest-winter-2026',
    title: 'Зимний ProIT Fest VII',
    description: 'Зимний фестиваль для IT-специалистов. Обмен опытом, нетворкинг и актуальные доклады в сердце Петербурга.',
    date: '2026-02-28T10:00:00',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Санкт-Петербург, наб. Карповки 5',
    tags: ['IT', 'Fest', 'Networking', 'Winter'],
    image: 'https://images.unsplash.com/photo-1692190145762-39b948cacc53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjB0ZWNoJTIwY29uZmVyZW5jZSUyMHN0JTIwcGV0ZXJzYnVyZ3xlbnwxfHx8fDE3NjM4MDYwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://proitfest.ru/proit-fest-vii-28-february-2026/'
  },
  {
    id: 'uxui-conf-2026',
    title: "UXUI Conf'26 Москва",
    description: 'Большая конференция для дизайнеров интерфейсов. Тренды 2026 года, мастер-классы и разбор кейсов от ведущих студий.',
    date: '2026-02-28T09:00:00',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва, Radisson Blu Белорусская, 3-я ул. Ямского Поля, 26А',
    tags: ['Design', 'UX', 'UI', 'Research'],
    image: 'https://images.unsplash.com/photo-1763196211158-fa8185083d60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVWCUyMFVJJTIwZGVzaWduJTIwY29uZmVyZW5jZXxlbnwxfHx8fDE3NjM4MDYxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://uxuiconf.ru/'
  },
  {
    id: 'infostart-2026',
    title: 'INFOSTART COMMUNITY EVENT 2026',
    description: 'Главное событие сообщества Инфостарт. Обмен опытом, кейсы внедрения и управления проектами в экосистеме 1С.',
    date: '2026-03-12T09:00:00',
    displayDate: '12—14 марта',
    format: 'Оффлайн',
    category: 'Митап',
    location: 'Москва, Конгресс-центр ЦМТ, Краснопресненская наб., 12, 4-й подъезд',
    tags: ['1C', 'Development', 'Management', 'Community'],
    image: 'https://images.unsplash.com/photo-1575029645663-d8faa1ac2880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwxQyUyMGRldmVsb3BtZW50JTIwY29uZmVyZW5jZSUyMGNvbW11bml0eSUyMGV2ZW50fGVufDF8fHx8MTc2MzgwNjQxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://infostart.ru/event/2374045/'
  },
  {
    id: 'global-tech-forum-2026',
    title: 'GLOBAL TECH FORUM',
    description: 'Ведущий международный технологический форум. Инновации, цифровое будущее и стратегии развития в эпоху глобальных перемен.',
    date: '2026-03-27T09:00:00',
    format: 'Оффлайн',
    category: 'Обучение',
    location: 'Москва, Раменский бульвар, д.1, Кластер «Ломоносов»',
    tags: ['Tech', 'Innovation', 'Future', 'Business'],
    image: 'https://images.unsplash.com/photo-1760386129113-6e20e3b59731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUZWNobm9sb2d5JTIwSW5ub3ZhdGlvbiUyMENvbmZlcmVuY2UlMjBIYWxsJTIwTW9kZXJufGVufDF8fHx8MTc2MzgwNjY5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://globaltechforum.ru/'
  },
  {
    id: 'stachka-ulyanovsk-2026',
    title: 'XV международная IT-Конференция «Стачка» 2026',
    description: 'Крупнейшая региональная IT-конференция. Неформальное общение, обмен опытом и актуальные темы индустрии в Ульяновске.',
    date: '2026-04-10T09:00:00',
    displayDate: '10—11 апреля',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Ульяновск, УлГПУ им. И. Н. Ульянова, площадь Ленина 4',
    tags: ['IT', 'Networking', 'Development', 'Regional'],
    image: 'https://images.unsplash.com/photo-1615932051741-fe742a3baec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJVCUyMGNvbmZlcmVuY2UlMjBsYXJnZSUyMGhhbGwlMjBjcm93ZCUyMHN0YWdlJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzYzODA2OTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://all-events.ru/events/xv-mezhdunarodnaya-it-konferentsiya-stachka-2026-ulyanovsk/'
  },
  {
    id: 'merge-tatarstan-2026',
    title: 'Merge Tatarstan 2026',
    description: 'Крупнейшая региональная IT-конференция в Иннополисе и Казани. Тренды разработки, управления и дизайна.',
    date: '2026-04-17T09:00:00',
    displayDate: '17—18 апреля',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Казань',
    tags: ['IT', 'Merge', 'Dev', 'Design'],
    image: 'https://images.unsplash.com/photo-1762968274962-20c12e6e8ecd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMGF1ZGllbmNlfGVufDF8fHx8MTc2MzgwNzA4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://tatarstan2026.mergeconf.ru/'
  },
  {
    id: 'it-purple-hack-2026',
    title: 'IT Purple Hack',
    description: 'Хакатон для разработчиков, аналитиков и дизайнеров. Решай реальные задачи от бизнеса, прокачивай скиллы и выигрывай призы.',
    date: '2026-04-10T09:00:00',
    displayDate: '10—17 апреля',
    format: 'Онлайн',
    category: 'Хакатон',
    location: 'Онлайн',
    tags: ['Hackathon', 'Coding', 'Team', 'AI'],
    image: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjB0ZWFtJTIwY29tcHV0ZXJzJTIwZGFyayUyMGxpZ2h0fGVufDF8fHx8MTc2MzgwNzM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://it-purple.ru/hack'
  },
  {
    id: 'business-autumn-2025',
    title: 'Бизнес-осень с ФРИИ',
    description: 'Онлайн-трансляция для стартапов и предпринимателей. Узнайте, как развить свой бизнес с помощью экспертов ФРИИ.',
    date: '2025-09-23T09:00:00',
    displayDate: '23 сентября — 30 ноября',
    format: 'Онлайн',
    category: 'Обучение',
    location: 'Онлайн',
    tags: ['Business', 'Startup', 'Accelerator', 'Online'],
    image: 'https://images.unsplash.com/photo-1675716823435-054de29a2402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGFjY2VsZXJhdG9yJTIwc3RhcnR1cCUyMGNvbmZlcmVuY2UlMjBvbmxpbmV8ZW58MXx8fHwxNzYzODA3NjM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    originalLink: 'https://accelerator.iidf.ru/event/business-autumn?utm_source=allevents&utm_medium=media&utm_content=business-autumn&utm_campaign=2025'
  }
];