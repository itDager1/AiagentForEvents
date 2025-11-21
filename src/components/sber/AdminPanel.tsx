import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, User, Calendar, ArrowLeft, Download, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getAllRegistrations, updateRegistrationStatus, getUserProfile } from '../../utils/dbService';
import { EventRegistration, Event, User as UserType } from '../../data/mock';
import { EventImporter } from './EventImporter';
import { EventScraperPanel } from './EventScraperPanel';

interface AdminPanelProps {
  events: Event[];
  user: UserType | null;
  onBack: () => void;
  userRegistrations: EventRegistration[];
  onRegistrationsUpdate?: () => void;
}

export function AdminPanel({ events, user, onBack, userRegistrations: initialRegs, onRegistrationsUpdate }: AdminPanelProps) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>(initialRegs);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [activeTab, setActiveTab] = useState<'registrations' | 'import' | 'scraper'>('registrations');
  const [userProfiles, setUserProfiles] = useState<Map<string, UserType>>(new Map());

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const regs = await getAllRegistrations();
    setRegistrations(regs);
    
    // Load user profiles for all registrations
    const profilesMap = new Map<string, UserType>();
    for (const reg of regs) {
      if (!profilesMap.has(reg.userId)) {
        const profile = await getUserProfile(reg.userId);
        if (profile) {
          profilesMap.set(reg.userId, profile);
        }
      }
    }
    setUserProfiles(profilesMap);
    
    setLoading(false);
  };

  const handleApprove = async (registrationId: string) => {
    const updated = await updateRegistrationStatus(registrationId, 'approved');
    if (updated) {
      setRegistrations(prev => 
        prev.map(reg => reg.id === registrationId ? updated : reg)
      );
      toast.success('Заявка одобрена');
      // Notify parent to refresh registrations
      if (onRegistrationsUpdate) {
        onRegistrationsUpdate();
      }
    } else {
      toast.error('Ошибка при одобрении заявки');
    }
  };

  const handleReject = async (registrationId: string) => {
    const updated = await updateRegistrationStatus(registrationId, 'rejected');
    if (updated) {
      setRegistrations(prev => 
        prev.map(reg => reg.id === registrationId ? updated : reg)
      );
      toast.error('Заявка отклонена');
      // Notify parent to refresh registrations
      if (onRegistrationsUpdate) {
        onRegistrationsUpdate();
      }
    } else {
      toast.error('Ошибка при отклонении заявки');
    }
  };

  const getEventById = (eventId: string) => {
    return events.find(e => e.id === eventId);
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  const handleEventImported = (event: Event) => {
    console.log('New event imported:', event);
    toast.success(`Мероприятие "${event.title}" успешно добавлено!`);
    // TODO: Save to database and refresh events list
  };

  const handleEventScraped = (eventData: Partial<Event>) => {
    // Generate unique ID for the new event
    const newEvent: Event = {
      id: 'scraped-' + Date.now(),
      title: eventData.title || 'Новое мероприятие',
      description: eventData.description || '',
      date: eventData.date || new Date().toISOString(),
      displayDate: eventData.displayDate,
      format: eventData.format || 'Оффлайн',
      category: eventData.category || 'Конференция',
      location: eventData.location || '',
      tags: eventData.tags || [],
      image: eventData.image || '',
      originalLink: eventData.originalLink
    };

    console.log('New event scraped:', newEvent);
    toast.success(`✅ Мероприятие "${newEvent.title}" успешно добавлено!`);
    // TODO: Save to database and refresh events list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl tracking-tight mb-2">Панель администратора</h1>
        <p className="text-gray-600">Управление заявками и импорт новых мероприятий</p>
      </div>

      {/* Tabs for different admin sections */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="registrations">
            <Calendar className="w-4 h-4 mr-2" />
            Заявки на мероприятия
          </TabsTrigger>
          <TabsTrigger value="scraper">
            <Globe className="w-4 h-4 mr-2" />
            Сбор мероприятий (AI)
          </TabsTrigger>
          <TabsTrigger value="import">
            <Download className="w-4 h-4 mr-2" />
            Ручной импорт
          </TabsTrigger>
        </TabsList>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl">{stats.total}</div>
                  <div className="text-sm text-gray-600">Всего заявок</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl text-amber-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Ожидают</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl text-green-600">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Одобрено</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Отклонено</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Все
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
            >
              Ожидают
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              size="sm"
            >
              Одобрено
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
              size="sm"
            >
              Отклонено
            </Button>
          </div>

          {/* Registrations List */}
          <div className="space-y-4">
            {filteredRegistrations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    Нет заявок с таким статусом
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredRegistrations.map(registration => {
                const event = getEventById(registration.eventId);
                const userProfile = userProfiles.get(registration.userId);

                return (
                  <Card key={registration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Event Info */}
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                            <div>
                              <h3 className="font-medium">{event?.title || 'Неизвестное событие'}</h3>
                              <p className="text-sm text-gray-600">
                                {event?.displayDate || (event?.date ? new Date(event.date).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                }) : 'Дата неизвестна')}
                              </p>
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              {userProfile ? (
                                <>
                                  <div className="text-sm font-medium">{userProfile.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {userProfile.email} • {userProfile.role}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm">Пользователь {registration.userId.substring(0, 8)}...</div>
                                  <div className="text-xs text-gray-500">ID: {registration.userId}</div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {registration.status === 'pending' && (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Ожидает решения
                              </Badge>
                            )}
                            {registration.status === 'approved' && (
                              <Badge className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Одобрено
                              </Badge>
                            )}
                            {registration.status === 'rejected' && (
                              <Badge className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="w-3 h-3 mr-1" />
                                Отклонено
                              </Badge>
                            )}
                          </div>

                          {/* Date */}
                          <div className="text-xs text-gray-500">
                            Подана: {new Date(registration.createdAt).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        {registration.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(registration.id)}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Одобрить
                            </Button>
                            <Button
                              onClick={() => handleReject(registration.id)}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Отклонить
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="mt-6">
          <EventImporter onEventImported={handleEventImported} />
        </TabsContent>

        {/* Scraper Tab */}
        <TabsContent value="scraper" className="mt-6">
          <EventScraperPanel onEventScraped={handleEventScraped} />
        </TabsContent>
      </Tabs>
    </div>
  );
}