import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Key, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

interface ApiKeySetupNoticeProps {
  isConfigured: boolean;
  isChecking: boolean;
  onRecheck: () => void;
}

export function ApiKeySetupNotice({ isConfigured, isChecking, onRecheck }: ApiKeySetupNoticeProps) {
  // Don't show anything if configured
  if (isConfigured) return null;

  return (
    <Alert className="mb-6 border-[#21A038] bg-gradient-to-r from-[#21A038]/10 to-[#0066FF]/5">
      <Key className="h-5 w-5 text-[#21A038]" />
      <AlertTitle className="text-[#21A038] mb-2 flex items-center gap-2">
        🔑 Требуется настройка OpenRouter API ключа
        <span className="text-xs font-normal text-[#0A3622] bg-[#21A038]/10 px-2 py-0.5 rounded-full">2 минуты</span>
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="text-[#0A3622]">
          Для работы AI-функционала необходимо настроить API ключ в Supabase Edge Functions Secrets:
        </p>
        
        <div className="bg-white/80 rounded-xl p-4 space-y-3 border border-[#21A038]/20">
          <div className="flex items-start gap-3">
            <div className="bg-[#21A038] text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">1</div>
            <div className="flex-1">
              <a 
                href="https://supabase.com/dashboard/project/wwxibvtflekrimlpgijo/settings/functions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0066FF] hover:underline inline-flex items-center gap-1.5 font-medium"
              >
                Открыть Supabase Dashboard
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-[#21A038] text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">2</div>
            <div className="flex-1">
              <p className="text-[#0A3622]">
                Найдите секцию <strong>"Secrets"</strong> → Добавьте/обновите секрет
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-[#21A038] text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">3</div>
            <div className="flex-1">
              <div className="text-[#0A3622] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Имя:</span>
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-slate-700">OPENROUTER_API_KEY</code>
                </div>
                <div className="text-sm text-slate-600">Значение: Ваш новый API ключ</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-[#21A038] text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">4</div>
            <div className="flex-1">
              <p className="text-[#0A3622]">
                Сохраните → Подождите ~30 сек → Нажмите "Проверить подключение"
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button 
            onClick={onRecheck} 
            disabled={isChecking}
            size="sm"
            className="bg-[#21A038] hover:bg-[#1a8030] text-white shadow-md"
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Проверка...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Проверить подключение
              </>
            )}
          </Button>
          <a 
            href="https://github.com/yourusername/exact-direction/blob/main/QUICK_API_KEY_SETUP.md" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0066FF] hover:underline inline-flex items-center gap-1"
          >
            Подробная инструкция
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm">
          <p className="text-slate-700">
            💡 <strong>После настройки будут доступны:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              AI-рекомендации событий на основе профиля
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Автозагрузка актуальных IT-конференций
            </li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}