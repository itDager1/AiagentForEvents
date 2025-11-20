import React from 'react';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface FooterDogProps {
  onSubscribe?: (email: string) => void;
}

export function FooterDog({ onSubscribe }: FooterDogProps) {
  return (
    <div className="mt-auto bg-white border-t border-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase ring-1 ring-blue-100">
              <Sparkles className="w-3 h-3" />
              Sber AI Assistant
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Не пропусти важное <br/> с умным помощником
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Наш ИИ анализирует ваши интересы и роль в компании, чтобы предложить именно те мероприятия, которые помогут вам в карьере.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all">
                Подключить AI <Bot className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Используем OpenRouter API для персонализации.
            </p>
          </div>

          {/* Dog Image Section */}
          <div className="flex items-center justify-center relative">
            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl opacity-70"></div>
            
            {/* The Dog */}
            <div className="relative z-10 w-full max-w-md aspect-square flex items-center justify-center">
               <img 
                 src="https://images.unsplash.com/photo-1552327830-b2cf19940b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nJTIwM2QlMjBpbGx1c3RyYXRpb24lMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzYzNTgxMjUxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                 alt="3D Cute Dog" 
                 className="object-contain w-full h-full drop-shadow-2xl transform hover:scale-105 transition-transform duration-700 ease-out"
               />
               
               {/* Floating Card Element */}
               <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/5 border border-white/50 backdrop-blur-sm max-w-[220px] hidden sm:block animate-bounce duration-[3000ms]">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                   <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Новое событие</span>
                 </div>
                 <p className="text-sm font-bold text-slate-900">Хакатон завтра!</p>
                 <p className="text-xs text-slate-400 mt-1">Вы записаны</p>
               </div>
            </div>
          </div>

        </div>

        {/* Bottom Links */}
        <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-3 font-bold text-slate-900">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                  <path d="M5 12l5 5l10 -10" />
                </svg>
             </div>
             SberEvents
          </div>
          <div className="flex gap-8 font-medium">
            <a href="#" className="hover:text-blue-600 transition-colors">Календарь</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Профиль</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Поддержка</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Правила</a>
          </div>
          <p className="text-slate-400 font-normal">© 2025 Sberbank Tech</p>
        </div>

      </div>
    </div>
  );
}
