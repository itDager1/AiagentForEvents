import React from 'react';
import { User, Event, WorkSchedule } from '../../data/mock';
import { EventCard } from './EventCard';
import { Calendar as CalendarIcon, User as UserIcon, Briefcase, Mail, Hash, ArrowLeft, Sparkles, Clock, ChevronLeft, ChevronRight, MapPin, Link as LinkIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface UserProfileProps {
  user: User;
  myEvents: Event[];
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export function UserProfile({ user, myEvents, onBack, onUpdateUser }: UserProfileProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleScheduleChange = (value: WorkSchedule) => {
    if (onUpdateUser) {
      onUpdateUser({ ...user, schedule: value });
    }
  };

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Monday start
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border border-slate-100/50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = currentDayDate.toISOString().split('T')[0];
      
      const dayEvents = myEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
      });

      days.push(
        <div key={day} className="h-32 bg-white border border-slate-100 p-2 relative hover:bg-slate-50 transition-colors group overflow-hidden">
          <span className={`text-sm font-medium ${
            dayEvents.length > 0 ? 'text-slate-900' : 'text-slate-400'
          } ${
            new Date().toDateString() === currentDayDate.toDateString() 
              ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' 
              : ''
          }`}>
            {day}
          </span>
          
          <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-24px)] no-scrollbar">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="text-[10px] font-medium bg-blue-50 text-blue-700 p-1.5 rounded-md border border-blue-100 truncate cursor-pointer hover:bg-blue-100 transition-colors"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 hover:bg-blue-50 hover:text-blue-600 p-0 px-4 h-11 flex items-center gap-2 rounded-xl transition-all font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к мероприятиям
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card - keeping existing code */}
          <Card className="overflow-hidden border-transparent shadow-sm rounded-3xl">
            {/* Header with gradient */}
            <div className="h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 relative overflow-hidden">
              <div className="absolute top-5 right-5 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-5 left-5 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
            </div>
            
            <CardContent className="pt-0 relative px-6 pb-8">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg absolute -top-12 overflow-hidden flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              
              <div className="mt-16 space-y-4">
                {/* Name and Role */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                  <p className="text-blue-600 font-medium mt-1">{user.role}</p>
                </div>
                
                {/* Contact Info */}
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="break-all">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Департамент разработки</span>
                  </div>
                </div>

                {/* Work Schedule */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">График работы</span>
                  </div>
                  {onUpdateUser ? (
                    <Select value={user.schedule || ''} onValueChange={(v) => handleScheduleChange(v as WorkSchedule)}>
                      <SelectTrigger className="w-full h-9 text-sm bg-slate-50 border-slate-200 focus:ring-blue-500/20">
                        <SelectValue placeholder="Выберите график" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5/2">5/2 (Офис)</SelectItem>
                        <SelectItem value="2/2">2/2 (Сменный)</SelectItem>
                        <SelectItem value="4/3">4/3 (Четырехдневка)</SelectItem>
                        <SelectItem value="Гибкий">Гибкий график</SelectItem>
                        <SelectItem value="Удаленка">Удаленная работа</SelectItem>
                        <SelectItem value="Неполный день">Неполный день</SelectItem>
                        <SelectItem value="Проектная">Проектная работа</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-slate-600 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                      {user.schedule || 'Не указан'}
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Интересы</p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.length > 0 ? (
                      user.interests.map(tag => (
                        <Badge key={tag} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-medium">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">Интересы не указаны</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Calendar Grid */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="capitalize">
                {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
              </span>
            </h2>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Week days header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-slate-100 gap-px border-b border-slate-100">
              {renderCalendar()}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Текущая дата</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Событие</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            {selectedEvent && (
                <>
                    <div className="relative h-48 w-full">
                        <ImageWithFallback 
                            src={selectedEvent.image} 
                            alt={selectedEvent.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <Badge className="bg-white text-slate-900 backdrop-blur-sm shadow-sm border-none mb-1">
                                {selectedEvent.category}
                            </Badge>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md"
                            onClick={() => setSelectedEvent(null)}
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </Button>
                    </div>
                    
                    <div className="p-6 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                                {selectedEvent.title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 flex items-center gap-2">
                                <Badge variant="outline" className="font-normal">
                                    {selectedEvent.format}
                                </Badge>
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-slate-400">Дата</p>
                                        <p className="font-medium">{new Date(selectedEvent.date).toLocaleDateString('ru-RU')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-slate-400">Время</p>
                                        <p className="font-medium">{new Date(selectedEvent.date).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-400">Место проведения</p>
                                    <p className="font-medium">{selectedEvent.location}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {selectedEvent.description}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedEvent.tags.map(tag => (
                                    <span key={tag} className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">#{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={() => setSelectedEvent(null)} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}