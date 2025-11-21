import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, X, Building2, Check, ArrowRight } from 'lucide-react';
import { Event } from '../../data/mock';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  isRegistered?: boolean;
  onToggleRegister?: (eventId: string) => void;
}

export function EventDetailsModal({ event, isOpen, onClose, isRegistered = false, onToggleRegister }: EventDetailsModalProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{event.description}</DialogDescription>
        </DialogHeader>
        
        <div className="relative h-64 w-full">
          <ImageWithFallback 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
            <div className="w-full">
                <div className="flex justify-between items-end">
                    <Badge className="bg-white text-slate-900 backdrop-blur-sm shadow-sm border-none mb-2 hover:bg-white">
                    {event.category}
                    </Badge>
                    {event.originalLink && (
                        <Button 
                            size="sm" 
                            className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md mb-2 hidden sm:flex gap-2"
                            onClick={() => window.open(event.originalLink, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4" />
                            Сайт события
                        </Button>
                    )}
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight shadow-black/10 drop-shadow-lg">
                    {event.title}
                </h2>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 bg-white space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-slate-600 border-slate-200 py-1.5 px-3 text-sm font-normal bg-slate-50">
                    {event.format}
                </Badge>
                {event.tags.map(tag => (
                    <span key={tag} className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600 shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Дата</p>
                        <p className="font-semibold text-slate-900">
                            {event.displayDate || new Date(event.date).toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600 shrink-0">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Место проведения</p>
                        <p className="font-semibold text-slate-900">{event.location}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">О событии</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                    {event.description}
                </p>
            </div>

            {event.partners && event.partners.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-900">Партнеры и спонсоры</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {event.partners.map((partner, index) => (
                            <div 
                                key={index}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm flex items-center shadow-sm"
                            >
                                {partner}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {event.originalLink && (
                <div className="pt-4 sm:hidden">
                    <Button 
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20"
                        onClick={() => window.open(event.originalLink, '_blank')}
                    >
                        Перейти на сайт события
                        <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button onClick={onClose} variant="ghost" className="hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                    Закрыть
                </Button>
                {event.originalLink && (
                    <Button 
                        className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 px-6"
                        onClick={() => window.open(event.originalLink, '_blank')}
                    >
                        Перейти на сайт
                        <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                )}
                {onToggleRegister && (
                    <Button 
                        className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 px-6"
                        onClick={() => onToggleRegister(event.id)}
                    >
                        {isRegistered ? (
                            <>
                                <Check className="mr-2 w-4 h-4" />
                                Зарегистрирован
                            </>
                        ) : (
                            <>
                                <ArrowRight className="mr-2 w-4 h-4" />
                                Зарегистрироваться
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}