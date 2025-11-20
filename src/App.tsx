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
import { Bot, Sparkles, Filter } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Toaster } from 'sonner@2.0.3';
import { supabase } from './utils/supabaseClient';
import { fetchEvents, seedEvents, toggleRegistration, getUserProfile, createUserProfile } from './utils/dbService';

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
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                          event.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    const matchesFormat = formatFilter === 'All' || event.format === formatFilter;
    
    return matchesSearch && matchesCategory && matchesFormat;
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

            {/* AI Recommendations Section (if any) */}
            {aiRecommendations.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-6 pl-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Рекомендовано для вас</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiRecommendations.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isRegistered={user?.myEventIds.includes(event.id)}
                      onToggleRegister={toggleRegister}
                    />
                  ))}
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
                     <SelectItem value="Спорт">Спорт</SelectItem>
                     <SelectItem value="Корпоратив">Корпоратив</SelectItem>
                     <SelectItem value="Хакатон">Хакатон</SelectItem>
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
                   <Button variant="link" onClick={() => {setSearch(''); setCategoryFilter('All'); setFormatFilter('All');}} className="text-blue-600">
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