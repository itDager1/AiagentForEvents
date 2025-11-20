import React from 'react';

export type Role = 'Разработчик' | 'Менеджер' | 'Дизайнер' | 'HR' | 'Аналитик' | 'Стажер';
export type WorkSchedule = '5/2' | '2/2' | 'Гибкий' | 'Удаленка';
export type EventFormat = 'Онлайн' | 'Оффлайн' | 'Гибрид';
export type EventCategory = 'Обучение' | 'Спорт' | 'Корпоратив' | 'Хакатон' | 'Волонтерство';

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
    id: '1',
    title: 'AI & Big Data Conference 2025',
    description: 'Крупнейшая конференция по искусственному интеллекту в финтехе. Спикеры из ведущих технологических компаний.',
    date: '2025-04-15T10:00:00',
    format: 'Гибрид',
    category: 'Обучение',
    location: 'СберУниверситет / Zoom',
    tags: ['AI', 'Big Data', 'Tech'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '2',
    title: 'Зеленый Марафон: Весенний забег',
    description: 'Традиционный благотворительный забег для сотрудников и их семей. Дистанции 4.2 км и 10 км.',
    date: '2025-05-20T09:00:00',
    format: 'Оффлайн',
    category: 'Спорт',
    location: 'Парк Горького',
    tags: ['Спорт', 'Здоровье', 'Семья'],
    image: 'https://images.unsplash.com/photo-1552674605-46d5c4963414?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '3',
    title: 'Agile Management Workshop',
    description: 'Интенсивный воркшоп по гибким методологиям управления проектами для тимлидов и менеджеров.',
    date: '2025-03-10T14:00:00',
    format: 'Оффлайн',
    category: 'Обучение',
    location: 'Agile Home',
    tags: ['Management', 'Agile', 'Soft Skills'],
    image: 'https://images.unsplash.com/photo-1531498860503-618dbfe43603?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '4',
    title: 'SberTech Hackathon',
    description: '48 часов кодинга. Создаем будущее банкинга. Главный приз - 1 000 000 рублей.',
    date: '2025-06-01T18:00:00',
    format: 'Оффлайн',
    category: 'Хакатон',
    location: 'Кутузовский 32',
    tags: ['Coding', 'Innovation', 'Fintech'],
    image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '5',
    title: 'День донора',
    description: 'Акция по сдаче крови. Помоги тем, кто нуждается.',
    date: '2025-03-25T08:00:00',
    format: 'Оффлайн',
    category: 'Волонтерство',
    location: 'Медпункт ЦА',
    tags: ['Charity', 'Health'],
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '6',
    title: 'Design System Meetup',
    description: 'Обсуждаем обновления дизайн-системы и новые компоненты UI кита.',
    date: '2025-04-05T16:00:00',
    format: 'Онлайн',
    category: 'Обучение',
    location: 'Zoom',
    tags: ['Design', 'UI/UX', 'Frontend'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=1000'
  }
];
