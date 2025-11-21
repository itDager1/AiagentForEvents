import React, { useState, useEffect } from 'react';
import { User, Event, WorkSchedule, EventRegistration } from '../../data/mock';
import { Calendar as CalendarIcon, User as UserIcon, Briefcase, Mail, Plus, X, ChevronLeft, ChevronRight, Clock as ClockIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EventDetailsModal } from './EventDetailsModal';
import { ArrowLeft, Clock } from 'lucide-react';

interface UserProfileProps {
  user: User;
  myEvents: Event[];
  userRegistrations?: EventRegistration[];
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export function UserProfile({ user, myEvents, userRegistrations, onBack, onUpdateUser }: UserProfileProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newInterest, setNewInterest] = useState('');
  const [isAddingInterest, setIsAddingInterest] = useState(false);

  // Auto-refresh registrations when component mounts to get latest status
  useEffect(() => {
    // Trigger a re-render by checking localStorage directly
    const checkForUpdates = () => {
      // This will cause the component to use the latest data passed from parent
      // Parent component manages the data, we just display it
    };
    
    checkForUpdates();
  }, []);

  const handleScheduleChange = (value: WorkSchedule) => {
    if (onUpdateUser) {
      onUpdateUser({ ...user, schedule: value });
    }
  };

  const handleAddInterest = () => {
    if (!newInterest.trim() || !onUpdateUser) return;
    if (user.interests.includes(newInterest.trim())) {
        setNewInterest('');
        setIsAddingInterest(false);
        return;
    }
    
    const updatedInterests = [...user.interests, newInterest.trim()];
    onUpdateUser({ ...user, interests: updatedInterests });
    setNewInterest('');
    setIsAddingInterest(false);
  };

  const handleRemoveInterest = (interest: string) => {
    if (!onUpdateUser) return;
    const updatedInterests = user.interests.filter(i => i !== interest);
    onUpdateUser({ ...user, interests: updatedInterests });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddInterest();
    } else if (e.key === 'Escape') {
      setIsAddingInterest(false);
      setNewInterest('');
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

  const isWorkingDay = (date: Date, schedule?: WorkSchedule) => {
    const day = date.getDay(); // 0 = Sun, 6 = Sat
    
    // Normalize date to midnight for accurate day difference calculation
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    switch (schedule) {
      case '2/2': {
        // Use user's start date or fallback to Jan 1, 2024
        const refDate = user.scheduleStartDate ? new Date(user.scheduleStartDate) : new Date(2024, 0, 1);
        refDate.setHours(0, 0, 0, 0);
        
        const diffTime = targetDate.getTime() - refDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Cycle is 4 days: 2 work, 2 off
        // We use module arithmetic to find position in cycle
        const cycleDay = ((diffDays % 4) + 4) % 4;
        return cycleDay < 2;
      }
      case '4/3': {
         if (user.scheduleStartDate) {
             const refDate = new Date(user.scheduleStartDate);
             refDate.setHours(0, 0, 0, 0);
             const diffTime = targetDate.getTime() - refDate.getTime();
             const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
             const cycleDay = ((diffDays % 7) + 7) % 7;
             return cycleDay < 4; // 0, 1, 2, 3 are work days
         }
         // Default 4/3: Mon-Thu work, Fri-Sun off
         return day >= 1 && day <= 4;
      }
      case '5/2':
        // If user wants to shift 5/2, they can, otherwise standard Mon-Fri
        if (user.scheduleStartDate) {
             const refDate = new Date(user.scheduleStartDate);
             refDate.setHours(0, 0, 0, 0);
             const diffTime = targetDate.getTime() - refDate.getTime();
             const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
             const cycleDay = ((diffDays % 7) + 7) % 7;
             return cycleDay < 5; // 0-4 work
        }
        return day !== 0 && day !== 6;
      case 'Удаленка':
      case 'Неполный день':
      default:
        return day !== 0 && day !== 6;
      case 'Гибкий':
      case 'Проектная':
        return true;
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/30 border border-slate-100/50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isWorkDay = isWorkingDay(currentDayDate, user.schedule);
      
      const dayEvents = myEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
      });

      days.push(
        <div 
            key={day} 
            className={`h-32 border border-slate-100 p-2 relative transition-colors group overflow-hidden ${
                isWorkDay ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/60 hover:bg-slate-100/80'
            }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${
                dayEvents.length > 0 ? 'text-slate-900' : isWorkDay ? 'text-slate-400' : 'text-slate-400/70'
            } ${
                new Date().toDateString() === currentDayDate.toDateString() 
                ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' 
                : ''
            }`}>
                {day}
            </span>
            {!isWorkDay && (
                <span className="text-[10px] text-slate-400 font-medium bg-slate-200/50 px-1.5 py-0.5 rounded">
                    Вых
                </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-24px)] no-scrollbar">
            {dayEvents.map(event => {
              // Get registration status for this event
              const registration = userRegistrations?.find(r => r.eventId === event.id);
              const status = registration ? registration.status : 'approved'; // Default to approved for backward compatibility
              
              // Define styles based on status
              let bgColor = 'bg-blue-50';
              let textColor = 'text-blue-700';
              let borderColor = 'border-blue-100';
              let hoverColor = 'hover:bg-blue-100';
              let statusText = '';
              
              if (status === 'pending') {
                bgColor = 'bg-amber-50';
                textColor = 'text-amber-700';
                borderColor = 'border-amber-200';
                hoverColor = 'hover:bg-amber-100';
                statusText = '⏳';
              } else if (status === 'approved') {
                bgColor = 'bg-green-50';
                textColor = 'text-green-700';
                borderColor = 'border-green-200';
                hoverColor = 'hover:bg-green-100';
                statusText = '✓';
              } else if (status === 'rejected') {
                bgColor = 'bg-red-50';
                textColor = 'text-red-700';
                borderColor = 'border-red-200';
                hoverColor = 'hover:bg-red-100';
                statusText = '✕';
              }
              
              return (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`group/event relative text-[10px] font-medium ${bgColor} ${textColor} p-1.5 rounded-md border ${borderColor} cursor-pointer ${hoverColor} transition-colors pr-6`}
                  title={`${event.title} - ${status === 'pending' ? 'Ожидает одобрения' : status === 'approved' ? 'Одобрено' : 'Отклонено'}`}
                >
                  <div className="truncate flex items-center gap-1">
                    <span className="text-[8px]">{statusText}</span>
                    <span>{event.title}</span>
                  </div>
                  {onUpdateUser && status !== 'rejected' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedIds = user.myEventIds.filter(id => id !== event.id);
                        onUpdateUser({ ...user, myEventIds: updatedIds });
                      }}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/event:opacity-100 p-0.5 rounded-full transition-all ${
                        status === 'pending' ? 'hover:bg-amber-200' : 'hover:bg-green-200'
                      }`}
                      title="Отписаться"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
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
                    <ClockIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">График работы</span>
                  </div>
                  {onUpdateUser ? (
                    <div className="space-y-3">
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

                        {(user.schedule === '2/2' || user.schedule === '4/3' || user.schedule === '5/2') && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs text-slate-500 font-medium ml-1">День начала смены / недели</label>
                                <Input
                                    type="date"
                                    value={user.scheduleStartDate ? user.scheduleStartDate.split('T')[0] : ''}
                                    onChange={(e) => {
                                        onUpdateUser({ ...user, scheduleStartDate: e.target.value });
                                    }}
                                    className="h-9 text-sm bg-slate-50 border-slate-200 focus:ring-blue-500/20 w-full"
                                />
                                <p className="text-[10px] text-slate-400 px-1">
                                    Выберите первый рабочий день цикла для корректного отображения в календаре
                                </p>
                            </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                        <div className="text-sm text-slate-600 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        {user.schedule || 'Не указан'}
                        </div>
                        {user.scheduleStartDate && (['2/2', '4/3', '5/2'].includes(user.schedule || '')) && (
                            <div className="text-xs text-slate-500 flex items-center gap-2 px-1">
                                <span>Начало цикла:</span>
                                <span className="font-medium text-slate-700">
                                    {new Date(user.scheduleStartDate).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Интересы</p>
                    {onUpdateUser && !isAddingInterest && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsAddingInterest(true)}
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Добавить
                        </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {user.interests.length > 0 ? (
                      user.interests.map(tag => (
                        <Badge key={tag} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-medium pr-1.5 gap-1 group/badge">
                          {tag}
                          {onUpdateUser && (
                              <button 
                                onClick={() => handleRemoveInterest(tag)}
                                className="w-4 h-4 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors opacity-60 group-hover/badge:opacity-100"
                              >
                                  <X className="w-2.5 h-2.5" />
                              </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      !isAddingInterest && <p className="text-sm text-slate-400 italic">Интересы не указаны</p>
                    )}
                    
                    {isAddingInterest && (
                        <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in zoom-in-95 duration-200">
                            <Input
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Например: Java"
                                className="h-7 text-sm w-32"
                                autoFocus
                            />
                            <Button size="sm" onClick={handleAddInterest} className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingInterest(false)} className="h-7 px-2">
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
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
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Текущая дата</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
              <span>⏳ Ожидает одобрения</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
              <span>✓ Одобрено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>✕ Отклонено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded"></div>
              <span>Выходной</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal 
        event={selectedEvent} 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}