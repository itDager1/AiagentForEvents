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
    id: '3',
    title: 'Heisenbug 2026 Spring',
    description: 'Крупная техническая конференция по тестированию и обеспечению качества.',
    date: '2026-04-27T10:00:00',
    displayDate: '27–28 апреля 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Москва',
    tags: ['QA', 'Testing', 'Automation'],
    image: 'https://images.unsplash.com/photo-1584188335984-7781d3194e03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBxYSUyMGJ1Z3xlbnwxfHx8fDE3NjM2NjYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://heisenbug.ru'
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
    id: '9',
    title: 'CodeFest 16',
    description: 'Крупнейшая IT-конференция за Уралом. Разработка, тестирование, управление продуктом и дизайн.',
    date: '2026-05-30T09:00:00',
    displayDate: '30–31 мая 2026',
    format: 'Оффлайн',
    category: 'Конференция',
    location: 'Новосибирск, Экспоцентр',
    tags: ['General', 'Community', 'Siberia'],
    image: 'https://images.unsplash.com/photo-1560523159-94c9d18bcf27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMGNyb3dkJTIwc3RhZ2V8ZW58MXx8fHwxNjM2NjYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    originalLink: 'https://codefest.ru'
  }
];