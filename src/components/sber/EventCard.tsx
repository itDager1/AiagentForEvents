import React from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { Event } from '../../data/mock';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  onToggleRegister: (id: string) => void;
}

export function EventCard({ event, isRegistered, onToggleRegister }: EventCardProps) {
  return (
    <Card className="group overflow-hidden border-transparent shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full rounded-3xl bg-white ring-1 ring-slate-100">
      <div className="relative h-52 overflow-hidden m-2 rounded-2xl">
        <ImageWithFallback 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className="bg-white/95 text-slate-900 hover:bg-white backdrop-blur-md shadow-sm border-none px-3 py-1 font-medium">
            {event.category}
          </Badge>
          {event.format === 'Онлайн' && (
            <Badge className="bg-blue-500/90 text-white hover:bg-blue-600 backdrop-blur-md shadow-sm border-none px-3 py-1">
              Online
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-medium">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
             <Calendar className="w-3.5 h-3.5" />
             {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
           </div>
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
             <Clock className="w-3.5 h-3.5" />
             {new Date(event.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col gap-3">
        <h3 className="font-bold text-xl leading-tight text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-2 leading-relaxed">
          {event.description}
        </p>
        
        <div className="mt-auto flex flex-wrap gap-2">
          {event.tags.map(tag => (
            <span key={tag} className="text-[11px] font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
          <MapPin className="w-3.5 h-3.5" />
          {event.location}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          variant={isRegistered ? "outline" : "default"}
          className={`w-full h-11 rounded-xl font-medium transition-all duration-300 ${
            isRegistered 
              ? 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40'
          }`}
          onClick={() => onToggleRegister(event.id)}
        >
          {isRegistered ? (
            <>
              Вы записаны
              <span className="ml-2 opacity-60 text-xs">(Отменить)</span>
            </>
          ) : (
            <>
              Записаться
              <ArrowRight className="ml-2 w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}