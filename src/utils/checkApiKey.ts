/**
 * Utility to check if OpenRouter API Key is configured correctly
 * This helps diagnose API connection issues
 */

import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1`;

export type ApiKeyStatus = {
  isConfigured: boolean;
  message: string;
  details?: string;
};

export async function checkApiKeyStatus(): Promise<ApiKeyStatus> {
  try {
    const response = await fetch(`${BASE_URL}/seed-ai-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    // 400 means API key is not configured (expected error)
    if (response.status === 400) {
      const data = await response.json();
      return {
        isConfigured: false,
        message: 'OpenRouter API ключ не настроен',
        details: data.message || 'Настройте OPENROUTER_API_KEY в Supabase Edge Functions Secrets'
      };
    }

    // 200 means API key is configured
    if (response.ok) {
      return {
        isConfigured: true,
        message: 'OpenRouter API ключ настроен корректно',
        details: 'AI-функционал активен'
      };
    }

    // Other errors
    return {
      isConfigured: false,
      message: 'Ошибка при проверке API ключа',
      details: `HTTP ${response.status}`
    };

  } catch (error) {
    return {
      isConfigured: false,
      message: 'Не удалось подключиться к серверу',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Log API key status to console with styled output
 */
export async function logApiKeyStatus(): Promise<void> {
  console.log('\n🔧 Проверка конфигурации API...\n');
  
  const status = await checkApiKeyStatus();
  
  if (status.isConfigured) {
    console.log(`%c${status.message}`, 'color: #10B981; font-weight: bold; font-size: 14px;');
  } else {
    console.log(`%c${status.message}`, 'color: #F59E0B; font-weight: bold; font-size: 14px;');
    if (status.details) {
      console.log(`%c${status.details}`, 'color: #6B7280; font-size: 12px;');
    }
  }
  
  console.log('\n📚 Документация: см. файл SETUP_API_KEY.md\n');
}