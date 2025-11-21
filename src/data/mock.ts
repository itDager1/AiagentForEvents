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
    id: '1',
    title: 'HighLoad++ Foundation 2025',
    description: 'Крупнейшая профессиональная конференция для разработчиков высоконагруженных систем.',
    date: '2025-11-27T09:00:00',
    displayDate: '27–28 ноября 2025',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва, Крокус Экспо',
    tags: ['HighLoad', 'Backend', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwcGVyZm9ybWFuY2UlMjBzZXJ2ZXIlMjBjb25mZXJlbmNlfGVufDF8fHx8MTc2MzY0NzA4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://highload.ru'
  },
  {
    id: '2',
    title: 'Mobius 2025 Autumn',
    description: 'Профессиональная конференция по мобильной разработке. iOS, Android, кроссплатформа.',
    date: '2025-12-05T10:00:00',
    displayDate: '5–6 декабря 2025',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Санкт-Петербург',
    tags: ['Mobile', 'iOS', 'Android'],
    image: 'https://images.unsplash.com/photo-1762341119237-98df67c9c3c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudCUyMHBob25lfGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://mobiusconf.com'
  },
  {
    id: '3',
    title: 'Heisenbug 2025 Autumn',
    description: 'Крупная техническая конференция по тестированию и обеспечению качества.',
    date: '2025-12-11T10:00:00',
    displayDate: '11–12 декабря 2025',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['QA', 'Testing', 'Automation'],
    image: 'https://images.unsplash.com/photo-1584188335984-7781d3194e03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBxYSUyMGJ1Z3xlbnwxfHx8fDE3NjM2NjYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://heisenbug.ru'
  },
  {
    id: '4',
    title: 'DotNext 2025 Autumn',
    description: 'Главная конференция для .NET-разработчиков в России. Architecture, Performance, Internals.',
    date: '2025-12-15T10:00:00',
    displayDate: '15–16 декабря 2025',
    format: 'Гибрид',
    category: 'Конференция',
    location: 'Москва / Online',
    tags: ['.NET', 'C#', 'Backend'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBtaWNyb3NvZnR8ZW58MXx8fHwxNzYzNjQ3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://dotnext.ru'
  },
  {
    id: '5',
    title: 'SberTech Winter Hack',
    description: 'Традиционный зимний хакатон от СберТеха. Решение реальных задач экосистемы.',
    date: '2025-12-20T10:00:00',
    displayDate: '20–21 декабря 2025',
    format: 'Оффлайн',
    category: 'Хакатон',
    location: 'Москва, Кутузовский 32',
    tags: ['Hackathon', 'Fintech', 'Innovation'],
    image: 'https://images.unsplash.com/photo-1662252900942-2d7e1feb6494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjB3aW50ZXJ8ZW58MXx8fHwxNzYzNjQ3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://sber-tech.ru'
  },
  {
    id: '6',
    title: 'Moscow Python Meetup',
    description: 'Регулярная встреча московского сообщества Python-разработчиков. Доклады, нетворкинг и пицца.',
    date: '2025-12-25T19:00:00',
    displayDate: '25 декабря 2025',
    format: 'Оффлайн',
    category: 'Митап',
    location: 'Москва',
    tags: ['Python', 'Backend', 'Community'],
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXRob24lMjBjb2RlLnxlbnwxfHx8fDE3NjM2NjYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://moscowpython.ru'
  },
  {
    id: '7',
    title: 'Podlodka Techlead Crew #14',
    description: 'Двухнедельный интенсив для технических лидеров и руководителей команд.',
    date: '2026-02-16T19:00:00',
    displayDate: '16 февраля – 1 марта 2026',
    format: 'Онлайн',
    category: 'Обучение',
    location: 'Online',
    tags: ['Management', 'Techlead', 'Soft Skills'],
    image: 'https://images.unsplash.com/photo-1633457896836-f8d6025c85d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMG9mZmljZSUyMGRpc2N1c3Npb258ZW58MXx8fHwxNzYzNjY2MTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://podlodka.io'
  },
  {
    id: '8',
    title: 'FrontendConf 2026',
    description: 'Главная конференция по фронтенд-разработке. Современные фреймворки, производительность и UI/UX.',
    date: '2026-05-28T10:00:00',
    displayDate: '28–29 мая 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['Frontend', 'React', 'Web'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000',
    originalLink: 'https://frontendconf.ru'
  },
  {
    id: '9',
    title: 'CodeFest 16',
    description: 'Крупнейшая IT-конференция за Уралом. Разработка, тестирование, управление продуктом и дизайн.',
    date: '2026-05-23T09:00:00',
    displayDate: '23–24 мая 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Новосибирск, Экспоцентр',
    tags: ['General', 'Community', 'Siberia'],
    image: 'https://images.unsplash.com/photo-1560523159-94c9d18bcf27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMGNyb3dkJTIwc3RhZ2V8ZW58MXx8fHwxNzYzNjY2MTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://codefest.ru'
  },
  {
    id: '10',
    title: 'GigaConf 2026',
    description: 'Технологическая конференция Сбера для разработчиков и инженеров.',
    date: '2026-06-27T10:00:00',
    displayDate: '27 июня 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва, ВДНХ',
    tags: ['AI', 'Sber', 'Tech'],
    image: 'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwcm9ib3QlMjB0ZWNofGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://developers.sber.ru'
  },
  {
    id: '11',
    title: 'Kazan Digital Week 2026',
    description: 'Международный форум цифровой трансформации. Госсектор, инновации и кибербезопасность.',
    date: '2026-09-24T10:00:00',
    displayDate: '24–27 сентября 2026',
    format: 'Гибрид',
    category: 'Конференция',
    location: 'Казань, Казань Экспо',
    tags: ['GovTech', 'Digital', 'Security'],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
    originalLink: 'https://kazandigitalweek.com/ru/site'
  },
  {
    id: '12',
    title: 'Go Gopher Meetup',
    description: 'Встреча сообщества Go-разработчиков. Микросервисы и конкурентность.',
    date: '2026-02-05T18:30:00',
    format: 'Оффлайн',
    category: 'Митап',
    location: 'Екатеринбург',
    tags: ['Golang', 'Backend'],
    image: 'https://images.unsplash.com/photo-1636471339409-8eb98c018b0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xhbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NjM2NDcwOTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://go.dev/community'
  }
];
