import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { scrapeEventInformation } from '../../utils/eventScraperService';

export function AITestPanel() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const testAI = async () => {
    setTesting(true);
    setResult(null);
    setMessage('');

    try {
      // Test with a well-known conference
      const testResult = await scrapeEventInformation('HighLoad++ 2025');
      
      if (testResult.success && testResult.event) {
        setResult('success');
        setMessage(`AI успешно извлекла информацию о "${testResult.event.title}"`);
      } else {
        setResult('error');
        setMessage(testResult.error || 'Не удалось извлечь данные');
      }
    } catch (error) {
      setResult('error');
      setMessage('Ошибка подключения к AI');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Статус AI-системы
        </CardTitle>
        <CardDescription>
          Проверка работоспособности системы извлечения информации о мероприятиях
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">OpenRouter API</Badge>
              <span className="text-sm text-gray-600">Подключено</span>
            </div>
            <p className="text-xs text-gray-500">
              Модель готова к извлечению данных с официальных сайтов
            </p>
          </div>
          
          <Button
            onClick={testAI}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Тестирование...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Проверить AI
              </>
            )}
          </Button>
        </div>

        {result && (
          <Alert variant={result === 'success' ? 'default' : 'destructive'}>
            {result === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            💡 <strong>Возможности AI:</strong> Система может автоматически находить информацию о известных IT-конференциях (HighLoad++, HolyJS, Joker, Heisenbug и др.) и извлекать актуальные даты проведения, место, описание и другие детали.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
