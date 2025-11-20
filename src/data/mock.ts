import React from 'react';

export type Role = 'Разработчик' | 'Менеджер' | 'Дизайнер' | 'HR' | 'Аналитик' | 'Стажер';
export type WorkSchedule = '5/2' | '2/2' | 'Гибкий' | 'Удаленка' | '4/3' | 'Неполный день' | 'Проектная';
export type EventFormat = 'Онлайн' | 'Оффлайн' | 'Гибрид';
export type EventCategory = 'Обучение' | 'Хакатон' | 'Митап' | 'Конференция';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  interests: string[];
  schedule?: WorkSchedule;
  myEventIds: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  format: EventFormat;
  category: EventCategory;
  location: string;
  tags: string[];
  image: string;
}

export const MOCK_EVENTS: Event[] = [
  {
    id: '9',
    title: 'HighLoad++ 2025',
    description: 'Профессиональная конференция для разработчиков высоконагруженных систем. Архитектура, БД, безопасность.',
    date: '2025-11-27T09:00:00',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва, Крокус Экспо',
    tags: ['HighLoad', 'Backend', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwcGVyZm9ybWFuY2UlMjBzZXJ2ZXIlMjBjb25mZXJlbmNlfGVufDF8fHx8MTc2MzY0NzA4OXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '10',
    title: 'HolyJS 2025 Autumn',
    description: 'Главная JavaScript-конференция года. React 19, Server Components, Edge Computing и многое другое.',
    date: '2025-12-10T10:00:00',
    format: 'Гибрид',
    category: 'Конференция',
    location: 'Санкт-Петербург / Online',
    tags: ['JavaScript', 'React', 'Web'],
    image: 'https://images.unsplash.com/photo-1568716353609-12ddc5c67f04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXZhc2NyaXB0JTIwY29kZSUyMGNvbmZlcmVuY2V8ZW58MXx8fHwxNzYzNjQ3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '11',
    title: 'SberTech Winter Hack',
    description: 'Новогодний хакатон от СберТеха. Создай лучшее решение для экосистемы и выиграй призы под елку.',
    date: '2025-12-20T10:00:00',
    format: 'Оффлайн',
    category: 'Хакатон',
    location: 'Москва, Кутузовский 32',
    tags: ['Hackathon', 'Fintech', 'Innovation'],
    image: 'https://images.unsplash.com/photo-1662252900942-2d7e1feb6494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjB3aW50ZXJ8ZW58MXx8fHwxNzYzNjQ3MDg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '12',
    title: 'Go Gopher Meetup',
    description: 'Встреча сообщества Go-разработчиков. Обсуждаем дженерики, конкурентность и микросервисы.',
    date: '2026-01-15T18:00:00',
    format: 'Оффлайн',
    category: 'Митап',
    location: 'Нижний Новгород',
    tags: ['Golang', 'Backend', 'Community'],
    image: 'https://images.unsplash.com/photo-1636471339409-8eb98c018b0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xhbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NjM2NDcwOTN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    title: 'Agile Management Workshop',
    description: 'Интенсивный воркшоп по гибким методологиям управления проектами для тимлидов и менеджеров.',
    date: '2026-03-10T14:00:00',
    format: 'Оффлайн',
    category: 'Обучение',
    location: 'Agile Home',
    tags: ['Management', 'Agile', 'Soft Skills'],
    image: 'https://images.unsplash.com/photo-1531498860503-618dbfe43603?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '8',
    title: 'Frontend Architecture Talk',
    description: 'Глубокое погружение в архитектуру современных веб-приложений. Микрофронтенды, стейт-менеджмент и производительность.',
    date: '2026-03-28T19:00:00',
    format: 'Онлайн',
    category: 'Митап',
    location: 'YouTube Stream',
    tags: ['Frontend', 'React', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '6',
    title: 'Design System Meetup',
    description: 'Обсуждаем обновления дизайн-системы и новые компоненты UI кита. Встреча с авторами дизайн-системы.',
    date: '2026-04-05T16:00:00',
    format: 'Онлайн',
    category: 'Митап',
    location: 'Zoom',
    tags: ['Design', 'UI/UX', 'Frontend'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '1',
    title: 'AI & Big Data Conference 2026',
    description: 'Крупнейшая конференция по искусственному интеллекту в финтехе. Спикеры из ведущих технологических компаний.',
    date: '2026-04-15T10:00:00',
    format: 'Гибрид',
    category: 'Конференция',
    location: 'СберУниверситет / Zoom',
    tags: ['AI', 'Big Data', 'Tech'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '7',
    title: 'DevOps & SRE Summit',
    description: 'Лучшие практики эксплуатации высоконагруженных систем. Kubernetes, observability и CI/CD пайплайны.',
    date: '2026-05-12T11:00:00',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва Сити',
    tags: ['DevOps', 'SRE', 'Infrastructure'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '4',
    title: 'SberTech Hackathon 2026',
    description: '48 часов кодинга. Создаем будущее банкинга. Главный приз - 1 000 000 рублей.',
    date: '2026-06-01T18:00:00',
    format: 'Оффлайн',
    category: 'Хакатон',
    location: 'Кутузовский 32',
    tags: ['Coding', 'Innovation', 'Fintech'],
    image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=1000'
  }
];
