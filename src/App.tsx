import React, { useState, useEffect } from 'react';
import { Header } from './components/sber/Header';
import { Auth } from './components/sber/Auth';
import { EventCard } from './components/sber/EventCard';
import { FooterDog } from './components/sber/FooterDog';
import { UserProfile } from './components/sber/UserProfile';
import { MOCK_EVENTS, User, Event, EventCategory, Role } from './data/mock';
import { getAIRecommendations } from './utils/aiService';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Bot, Sparkles, Filter, Calendar, Clock, MapPin, ArrowRight, Check, ArrowUpDown } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Toaster } from 'sonner@2.0.3';
import { supabase } from './utils/supabaseClient';
import { fetchEvents, seedEvents, toggleRegistration, getUserProfile, createUserProfile } from './utils/dbService';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'catalog' | 'profile'>('catalog');
  const [events, setEvents] = useState<Event[]>([]); // Start empty, fetch from DB
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'All'>('All');
  const [formatFilter, setFormatFilter] = useState<'All' | 'Онлайн' | 'Оффлайн'>('All');
  const [sortOrder, setSortOrder] = useState<'date_asc' | 'date_desc' | 'title_asc'>('date_asc');

  // AI State
  const [aiRecommendations, setAiRecommendations] = useState<Event[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auth & Data Fetching
  useEffect(() => {
    const init = async () => {
      // 1. Seed events if needed
      await seedEvents();

      // 2. Fetch events
      const fetchedEvents = await fetchEvents();
      setEvents(fetchedEvents);

      // 3. Check current session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          if (profile) setUser(profile);
        }
      } catch (e) {
        // Ignore session fetch error
      }
      
      setLoading(false);
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
          myEventIds: []
      };
      setUser(newUser);
      setIsAuthOpen(false);
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
    
    const isRegistered = user.myEventIds.includes(eventId);
    
    // Optimistic update
    let newIds;
    if (isRegistered) {
      newIds = user.myEventIds.filter(id => id !== eventId);
      toast.info("Вы отменили регистрацию");
    } else {
      newIds = [...user.myEventIds, eventId];
      toast.success("Вы успешно записаны на мероприятие!");
    }
    setUser({ ...user, myEventIds: newIds });

    // API call
    const { error } = await toggleRegistration(user.id, eventId, isRegistered);
    if (error) {
        // If it's a mock user (demo mode), ignore DB errors
        if (user.id.startsWith('mock-user')) {
            return;
        }
        // Revert if error and not mock user
        toast.error("Ошибка при обновлении регистрации");
    }
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
        onProfileClick={() => setView('profile')} 
        onLoginClick={() => setIsAuthOpen(true)}
        onEventsClick={() => setView('catalog')}
      />

      <Auth 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onMockLogin={handleMockLogin} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'profile' && user ? (
          <UserProfile 
            user={user} 
            myEvents={events.filter(e => user.myEventIds.includes(e.id))}
            onBack={() => setView('catalog')} 
            onUpdateUser={handleUpdateUser}
          />
        ) : (
          <div className="space-y-10">
            
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
                     {isAiLoading ? 'Думаю...' : (user ? 'Подобрать события' : 'Войти и подобрать')}
                     <Bot className="ml-2 w-5 h-5" />
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
                        className="group bg-white rounded-3xl p-5 border border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col md:flex-row gap-6"
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
                              {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {new Date(event.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
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
                               onClick={() => toggleRegister(event.id)}
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pl-2">Все мероприятия</h2>
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isRegistered={user?.myEventIds.includes(event.id)}
                      onToggleRegister={toggleRegister}
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
              )}
            </div>

          </div>
        )}
      </main>

      <FooterDog />
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