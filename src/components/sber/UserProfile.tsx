import React from 'react';
import { User, Event, WorkSchedule } from '../../data/mock';
import { EventCard } from './EventCard';
import { Calendar as CalendarIcon, User as UserIcon, Briefcase, Mail, Hash, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface UserProfileProps {
  user: User;
  myEvents: Event[];
  onBack: () => void;
  onUpdateUser?: (user: User) => void;
}

export function UserProfile({ user, myEvents, onBack, onUpdateUser }: UserProfileProps) {
  const handleScheduleChange = (value: WorkSchedule) => {
    if (onUpdateUser) {
      onUpdateUser({ ...user, schedule: value });
    }
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
          {/* Profile Card */}
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
                        <SelectItem value="Гибкий">Гибкий график</SelectItem>
                        <SelectItem value="Удаленка">Удаленная работа</SelectItem>
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

          {/* Stats Card */}
          <Card className="border-transparent shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">Мой календарь</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    У вас запланировано <span className="font-bold text-blue-600">{myEvents.length}</span> {myEvents.length === 1 ? 'мероприятие' : 'мероприятий'} на этот месяц.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: My Events Calendar List */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              Мои мероприятия
            </h2>
            <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-medium">
              {myEvents.length} {myEvents.length === 1 ? 'событие' : 'событий'}
            </Badge>
          </div>

          {myEvents.length > 0 ? (
            <div className="space-y-6">
              {/* Calendar List View */}
              <div className="grid gap-4">
                {myEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                   <div 
                     key={event.id} 
                     className="group flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden"
                   >
                      <div className="w-full sm:w-56 h-36 rounded-xl overflow-hidden shrink-0 relative">
                        <ImageWithFallback 
                          src={event.image} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        <Badge className="absolute top-2 left-2 bg-white/95 text-slate-900 hover:bg-white backdrop-blur-md shadow-sm border-none">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                         <div>
                           <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mb-2 uppercase tracking-wider">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} • {event.format}
                           </div>
                           <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                           <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{event.description}</p>
                         </div>
                         <div className="flex items-center gap-2 mt-4 flex-wrap">
                            {event.tags.map(tag => (
                               <span key={tag} className="text-[11px] font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                 #{tag}
                               </span>
                            ))}
                         </div>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Календарь пуст</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                Запишитесь на мероприятия в каталоге, чтобы они появились здесь.
              </p>
              <Button 
                onClick={onBack} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
              >
                Перейти в каталог
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}