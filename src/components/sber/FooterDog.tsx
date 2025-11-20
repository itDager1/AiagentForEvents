import React from 'react';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import catImage from 'figma:asset/be6c08208236b0d0ab12c3b7522e41ad4d459818.png';

interface FooterDogProps {
  onSubscribe?: (email: string) => void;
}

export function FooterDog({ onSubscribe }: FooterDogProps) {
  return (
    <div className="mt-auto bg-white border-t border-gray-100 relative overflow-hidden">
      <div className="w-full bg-black text-white py-20">
        <div className="container mx-auto px-4 relative z-10">
          
          {/* Main CTA */}
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
               Присоединяйся<br/>к команде Сбера
             </h2>
             <Button className="rounded-full border border-white/30 text-white bg-transparent hover:bg-white hover:text-black px-10 h-14 text-lg transition-all">
               Хочу в команду
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Left: Logo & Legal */}
            <div className="md:col-span-3 space-y-8">
               <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500 font-medium mb-2">Powered by</span>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-blue-500 font-bold text-3xl tracking-wide uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>ПУЛЬС</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full"></div>
                     </div>
                     <span className="font-semibold tracking-widest text-sm">СБЕР</span>
                  </div>
               </div>
               
               <div className="text-[10px] text-gray-600 leading-relaxed max-w-[240px] pt-12">
                  © 1997—2025 ПАО Сбербанк. Генеральная лицензия на осуществление банковских операций от 11 августа 2015 года. Регистрационный номер — 1481<br/>
                  <a href="https://sberbank.ru" className="underline hover:text-white transition-colors mt-1 inline-block">www.sberbank.ru</a>
               </div>
            </div>

            {/* Middle: Links */}
            <div className="md:col-span-5 grid grid-cols-2 gap-8 pt-2">
               <div className="space-y-4">
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">IT в Сбере</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">Команды</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">Локации</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">События</a>
               </div>
               <div className="space-y-4">
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">AI в Сбере</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">Почему мы</a>
                  <a href="#" className="block text-gray-400 hover:text-white transition-colors font-medium">Все вакансии</a>
               </div>
            </div>

            {/* Right: Cat */}
            <div className="md:col-span-4 relative flex flex-col items-end justify-between h-full">
                {/* Cat Image */}
                <div className="relative w-full max-w-[300px] aspect-square mb-8">
                   <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                     {/* Grass */}
                     <path d="M10 180 Q 30 150 50 180 T 90 180 T 130 180 T 170 180 T 210 180 V 200 H 0 V 180 Z" fill="#1E3A8A" />
                     <path d="M0 185 Q 20 160 40 185 T 80 185 T 120 185 T 160 185 T 200 185 V 200 H 0 Z" fill="#2563EB" opacity="0.7" />
                     
                     {/* Dog Body */}
                     <path d="M60 130 Q 60 100 90 100 H 130 Q 160 100 160 130 V 170 H 140 V 140 H 130 V 170 H 90 V 140 H 80 V 170 H 60 Z" fill="white" />
                     
                     {/* Dog Head */}
                     <circle cx="70" cy="90" r="35" fill="white" />
                     
                     {/* Ears */}
                     <path d="M40 70 L 50 50 L 70 60 Z" fill="#3B82F6" />
                     <path d="M100 70 L 90 50 L 70 60 Z" fill="#3B82F6" />
                     
                     {/* Eyes */}
                     <circle cx="60" cy="85" r="4" fill="#1E3A8A" />
                     <circle cx="80" cy="85" r="4" fill="#1E3A8A" />
                     
                     {/* Nose */}
                     <circle cx="70" cy="95" r="5" fill="#1E3A8A" />
                     
                     {/* Collar */}
                     <rect x="85" y="100" width="5" height="30" fill="#2563EB" transform="rotate(90 87.5 115)" />
                     
                     {/* Tail */}
                     <path d="M160 110 Q 180 100 180 80" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />
                   </svg>
                </div>
                
                <div className="text-right text-xs text-gray-600 space-y-2 w-full">
                   <a href="#" className="block hover:text-white transition-colors">Юридические документы</a>
                   <a href="#" className="block hover:text-white transition-colors">Политика конфиденциальности</a>
                   <a href="#" className="block hover:text-white transition-colors">Политика обработки данных</a>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
