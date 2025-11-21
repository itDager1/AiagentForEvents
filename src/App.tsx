import React, { useState, useEffect } from 'react';
import { Header } from './components/sber/Header';
import { Auth } from './components/sber/Auth';
import { EventCard } from './components/sber/EventCard';
import { FooterDog } from './components/sber/FooterDog';
import { UserProfile } from './components/sber/UserProfile';
import { EventDetailsModal } from './components/sber/EventDetailsModal';
import { ApiKeySetupNotice } from './components/sber/ApiKeySetupNotice';
import { AdminPanel } from './components/sber/AdminPanel';
import { MOCK_EVENTS, User, Event, EventCategory, Role, EventRegistration } from './data/mock';
import { getAIRecommendations } from './utils/aiService';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Bot, Sparkles, Filter, Calendar, Clock, MapPin, ArrowRight, Check, ArrowUpDown, Shield, RefreshCw, Search as SearchIcon } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Toaster } from 'sonner@2.0.3';
import { scrapeEventInformation } from './utils/eventScraperService';
import { supabase } from './utils/supabaseClient';
import { 
  fetchEvents, 
  seedEvents, 
  getUserProfile, 
  createUserProfile,
  createRegistration,
  getUserRegistrations,
  getApprovedRegistrations
} from './utils/dbService';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { logApiKeyStatus, checkApiKeyStatus } from './utils/checkApiKey';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'catalog' | 'profile' | 'admin'>('catalog');
  const [events, setEvents] = useState<Event[]>([]); // Start empty, fetch from DB
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);

  // API Key Status
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(true);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState<boolean>(false);
  
  // Modal State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'All'>('All');
  const [formatFilter, setFormatFilter] = useState<'All' | 'Онлайн' | 'Оффлайн'>('All');
  const [sortOrder, setSortOrder] = useState<'date_asc' | 'date_desc' | 'title_asc'>('date_asc');

  // AI State
  const [aiRecommendations, setAiRecommendations] = useState<Event[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUpdatingEvents, setIsUpdatingEvents] = useState(false);

  const handleUpdateEvents = async () => {
    setIsUpdatingEvents(true);
    toast.info("Ищу новые события в интернете...");
    
    const queries = [
      "Крупная IT конференция 2025 Россия",
      "Frontend митап Москва 2025",
      "Хакатон по искусственному интеллекту 2025",
      "DevOps конференция 2025"
    ];
    
    let newEventsCount = 0;
    
    try {
      for (const query of queries) {
        // Add a small delay to avoid hitting rate limits too hard
        if (newEventsCount > 0) await new Promise(r => setTimeout(r, 1000));
        
        const result = await scrapeEventInformation(query);
        if (result.success && result.event) {
          // Check if exists
          const exists = events.some(e => e.title === result.event!.title);
          if (!exists) {
             const newEvent = {
               ...result.event,
               id: 'ai-event-' + Date.now() + Math.random().toString(36).substr(2, 9),
             } as Event;
             
             setEvents(prev => [newEvent, ...prev]);
             newEventsCount++;
          }
        }
      }
      
      if (newEventsCount > 0) {
        toast.success(`Найдено и добавлено событий: ${newEventsCount}`);
      } else {
        toast.info("Новых событий не найдено");
      }
    } catch (error) {
      console.error("Error updating events:", error);
      toast.error("Ошибка при поиске событий");
    } finally {
      setIsUpdatingEvents(false);
    }
  };

  // Auth & Data Fetching
  useEffect(() => {
    const init = async () => {
      console.log('%c🧭 Exact Direction - Загрузка приложения...', 'color: #0066FF; font-weight: bold; font-size: 16px;');
      console.log('');
      
      // Check API key status
      if (process.env.NODE_ENV === 'development') {
        logApiKeyStatus();
      }
      
      const status = await checkApiKeyStatus();
      setApiKeyConfigured(status.isConfigured);
      
      if (!status.isConfigured) {
        console.log('%c⚠️ OpenRouter API не настроен', 'color: #F59E0B; font-weight: bold;');
        console.log('%c   → Приложение будет работать с демо-данными', 'color: #6B7280;');
        console.log('%c   → Для настройки см. SUPABASE_API_KEY_SETUP.md', 'color: #3B82F6;');
        console.log('');
      } else {
        console.log('%c✅ OpenRouter API настроен', 'color: #10B981; font-weight: bold;');
        console.log('');
      }

      // 1. Seed events if needed
      console.log('📊 Загрузка событий...');
      await seedEvents();

      // 2. Fetch events
      const fetchedEvents = await fetchEvents();
      setEvents(fetchedEvents);
      console.log(`✅ Загружено ${fetchedEvents.length} событий`);
      console.log('');

      // 3. Check current session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            console.log(`👤 Пользователь: ${profile.name}`);
            
            // Load user registrations
            const regs = await getUserRegistrations(profile.id);
            setUserRegistrations(regs);
          }
        }
      } catch (e) {
        // Ignore session fetch error
      }
      
      setLoading(false);
      console.log('%c🎉 Приложение готово!', 'color: #10B981; font-weight: bold; font-size: 14px;');
      console.log('');
    };
    
    init();

    // 4. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) setUser(profile);
        setIsAuthOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleRecheckApiKey = async () => {
    setIsCheckingApiKey(true);
    const status = await checkApiKeyStatus();
    setApiKeyConfigured(status.isConfigured);
    setIsCheckingApiKey(false);
    
    if (status.isConfigured) {
      toast.success('✅ API ключ настроен корректно!');
    } else {
      toast.error('⚠️ API ключ не настроен');
    }
  };

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
    } catch (e) {
        // ignore
    }
    setUser(null);
    setView('catalog');
  };

  const handleMockLogin = (name: string, role: Role, email: string) => {
      const defaultInterests = ['Обучение', 'Технологии', 'Развитие'];
      const newUser: User = {
          id: 'mock-user-' + Date.now(),
          name,
          role,
          email,
          interests: defaultInterests,
          myEventIds: [],
          isAdmin: true // Mock users are admins for demo
      };
      setUser(newUser);
      setIsAuthOpen(false);
  };

  const handleAdminLogin = (name: string, role: Role, email: string) => {
      const defaultInterests = ['Администрирование', 'Управление', 'Контроль'];
      const adminUser: User = {
          id: 'admin-user-' + Date.now(),
          name,
          role,
          email,
          interests: defaultInterests,
          myEventIds: [],
          isAdmin: true // Admin user
      };
      setUser(adminUser);
      setIsAuthOpen(false);
      setView('admin'); // Automatically open admin panel
  };

  const handleRefreshRegistrations = async () => {
    // Reload registrations from localStorage for current user
    if (user) {
      // For admin, load all approved registrations
      if (user.isAdmin) {
        const approvedRegs = await getApprovedRegistrations();
        setUserRegistrations(approvedRegs);
      } else {
        // For regular users, load only their registrations
        const regs = await getUserRegistrations(user.id);
        setUserRegistrations(regs);
      }
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
      setUser(updatedUser);
      
      // If it's a mock user, just update local state
      if (updatedUser.id.startsWith('mock-user')) {
          toast.success("Профиль обновлен");
          return;
      }
      
      // Save to Supabase
      const { error } = await createUserProfile(updatedUser);
      if (error) {
          console.error('Error updating profile:', error);
          toast.error("Не удалось сохранить изменения профиля.");
      } else {
          toast.success("Профиль обновлен");
      }
  };

  const toggleRegister = async (eventId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      toast.info("Войдите, чтобы записаться на мероприятие");
      return;
    }
    
    // Check if already registered
    const existingReg = userRegistrations.find(r => r.eventId === eventId);
    
    if (existingReg) {
      // Already has a registration
      if (existingReg.status === 'pending') {
        toast.info("Ваша заявка ожидает одобрения администратора");
      } else if (existingReg.status === 'approved') {
        toast.info("Вы уже записаны на это мероприятие");
      } else {
        toast.error("Ваша заявка была отклонена");
      }
      return;
    }
    
    // Create new registration request
    const registration = await createRegistration(user.id, eventId);
    if (registration) {
      setUserRegistrations(prev => [...prev, registration]);
      toast.success("Заявка отправлена! Ожидайте одобрения администратора.");
    } else {
      toast.error("Ошибка при отправке заявки");
    }
  };
  
  // Helper function to get registration status for an event
  const getRegistrationStatus = (eventId: string): 'none' | 'pending' | 'approved' | 'rejected' => {
    const reg = userRegistrations.find(r => r.eventId === eventId);
    return reg ? reg.status : 'none';
  };

  const handleAskAI = async () => {
    if (!user) {
        setIsAuthOpen(true);
        return;
    }
    setIsAiLoading(true);
    try {
      const recommendations = await getAIRecommendations(user, events, '');
      setAiRecommendations(recommendations);
      toast.success("ИИ подобрал для вас мероприятия!");
    } catch (e) {
      toast.error("Ошибка при обращении к ИИ");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filter logic
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                            event.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
      const matchesFormat = formatFilter === 'All' || event.format === formatFilter;
      
      return matchesSearch && matchesCategory && matchesFormat;
    })
    .sort((a, b) => {
        if (sortOrder === 'date_asc') {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortOrder === 'date_desc') {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortOrder === 'title_asc') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onProfileClick={() => {
          handleRefreshRegistrations();
          setView('profile');
        }} 
        onLoginClick={() => setIsAuthOpen(true)}
        onEventsClick={() => {
          // Admin cannot navigate to events catalog
          if (user?.isAdmin) {
            setView('admin');
          } else {
            setView('catalog');
          }
        }}
        onCalendarClick={() => {
          if (!user) {
            setIsAuthOpen(true);
            return;
          }
          handleRefreshRegistrations();
          setView('profile');
        }}
        onAdminClick={() => setView('admin')}
      />

      <Auth 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onMockLogin={handleMockLogin} 
        onAdminLogin={handleAdminLogin}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'profile' && user ? (
          <UserProfile 
            user={user} 
            myEvents={events.filter(e => {
              // Include approved events from myEventIds
              if (user.myEventIds.includes(e.id)) return true;
              // Include events with any registration (pending, approved, rejected)
              const hasRegistration = userRegistrations.some(r => r.eventId === e.id);
              return hasRegistration;
            })}
            userRegistrations={userRegistrations}
            onBack={() => setView('catalog')} 
            onUpdateUser={handleUpdateUser}
          />
        ) : view === 'admin' ? (
          <AdminPanel 
            user={user} 
            onBack={() => setView('catalog')} 
            events={events}
            userRegistrations={userRegistrations}
            onRegistrationsUpdate={handleRefreshRegistrations}
          />
        ) : (
          <div className="space-y-10">
            
            {/* API Key Setup Notice */}
            <ApiKeySetupNotice 
              isConfigured={apiKeyConfigured}
              isChecking={isCheckingApiKey}
              onRecheck={handleRecheckApiKey}
            />
            
            {/* AI Assistant Banner */}
            <div className="bg-white rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-sm border border-blue-100">
              <div className="relative z-10 max-w-3xl">
                 <div className="flex items-center gap-2 text-blue-600 font-bold mb-3 uppercase tracking-wider text-xs">
                   <Sparkles className="w-4 h-4" />
                   <span>AI-АГЕНТ</span>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                   {user ? `Привет, ${user.name}!` : 'Добро пожаловать!'} <br/>
                   <span className="text-blue-600">
                     {user ? 'Развивайся с AI' : 'Найди события для роста'}
                   </span>
                 </h1>
                 <p className="text-slate-500 text-lg mb-8 max-w-xl leading-relaxed">
                   {user 
                     ? `Я проанализировал твой профиль ${user.role}. Вместе мы найдем лучшие события.` 
                     : 'Войдите в систему, чтобы получить персональные рекомендации от нашего ИИ.'
                   }
                 </p>
                 <div className="flex gap-4">
                   <Button 
                     onClick={handleAskAI}
                     disabled={isAiLoading}
                     className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full px-8 h-14 text-lg font-medium shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
                   >
                     {isAiLoading ? 'AI анализирует...' : (user ? 'Подобрать с AI' : 'Войти и подобрать')}
                     <Sparkles className="ml-2 w-5 h-5" />
                   </Button>
                 </div>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none">
                 <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-10 right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* AI Recommendations Section (List View) */}
            {aiRecommendations.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                <div className="flex items-center gap-3 pl-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Персональные рекомендации</h2>
                    <p className="text-slate-500 text-sm">Подобрано специально для вас на основе ваших интересов и графика</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {aiRecommendations.map((event, index) => {
                    const isRegistered = user?.myEventIds.includes(event.id);
                    return (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="group bg-white rounded-3xl p-5 border border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col md:flex-row gap-6 cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Image Section */}
                        <div className="w-full md:w-64 h-48 shrink-0 relative rounded-2xl overflow-hidden">
                          <ImageWithFallback 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/95 text-slate-900 backdrop-blur-md shadow-sm border-none">
                              {event.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {event.title}
                            </h3>
                            <Badge variant="outline" className="shrink-0 hidden sm:flex bg-slate-50">
                              {event.format}
                            </Badge>
                          </div>

                          <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              {event.displayDate || new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              {event.location}
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                             <div className="flex flex-wrap gap-2">
                               {event.tags.slice(0, 3).map(tag => (
                                 <span key={tag} className="text-xs font-medium text-slate-400">#{tag}</span>
                               ))}
                             </div>
                             
                             <Button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleRegister(event.id);
                               }}
                               variant={isRegistered ? "outline" : "default"}
                               className={`rounded-xl transition-all ${
                                 isRegistered 
                                   ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800' 
                                   : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                               }`}
                             >
                               {isRegistered ? (
                                 <>
                                   <Check className="w-4 h-4 mr-2" />
                                   Вы записаны
                                 </>
                               ) : (
                                 <>
                                   Записаться
                                   <ArrowRight className="w-4 h-4 ml-2" />
                                 </>
                               )}
                             </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/50 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
               <div className="flex items-center gap-2 w-full md:w-auto">
                 <div className="relative w-full md:w-72">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <Input 
                     placeholder="Поиск мероприятий..." 
                     className="pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 rounded-xl h-11 transition-all"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                 <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                   <SelectTrigger className="w-[150px] rounded-xl border-transparent bg-gray-50 hover:bg-gray-100 h-11">
                     <SelectValue placeholder="Категория" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="All">Все категории</SelectItem>
                     <SelectItem value="Обучение">Обучение</SelectItem>
                     <SelectItem value="Хакатон">Хакатон</SelectItem>
                     <SelectItem value="Митап">Митап</SelectItem>
                     <SelectItem value="Конференция">Конференция</SelectItem>
                   </SelectContent>
                 </Select>

                 <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as any)}>
                   <SelectTrigger className="w-[140px] rounded-xl border-transparent bg-gray-50 hover:bg-gray-100 h-11">
                     <SelectValue placeholder="Формат" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="All">Любой формат</SelectItem>
                     <SelectItem value="Онлайн">Онлайн</SelectItem>
                     <SelectItem value="Оффлайн">Оффлайн</SelectItem>
                   </SelectContent>
                 </Select>

                 <div className="h-8 w-px bg-gray-200 hidden md:block mx-2"></div>

                 <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                   <SelectTrigger className="w-[180px] rounded-xl border-transparent bg-gray-50 hover:bg-gray-100 h-11">
                     <div className="flex items-center gap-2 truncate">
                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                        <span className="truncate">
                          {sortOrder === 'date_asc' && 'Сначала новые'}
                          {sortOrder === 'date_desc' && 'Сначала старые'}
                          {sortOrder === 'title_asc' && 'По алфавиту'}
                        </span>
                     </div>
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="date_asc">Сначала новые</SelectItem>
                     <SelectItem value="date_desc">Сначала старые</SelectItem>
                     <SelectItem value="title_asc">По алфавиту</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>

            {/* All Events Grid */}
            <div>
              <div className="flex items-center justify-between mb-6 pl-2 pr-2">
                <h2 className="text-2xl font-bold text-slate-900">Все мероприятия</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUpdateEvents}
                  disabled={isUpdatingEvents}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdatingEvents ? 'animate-spin' : ''}`} />
                  {isUpdatingEvents ? 'Обновляем...' : 'Обновить события'}
                </Button>
              </div>
              {(() => {
                const displayEvents = events
                  .filter(event => {
                    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                                          event.description.toLowerCase().includes(search.toLowerCase());
                    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
                    const matchesFormat = formatFilter === 'All' || event.format === formatFilter;
                    
                    return matchesSearch && matchesCategory && matchesFormat;
                  })
                  .sort((a, b) => {
                      if (sortOrder === 'date_asc') {
                          return new Date(a.date).getTime() - new Date(b.date).getTime();
                      } else if (sortOrder === 'date_desc') {
                          return new Date(b.date).getTime() - new Date(a.date).getTime();
                      } else if (sortOrder === 'title_asc') {
                          return a.title.localeCompare(b.title);
                      }
                      return 0;
                  });

                return displayEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        isRegistered={user?.myEventIds.includes(event.id)}
                        onToggleRegister={toggleRegister}
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                     <div className="text-gray-400 mb-2">Ничего не найдено</div>
                     <Button variant="link" onClick={() => {setSearch(''); setCategoryFilter('All'); setFormatFilter('All'); setSortOrder('date_asc');}} className="text-blue-600">
                       Сбросить фильтры
                     </Button>
                  </div>
                );
              })()}
            </div>

          </div>
        )}
      </main>

      <FooterDog />
      
      {/* Event Details Modal */}
      <EventDetailsModal 
        event={selectedEvent} 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}