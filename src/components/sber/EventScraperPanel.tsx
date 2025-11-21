import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Globe, Plus, Loader2, CheckCircle2, XCircle, Calendar, MapPin, Tag } from 'lucide-react';
import { scrapeEventFromUrl, scrapeMultipleEvents } from '../../utils/eventScraperService';
import { Event } from '../../data/mock';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EventScraperPanelProps {
  onEventScraped: (eventData: Partial<Event>) => void;
}

export function EventScraperPanel({ onEventScraped }: EventScraperPanelProps) {
  const [url, setUrl] = useState('');
  const [multipleUrls, setMultipleUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedEvent, setScrapedEvent] = useState<Partial<Event> | null>(null);
  const [mode, setMode] = useState<'single' | 'multiple'>('single');

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error('Введите URL мероприятия');
      return;
    }

    setLoading(true);
    setScrapedEvent(null);

    try {
      const eventData = await scrapeEventFromUrl(url.trim());

      if (eventData) {
        setScrapedEvent(eventData);
        toast.success('✅ Информация о мероприятии успешно извлечена!');
      } else {
        toast.error('❌ Не удалось извлечь информацию с сайта');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error('Ошибка при обработке URL');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleScrape = async () => {
    const urls = multipleUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) {
      toast.error('Введите хотя бы один URL');
      return;
    }

    setLoading(true);

    try {
      toast.info(`🤖 Обрабатываю ${urls.length} мероприятий...`);
      const events = await scrapeMultipleEvents(urls);

      if (events.length > 0) {
        // Add all events
        for (const event of events) {
          onEventScraped(event);
        }
        toast.success(`✅ Успешно добавлено ${events.length} мероприятий!`);
        setMultipleUrls('');
      } else {
        toast.error('Не удалось извлечь информацию ни с одного сайта');
      }
    } catch (error) {
      console.error('Multiple scraping error:', error);
      toast.error('Ошибка при обработке URL');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    if (scrapedEvent) {
      onEventScraped(scrapedEvent);
      toast.success('✅ Мероприятие добавлено!');
      setScrapedEvent(null);
      setUrl('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            AI Парсер мероприятий
          </h2>
          <p className="text-slate-500 text-sm">
            Автоматическое извлечение информации с официальных сайтов
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <Button
          variant={mode === 'single' ? 'default' : 'ghost'}
          onClick={() => setMode('single')}
          className={`rounded-lg ${
            mode === 'single'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Одно мероприятие
        </Button>
        <Button
          variant={mode === 'multiple' ? 'default' : 'ghost'}
          onClick={() => setMode('multiple')}
          className={`rounded-lg ${
            mode === 'multiple'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Несколько мероприятий
        </Button>
      </div>

      {mode === 'single' ? (
        <>
          {/* Single URL Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              URL страницы мероприятия
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="https://highload.ru или https://holyjs.ru"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 rounded-xl h-12 bg-white border-slate-200"
                disabled={loading}
              />
              <Button
                onClick={handleScrape}
                disabled={loading || !url.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Извлечь данные
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              💡 AI проанализирует страницу и извлечет: название, даты, описание, формат и локацию
            </p>
          </div>

          {/* Scraped Event Preview */}
          {scrapedEvent && (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200 rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Данные успешно извлечены</span>
                </div>
                <Badge className="bg-green-600 text-white">
                  {scrapedEvent.category}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                {scrapedEvent.image && (
                  <div className="rounded-xl overflow-hidden h-48">
                    <ImageWithFallback
                      src={scrapedEvent.image}
                      alt={scrapedEvent.title || 'Event'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">
                    {scrapedEvent.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {scrapedEvent.description}
                  </p>

                  <div className="space-y-2">
                    {scrapedEvent.displayDate && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{scrapedEvent.displayDate}</span>
                      </div>
                    )}
                    {scrapedEvent.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{scrapedEvent.location}</span>
                      </div>
                    )}
                    {scrapedEvent.tags && scrapedEvent.tags.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Tag className="w-4 h-4 text-blue-500" />
                        <div className="flex flex-wrap gap-1">
                          {scrapedEvent.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleAddEvent}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 shadow-lg shadow-green-600/20"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Добавить мероприятие
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Multiple URLs Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Список URL (по одному на строку)
            </label>
            <textarea
              placeholder="https://highload.ru&#10;https://holyjs.ru&#10;https://heisenbug.ru"
              value={multipleUrls}
              onChange={(e) => setMultipleUrls(e.target.value)}
              className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                💡 AI обработает все URL последовательно и добавит мероприятия автоматически
              </p>
              <Button
                onClick={handleMultipleScrape}
                disabled={loading || !multipleUrls.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Извлечь все
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Как AI извлекает точные даты
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>📅 <strong>Приоритет 1:</strong> HTML элементы &lt;time datetime&gt; с ISO датами</li>
          <li>🔍 <strong>Приоритет 2:</strong> JSON-LD структурированные данные (schema.org)</li>
          <li>📍 <strong>Приоритет 3:</strong> CSS классы .date, .event-date, .schedule</li>
          <li>📝 <strong>Приоритет 4:</strong> Текстовые паттерны дат в контенте</li>
          <li>✅ Все даты проверяются на актуальность (только будущие)</li>
          <li>🎯 Используется дата НАЧАЛА для многодневных событий</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-blue-300">
          <p className="text-xs text-blue-700">
            💡 <strong>Для лучших результатов:</strong> Используйте официальные сайты известных конференций (highload.ru, holyjs.ru, heisenbug.ru, jokerconf.com и т.д.). AI проанализирует всю страницу и найдет самую точную информацию о датах проведения.
          </p>
        </div>
      </div>
    </div>
  );
}