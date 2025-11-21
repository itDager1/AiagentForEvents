/**
 * System Health Check Utility
 * Проверяет статус всех критически важных компонентов приложения
 */

import { projectId, publicAnonKey } from './supabase/info';
import { checkApiKeyStatus } from './checkApiKey';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1`;

interface HealthCheckResult {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: string;
}

/**
 * Проверка доступности Supabase Edge Functions
 */
async function checkEdgeFunctions(): Promise<HealthCheckResult> {
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (response.ok) {
      return {
        component: 'Supabase Edge Functions',
        status: 'ok',
        message: 'Edge Functions работают корректно'
      };
    }

    return {
      component: 'Supabase Edge Functions',
      status: 'warning',
      message: 'Edge Functions доступны, но возвращают ошибки',
      details: `Status: ${response.status}`
    };
  } catch (error) {
    return {
      component: 'Supabase Edge Functions',
      status: 'error',
      message: 'Не удалось подключиться к Edge Functions',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Проверка KV Store
 */
async function checkKVStore(): Promise<HealthCheckResult> {
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const hasEvents = data.data && Array.isArray(data.data) && data.data.length > 0;
      
      if (hasEvents) {
        return {
          component: 'Supabase KV Store',
          status: 'ok',
          message: `KV Store работает (${data.data.length} событий)`
        };
      } else {
        return {
          component: 'Supabase KV Store',
          status: 'warning',
          message: 'KV Store пуст (события не загружены)',
          details: 'Запустите функцию /seed-ai-events для загрузки событий'
        };
      }
    }

    return {
      component: 'Supabase KV Store',
      status: 'error',
      message: 'Не удалось получить данные из KV Store',
      details: `Status: ${response.status}`
    };
  } catch (error) {
    return {
      component: 'Supabase KV Store',
      status: 'error',
      message: 'Ошибка при доступе к KV Store',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Проверка OpenRouter API ключа
 */
async function checkOpenRouterKey(): Promise<HealthCheckResult> {
  const result = await checkApiKeyStatus();
  
  return {
    component: 'OpenRouter API Key',
    status: result.isConfigured ? 'ok' : 'warning',
    message: result.message,
    details: result.details
  };
}

/**
 * Полная проверка системы
 */
export async function runSystemHealthCheck(): Promise<HealthCheckResult[]> {
  const checks = await Promise.all([
    checkEdgeFunctions(),
    checkKVStore(),
    checkOpenRouterKey()
  ]);

  return checks;
}

/**
 * Вывод результатов в консоль с красивым форматированием
 */
export async function logSystemHealth(): Promise<void> {
  // ASCII Art Banner
  console.log('\n%c╔═══════════════════════════════════════════════════════╗', 'color: #0066FF; font-weight: bold;');
  console.log('%c║                                                       ║', 'color: #0066FF; font-weight: bold;');
  console.log('%c║          🧭  E X A C T   D I R E C T I O N           ║', 'color: #0066FF; font-weight: bold; font-size: 16px;');
  console.log('%c║              AI-powered Event Platform                ║', 'color: #0066FF; font-weight: bold;');
  console.log('%c║                                                       ║', 'color: #0066FF; font-weight: bold;');
  console.log('%c╚═══════════════════════════════════════════════════════╝', 'color: #0066FF; font-weight: bold;');
  
  console.log('\n┌─────────────────────────────────────────────────┐');
  console.log('│  🏥 System Health Check                         │');
  console.log('└─────────────────────────────────────────────────┘\n');

  const results = await runSystemHealthCheck();

  results.forEach((result, index) => {
    const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const color = result.status === 'ok' ? '#10B981' : result.status === 'warning' ? '#F59E0B' : '#EF4444';
    
    console.log(`${icon} ${result.component}`);
    console.log(`%c   ${result.message}`, `color: ${color}; font-weight: 500;`);
    
    if (result.details) {
      console.log(`%c   ${result.details}`, 'color: #9CA3AF; font-size: 11px;');
    }
    
    if (index < results.length - 1) {
      console.log('');
    }
  });

  // Итоговый статус
  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  console.log('\n─────────────────────────────────────────────────');
  
  if (hasErrors) {
    console.log('%c❌ Система работает с ошибками', 'color: #EF4444; font-weight: bold;');
    console.log('\n🔧 Рекомендация: Проверьте Supabase Dashboard и настройки');
  } else if (hasWarnings) {
    console.log('%c⚠️ Система работает, но есть предупреждения', 'color: #F59E0B; font-weight: bold;');
    
    // Check specifically for API key warning
    const apiKeyWarning = results.find(r => r.component === 'OpenRouter API Key' && r.status === 'warning');
    if (apiKeyWarning) {
      console.log('\n┌────────────────────────────────────────────────────────┐');
      console.log('│  ⚠️  ВНИМАНИЕ: Требуется настройка API ключа         │');
      console.log('└────────────────────────────────────────────────────────┘');
      console.log('\n%c🔑 Шаги для настройки:', 'font-weight: bold; color: #F59E0B;');
      console.log('%c1. Откройте Supabase Dashboard', 'color: #6B7280;');
      console.log('%c   https://supabase.com/dashboard/project/wwxibvtflekrimlpgijo/settings/functions', 'color: #3B82F6; text-decoration: underline;');
      console.log('%c2. Перейдите в Edge Functions → Secrets', 'color: #6B7280;');
      console.log('%c3. Добавьте секрет: OPENROUTER_API_KEY = ваш_ключ', 'color: #6B7280;');
      console.log('%c4. Перезапустите приложение', 'color: #6B7280;');
      console.log('\n%c📚 Подробная инструкция: см. SETUP_API_KEY.md', 'color: #10B981; font-weight: bold;');
    }
  } else {
    console.log('%c✅ Все системы работают нормально', 'color: #10B981; font-weight: bold;');
    console.log('\n🎉 Приложение готово к использованию!');
  }

  console.log('\n📚 Документация: см. SETUP_API_KEY.md и README.md\n');
}

/**
 * Упрощенная проверка для быстрой диагностики
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const results = await runSystemHealthCheck();
    const hasErrors = results.some(r => r.status === 'error');
    return !hasErrors;
  } catch (error) {
    return false;
  }
}