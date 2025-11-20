import React, { useState } from 'react';
import { Role } from '../../data/mock';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { supabase } from '../../utils/supabaseClient';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createUserProfile } from '../../utils/dbService';
import { toast } from 'sonner@2.0.3';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  onMockLogin?: (name: string, role: Role, email: string) => void;
}

export function Auth({ isOpen, onClose, onMockLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Разработчик');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Sign up
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            password,
            user_metadata: { name }
          })
        });
        
        // Handle response, handling both JSON and text errors
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            const text = await response.text();
            // If success but text, it's weird but okay for some backends
            if (response.ok) {
                result = {}; // Assuming success if ok
            } else {
                throw new Error(text || `Error ${response.status}`);
            }
        }

        if (!response.ok) {
             throw new Error(result?.error || 'Ошибка при регистрации');
        }

        // Auto login
        const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (loginError) throw loginError;

        if (loginData.user) {
          // Create profile
          const defaultInterests = ['Обучение', 'Технологии', 'Развитие'];
          const { error: profileError } = await createUserProfile({
            id: loginData.user.id,
            name,
            role,
            email,
            interests: defaultInterests,
            myEventIds: []
          });
          
          if (profileError) {
             console.error("Profile creation error:", profileError);
             // Silent fail on profile creation, but log it
          }
          toast.success("Регистрация успешна!");
          onClose(); // Close modal on success
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success("Вход выполнен!");
        onClose(); // Close modal on success
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      // If network error or fetch error, fallback to mock login
      if (error.message === 'Failed to fetch' || error.message.includes('fetch') || error.name === 'TypeError') {
         console.log("Network error, falling back to mock login");
         // Mock login
         if (onMockLogin) {
            const mockName = name || email.split('@')[0] || 'Сотрудник';
            onMockLogin(mockName, role, email);
            toast.success("Вход выполнен (Демо режим)");
            onClose();
         }
      } else {
         toast.error(error.message || "Произошла ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Вход в систему</DialogTitle>
        <DialogDescription className="sr-only">
          Форма входа и регистрации для доступа к функционалу SberEvents
        </DialogDescription>
        <Card className="w-full shadow-2xl shadow-blue-900/20 border-none rounded-3xl bg-white/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Sber<span className="text-blue-600">Events</span></CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              Вход в систему
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setIsRegister(v === 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100/80 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Вход</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Регистрация</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="user@sberbank.ru" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="h-10 rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input 
                    id="password" 
                    type="password"
                    name="password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="h-10 rounded-xl"
                  />
                </div>

                {isRegister && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">ФИО</Label>
                      <Input 
                        id="name" 
                        name="name"
                        autoComplete="name"
                        placeholder="Иванов Иван" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Роль</Label>
                      <Select onValueChange={(val) => setRole(val as Role)} defaultValue={role}>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Разработчик">Разработчик</SelectItem>
                          <SelectItem value="Менеджер">Менеджер</SelectItem>
                          <SelectItem value="Дизайнер">Дизайнер</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Аналитик">Аналитик</SelectItem>
                          <SelectItem value="Стажер">Стажер</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-4" 
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : (isRegister ? 'Создать аккаунт' : 'Войти')}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="text-center text-xs text-slate-400 justify-center pb-6">
             Sber Tech &bull; 2025
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}