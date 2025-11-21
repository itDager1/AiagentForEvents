import React, { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { scrapeEventInformation, validateEventData } from '../../utils/eventScraperService';
import { Event, EventFormat, EventCategory } from '../../data/mock';
import { toast } from 'sonner@2.0.3';
import { AITestPanel } from './AITestPanel';

interface EventImporterProps {
  onEventImported?: (event: Event) => void;
}

export function EventImporter({ onEventImported }: EventImporterProps) {
  const [urlOrQuery, setUrlOrQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedEvent, setExtractedEvent] = useState<Partial<Event> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields for the extracted event
  const [editMode, setEditMode] = useState(false);

  const handleExtract = async () => {
    if (!urlOrQuery.trim()) {
      toast.error('Введите URL или название мероприятия');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractedEvent(null);

    const result = await scrapeEventInformation(urlOrQuery);

    setLoading(false);

    if (result.success && result.event) {
      setExtractedEvent(result.event);
      toast.success('Информация успешно извлечена!');
    } else {
      setError(result.error || 'Не удалось извлечь информацию о мероприятии');
      toast.error('Ошибка извлечения данных');
    }
  };

  const handleSaveEvent = () => {
    if (!extractedEvent) return;

    const validation = validateEventData(extractedEvent);

    if (!validation.valid) {
      setError(validation.errors.join(', '));
      toast.error('Проверьте правильность данных');
      return;
    }

    // Generate a proper ID
    const finalEvent: Event = {
      ...extractedEvent,
      id: `event-${Date.now()}`,
      title: extractedEvent.title!,
      description: extractedEvent.description!,
      date: extractedEvent.date!,
      format: extractedEvent.format!,
      category: extractedEvent.category!,
      location: extractedEvent.location!,
      tags: extractedEvent.tags!,
      image: extractedEvent.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
    } as Event;

    // TODO: Save to database
    console.log('Saving event:', finalEvent);
    
    if (onEventImported) {
      onEventImported(finalEvent);
    }

    toast.success('Мероприятие успешно добавлено!');
    
    // Reset form
    setUrlOrQuery('');
    setExtractedEvent(null);
    setEditMode(false);
  };

  const updateEventField = (field: keyof Event, value: any) => {
    if (!extractedEvent) return;
    setExtractedEvent({
      ...extractedEvent,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Status Panel */}
      <AITestPanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Импорт мероприятия с помощью AI
          </CardTitle>
          <CardDescription>
            Введите URL официального сайта мероприятия или его название. 
            AI автоматически извлечет актуальную информацию, включая даты проведения.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <Label htmlFor="url-input">URL или название мероприятия</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="url-input"
                  placeholder="https://highload.ru или HighLoad++ 2025"
                  value={urlOrQuery}
                  onChange={(e) => setUrlOrQuery(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                />
              </div>
              <Button
                onClick={handleExtract}
                disabled={loading || !urlOrQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Извлечение...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Извлечь данные
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Примеры:</span>
            {['https://highload.ru', 'https://holyjs.ru', 'HolyJS 2025', 'Joker Conference'].map((example) => (
              <Badge
                key={example}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => setUrlOrQuery(example)}
              >
                {example}
              </Badge>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Extracted Event Preview */}
          {extractedEvent && (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Извлеченная информация
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Отменить' : 'Редактировать'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editMode ? (
                  // Preview Mode
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-600">Название</Label>
                      <p className="font-medium">{extractedEvent.title}</p>
                    </div>
                    
                    <div>
                      <Label className="text-gray-600">Описание</Label>
                      <p className="text-sm">{extractedEvent.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Дата (ISO)</Label>
                        <p className="text-sm">{extractedEvent.date}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Дата (отображение)</Label>
                        <p className="text-sm">{extractedEvent.displayDate || 'Не указана'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Формат</Label>
                        <p className="text-sm">{extractedEvent.format}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Категория</Label>
                        <p className="text-sm">{extractedEvent.category}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-600">Место проведения</Label>
                      <p className="text-sm">{extractedEvent.location}</p>
                    </div>

                    <div>
                      <Label className="text-gray-600">Теги</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extractedEvent.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {extractedEvent.originalLink && (
                      <div>
                        <Label className="text-gray-600">Официальный сайт</Label>
                        <a
                          href={extractedEvent.originalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          {extractedEvent.originalLink}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Название</Label>
                      <Input
                        id="edit-title"
                        value={extractedEvent.title || ''}
                        onChange={(e) => updateEventField('title', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Описание</Label>
                      <Textarea
                        id="edit-description"
                        value={extractedEvent.description || ''}
                        onChange={(e) => updateEventField('description', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-date">Дата начала (ISO)</Label>
                        <Input
                          id="edit-date"
                          type="datetime-local"
                          value={extractedEvent.date?.slice(0, 16) || ''}
                          onChange={(e) => updateEventField('date', e.target.value + ':00')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-display-date">Дата (для отображения)</Label>
                        <Input
                          id="edit-display-date"
                          placeholder="27–28 ноября 2025"
                          value={extractedEvent.displayDate || ''}
                          onChange={(e) => updateEventField('displayDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-format">Формат</Label>
                        <Select
                          value={extractedEvent.format || ''}
                          onValueChange={(value) => updateEventField('format', value as EventFormat)}
                        >
                          <SelectTrigger id="edit-format">
                            <SelectValue placeholder="Выберите формат" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Онлайн">Онлайн</SelectItem>
                            <SelectItem value="Оффлайн">Оффлайн</SelectItem>
                            <SelectItem value="Гибрид">Гибрид</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-category">Категория</Label>
                        <Select
                          value={extractedEvent.category || ''}
                          onValueChange={(value) => updateEventField('category', value as EventCategory)}
                        >
                          <SelectTrigger id="edit-category">
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Обучение">Обучение</SelectItem>
                            <SelectItem value="Хакатон">Хакатон</SelectItem>
                            <SelectItem value="Митап">Митап</SelectItem>
                            <SelectItem value="Конференция">Конференция</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-location">Место проведения</Label>
                      <Input
                        id="edit-location"
                        value={extractedEvent.location || ''}
                        onChange={(e) => updateEventField('location', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-tags">Теги (через запятую)</Label>
                      <Input
                        id="edit-tags"
                        value={extractedEvent.tags?.join(', ') || ''}
                        onChange={(e) => updateEventField('tags', e.target.value.split(',').map(t => t.trim()))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-link">Официальный сайт</Label>
                      <Input
                        id="edit-link"
                        value={extractedEvent.originalLink || ''}
                        onChange={(e) => updateEventField('originalLink', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExtractedEvent(null);
                      setEditMode(false);
                    }}
                  >
                    Отменить
                  </Button>
                  <Button
                    onClick={handleSaveEvent}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Добавить мероприятие
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Как это работает?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. AI-анализ:</strong> Искусственный интеллект находит информацию о мероприятии на официальных источниках.
          </p>
          <p>
            <strong>2. Извлечение данных:</strong> Система автоматически извлекает название, даты, место проведения и другие детали.
          </p>
          <p>
            <strong>3. Проверка:</strong> Вы можете проверить и отредактировать информацию перед добавлением в систему.
          </p>
          <p className="text-blue-700 mt-4">
            💡 <strong>Совет:</strong> Для лучших результатов используйте официальные сайты известных IT-конференций (HighLoad++, HolyJS, Joker, etc.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}