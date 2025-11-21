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
    title: 'HighLoad++ 2025',
    description: 'Профессиональная конференция для разработчиков высоконагруженных систем. Архитектура, БД, безопасность и масштабирование.',
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
    title: 'HolyJS 2025 Autumn',
    description: 'Главная JavaScript-конференция года. React 19, Server Components, Edge Computing и инструменты разработки.',
    date: '2025-10-29T10:00:00',
    displayDate: '29 октября, 20–21 ноября',
    format: 'Гибрид',
    category: 'Конференция',
    location: 'Санкт-Петербург / Online',
    tags: ['JavaScript', 'React', 'Web'],
    image: 'https://images.unsplash.com/photo-1568716353609-12ddc5c67f04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXZhc2NyaXB0JTIwY29kZSUyMGNvbmZlcmVuY2V8ZW58MXx8fHwxNzYzNjQ3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://holyjs.ru'
  },
  {
    id: '3',
    title: 'Heisenbug 2025 Autumn',
    description: 'Большая техническая конференция по тестированию. Автоматизация, инструменты QA, нагрузочное тестирование.',
    date: '2025-12-15T10:00:00',
    displayDate: '15–16 декабря 2025',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['QA', 'Testing', 'Automation'],
    image: 'https://images.unsplash.com/photo-1584188335984-7781d3194e03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBxYSUyMGJ1Z3xlbnwxfHx8fDE3NjM2NjYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://heisenbug.ru'
  },
  {
    id: '4',
    title: 'Mobius 2025 Autumn',
    description: 'Конференция для мобильных разработчиков. iOS, Android, кроссплатформа, архитектура мобильных приложений.',
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
    id: '5',
    title: 'SberTech Winter Hack',
    description: 'Новогодний хакатон от СберТеха. Создай лучшее решение для экосистемы и выиграй призы под елку.',
    date: '2025-12-20T10:00:00',
    displayDate: '20–21 декабря 2025',
    format: 'Оффлайн',
    category: 'Хакатон',
    location: 'Москва, Кутузовский 32',
    tags: ['Hackathon', 'Fintech', 'Innovation'],
    image: 'https://images.unsplash.com/photo-1662252900942-2d7e1feb6494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjB3aW50ZXJ8ZW58MXx8fHwxNzYzNjQ3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://sbertech.ru'
  },
  {
    id: '6',
    title: 'Podlodka Techlead Crew',
    description: 'Двухнедельный интенсив для техлидов. Управление командой, процессы, архитектура и найм.',
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
    id: '7',
    title: 'Joker 2026',
    description: 'Легендарная Java-конференция. JVM, Spring Boot, производительность и облачные технологии.',
    date: '2026-10-20T10:00:00',
    displayDate: '20–21 октября 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Санкт-Петербург',
    tags: ['Java', 'Backend', 'Spring'],
    image: 'https://images.unsplash.com/photo-1687603858673-a08a2dc2302c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXZhJTIwY29kZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://jokerconf.com'
  },
  {
    id: '8',
    title: 'CodeFest 15',
    description: 'Самая душевная IT-конференция за Уралом. Разработка, тестирование, управление, дизайн.',
    date: '2026-05-25T09:00:00',
    displayDate: '25–26 мая 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Новосибирск',
    tags: ['General', 'Community', 'Siberia'],
    image: 'https://images.unsplash.com/photo-1560523159-94c9d18bcf27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMGNyb3dkJTIwc3RhZ2V8ZW58MXx8fHwxNzYzNjY2MTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://codefest.ru'
  },
  {
    id: '9',
    title: 'GigaConf 2026',
    description: 'Технологическая конференция Сбера. Искусственный интеллект, большие данные и инновации.',
    date: '2026-06-20T10:00:00',
    displayDate: '20 июня 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['AI', 'Tech', 'Sber'],
    image: 'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwcm9ib3QlMjB0ZWNofGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://giga.sber'
  },
  {
    id: '10',
    title: 'Go Gopher Meetup',
    description: 'Встреча сообщества Go-разработчиков. Обсуждаем дженерики, конкурентность и микросервисы.',
    date: '2026-01-15T18:00:00',
    format: 'Оффлайн',
    category: 'Митап',
    location: 'Нижний Новгород',
    tags: ['Golang', 'Backend', 'Community'],
    image: 'https://images.unsplash.com/photo-1636471339409-8eb98c018b0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xhbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NjM2NDcwOTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://go.dev'
  },
  {
    id: '11',
    title: 'Frontend Architecture Talk',
    description: 'Глубокое погружение в архитектуру современных веб-приложений. Микрофронтенды и стейт-менеджмент.',
    date: '2026-03-28T19:00:00',
    format: 'Онлайн',
    category: 'Митап',
    location: 'YouTube Stream',
    tags: ['Frontend', 'React', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000',
    originalLink: 'https://youtube.com'
  },
  {
    id: '12',
    title: 'Design System Meetup',
    description: 'Обсуждаем обновления дизайн-системы и новые компоненты UI кита. Встреча с авторами дизайн-системы.',
    date: '2026-04-05T16:00:00',
    format: 'Онлайн',
    category: 'Митап',
    location: 'Zoom',
    tags: ['Design', 'UI/UX', 'Frontend'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=1000',
    originalLink: 'https://figma.com'
  }
];