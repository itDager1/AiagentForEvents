import { Event } from '../data/mock';
import { supabase } from './supabaseClient';

/**
 * Result type for event scraping operations
 */
export interface ScrapeResult {
  success: boolean;
  event?: Partial<Event>;
  error?: string;
}

/**
 * Validation result for event data
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Extracts event information from a URL or query string
 */
export async function scrapeEventInformation(urlOrQuery: string): Promise<ScrapeResult> {
  try {
    // Determine if it's a URL or a query
    const isUrl = urlOrQuery.startsWith('http://') || urlOrQuery.startsWith('https://');
    
    if (isUrl) {
      const eventData = await scrapeEventFromUrl(urlOrQuery);
      if (eventData) {
        return { success: true, event: eventData };
      } else {
        return { success: false, error: 'Не удалось извлечь информацию с сайта' };
      }
    } else {
      // It's a query string - search for known events or use AI to find information
      const eventData = await searchEventByQuery(urlOrQuery);
      if (eventData) {
        return { success: true, event: eventData };
      } else {
        return { success: false, error: 'Не удалось найти информацию о мероприятии' };
      }
    }
  } catch (error) {
    console.error('Error in scrapeEventInformation:', error);
    return { success: false, error: 'Ошибка при обработке запроса' };
  }
}

/**
 * Validates event data for completeness and correctness
 */
export function validateEventData(eventData: Partial<Event>): ValidationResult {
  const errors: string[] = [];

  if (!eventData.title || eventData.title.trim() === '') {
    errors.push('Название мероприятия обязательно');
  }

  if (!eventData.description || eventData.description.trim() === '') {
    errors.push('Описание мероприятия обязательно');
  }

  if (!eventData.date) {
    errors.push('Дата мероприятия обязательна');
  } else {
    // Check if date is valid
    const date = new Date(eventData.date);
    if (isNaN(date.getTime())) {
      errors.push('Дата мероприятия имеет неверный формат');
    } else if (date < new Date()) {
      errors.push('Дата мероприятия должна быть в будущем');
    }
  }

  if (!eventData.format) {
    errors.push('Формат мероприятия обязателен');
  }

  if (!eventData.category) {
    errors.push('Категория мероприятия обязательна');
  }

  if (!eventData.location || eventData.location.trim() === '') {
    errors.push('Место проведения обязательно');
  }

  if (!eventData.tags || eventData.tags.length === 0) {
    errors.push('Необходимо указать хотя бы один тег');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Searches for event information by query string (event name)
 */
async function searchEventByQuery(query: string): Promise<Partial<Event> | null> {
  try {
    // Get the API key from Supabase secrets
    const { data: secrets } = await supabase.rpc('get_secret', { secret_name: 'OPENROUTER_API_KEY' });
    const apiKey = secrets;
    
    if (!apiKey) {
      console.error('OpenRouter API key not configured');
      throw new Error('API key not configured');
    }
    
    const prompt = `Найди актуальную информацию о следующем IT-мероприятии: "${query}"

Пожалуйста, верни информацию в формате JSON:
{
  "title": "Точное название мероприятия",
  "description": "Подробное описание мероприятия (2-3 предложения)",
  "date": "Дата начала в формате ISO (YYYY-MM-DDTHH:mm:ss)",
  "displayDate": "Красиво отформатированная дата для отображения (например, '27–28 ноября 2025')",
  "format": "Онлайн" | "Оффлайн" | "Гибрид",
  "category": "Обучение" | "Хакатон" | "Митап" | "Конференция",
  "location": "Место проведения",
  "tags": ["тег1", "тег2", "тег3"],
  "originalLink": "Официальный сайт мероприятия"
}

ВАЖНО:
- Даты должны быть актуальными и в будущем
- Если мероприятие не найдено или информация устарела, верни null
- Формат даты ISO: YYYY-MM-DDTHH:mm:ss
- Категория должна быть одной из: "Обучение", "Хакатон", "Митап", "Конференция"
- Формат должен быть одним из: "Онлайн", "Оффлайн", "Гибрид"

Верни ТОЛЬКО JSON объект или null, без дополнительного текста.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Exact Direction Event Search'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по IT-мероприятиям. Ты находишь актуальную информацию о конференциях, хакатонах и митапах. Всегда возвращай валидный JSON с точными датами или null, если информация недоступна.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    // Check if response is null
    if (aiResponse === 'null' || aiResponse === 'NULL') {
      return null;
    }
    
    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', aiResponse);
      return null;
    }
    
    const eventData = JSON.parse(jsonMatch[0]);
    
    // Validate the extracted data
    if (!eventData.title || !eventData.date) {
      console.error('Missing required fields in extracted data');
      return null;
    }
    
    // Validate date is in the future
    const eventDate = new Date(eventData.date);
    if (eventDate < new Date()) {
      console.error('Event date is in the past, skipping');
      return null;
    }
    
    // Generate image URL
    const imageQuery = eventData.tags?.slice(0, 2).join(' ') || eventData.category || 'tech conference';
    const imageUrl = await getUnsplashImage(imageQuery);
    
    return {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      displayDate: eventData.displayDate,
      format: eventData.format,
      category: eventData.category,
      location: eventData.location,
      tags: eventData.tags || [],
      image: imageUrl,
      originalLink: eventData.originalLink
    };
  } catch (error) {
    console.error('Error searching event:', error);
    return null;
  }
}

/**
 * Extracts event information from a website URL using OpenRouter API
 */
export async function scrapeEventFromUrl(url: string): Promise<Partial<Event> | null> {
  try {
    // First, try to fetch the webpage content
    const pageContent = await fetchWebpageContent(url);
    
    if (!pageContent) {
      console.error('Failed to fetch webpage content');
      return null;
    }
    
    // Use OpenRouter API to extract structured event data
    const extractedData = await extractEventDataWithAI(pageContent, url);
    
    return extractedData;
  } catch (error) {
    console.error('Error scraping event:', error);
    return null;
  }
}

/**
 * Fetches webpage content (in a real implementation, this would use a proxy or serverless function)
 */
async function fetchWebpageContent(url: string): Promise<string | null> {
  try {
    // In a real implementation, you would:
    // 1. Use a CORS proxy or serverless function to fetch the page
    // 2. Handle different content types
    // 3. Extract relevant text content
    
    // For now, we'll simulate this with a mock
    console.log(`Fetching content from: ${url}`);
    
    // Try direct fetch (may fail due to CORS)
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EventBot/1.0)',
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        return html;
      }
    } catch (e) {
      console.log('Direct fetch failed (CORS), using alternative method');
    }
    
    // Alternative: Use a CORS proxy
    // Note: In production, you should use your own proxy service
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching webpage:', error);
    return null;
  }
}

/**
 * Uses OpenRouter API to extract structured event data from HTML content
 */
async function extractEventDataWithAI(htmlContent: string, originalUrl: string): Promise<Partial<Event> | null> {
  try {
    // Get the API key from Supabase secrets
    const { data: secrets } = await supabase.rpc('get_secret', { secret_name: 'OPENROUTER_API_KEY' });
    const apiKey = secrets;
    
    if (!apiKey) {
      console.error('OpenRouter API key not configured');
      throw new Error('API key not configured');
    }
    
    // Clean the HTML to reduce token usage
    const cleanedContent = cleanHtmlContent(htmlContent);
    
    const prompt = `Проанализируй следующий HTML код страницы мероприятия и извлеки структурированную информацию.

URL: ${originalUrl}

HTML (фрагмент):
${cleanedContent.substring(0, 4000)}

Пожалуйста, извлеки следующую информацию и верни в формате JSON:
{
  "title": "Название мероприятия",
  "description": "Подробное описание мероприятия (2-3 предложения)",
  "date": "Дата начала в формате ISO (YYYY-MM-DDTHH:mm:ss)",
  "displayDate": "Красиво отформатированная дата для отображения (например, '27–28 ноября 2025')",
  "format": "Онлайн" | "Оффлайн" | "Гибрид",
  "category": "Обучение" | "Хакатон" | "Митап" | "Конференция",
  "location": "Место проведения",
  "tags": ["тег1", "тег2", "тег3"]
}

ВАЖНО:
- Даты должны быть абсолютно точными и соответствовать информации на сайте
- Если дата в прошлом, пропусти мероприятие
- Формат даты ISO: YYYY-MM-DDTHH:mm:ss
- Категория должна быть одной из: "Обучение", "Хакатон", "Митап", "Конференция"
- Формат должен быть одним из: "Онлайн", "Оффлайн", "Гибрид"
- Теги должны быть на английском и релевантны тематике
- Описание должно быть информативным и кратким

Верни ТОЛЬКО JSON объект, без дополнительного текста.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Exact Direction Event Scraper'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по извлечению структурированных данных о мероприятиях из HTML. Всегда возвращай валидный JSON с точными датами.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for more consistent/factual extraction
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', aiResponse);
      return null;
    }
    
    const eventData = JSON.parse(jsonMatch[0]);
    
    // Validate the extracted data
    if (!eventData.title || !eventData.date) {
      console.error('Missing required fields in extracted data');
      return null;
    }
    
    // Validate date is in the future
    const eventDate = new Date(eventData.date);
    if (eventDate < new Date()) {
      console.error('Event date is in the past, skipping');
      return null;
    }
    
    // Generate image URL using Unsplash
    const imageQuery = eventData.tags?.slice(0, 2).join(' ') || eventData.category || 'tech conference';
    const imageUrl = await getUnsplashImage(imageQuery);
    
    return {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      displayDate: eventData.displayDate,
      format: eventData.format,
      category: eventData.category,
      location: eventData.location,
      tags: eventData.tags || [],
      image: imageUrl,
      originalLink: originalUrl
    };
  } catch (error) {
    console.error('Error extracting data with AI:', error);
    return null;
  }
}

/**
 * Cleans HTML content to extract relevant text
 */
function cleanHtmlContent(html: string): string {
  // Remove script and style tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // Extract text content from common event-related tags
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');
  
  // Get main content areas
  const contentSelectors = [
    'main', 'article', '[role="main"]', '.content', '.event-details',
    '.description', 'h1', 'h2', 'h3', 'time', '.date', '.location'
  ];
  
  let relevantText = '';
  contentSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => {
      relevantText += ' ' + (el.textContent || '');
    });
  });
  
  // If no relevant text found, use body
  if (!relevantText.trim()) {
    relevantText = doc.body.textContent || '';
  }
  
  // Clean up whitespace
  relevantText = relevantText.replace(/\s+/g, ' ').trim();
  
  // Return structured representation
  return `
    Title: ${doc.querySelector('h1')?.textContent || ''}
    Meta Description: ${doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''}
    Content: ${relevantText.substring(0, 3000)}
  `;
}

/**
 * Gets an appropriate image from Unsplash based on the query
 */
async function getUnsplashImage(query: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=YOUR_UNSPLASH_KEY`,
      { method: 'GET' }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.urls.regular;
    }
  } catch (error) {
    console.log('Unsplash fetch failed, using placeholder');
  }
  
  // Fallback to a generic tech conference image
  return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1080&q=80`;
}

/**
 * Batch scrape multiple event URLs
 */
export async function scrapeMultipleEvents(urls: string[]): Promise<Partial<Event>[]> {
  const results: Partial<Event>[] = [];
  
  for (const url of urls) {
    try {
      console.log(`Scraping event from: ${url}`);
      const eventData = await scrapeEventFromUrl(url);
      
      if (eventData) {
        results.push(eventData);
        console.log(`✓ Successfully scraped: ${eventData.title}`);
      } else {
        console.warn(`✗ Failed to scrape: ${url}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  
  return results;
}

/**
 * Updates event dates by re-scraping from original URLs
 */
export async function updateEventDates(events: Event[]): Promise<Event[]> {
  const updatedEvents: Event[] = [];
  
  for (const event of events) {
    if (!event.originalLink) {
      updatedEvents.push(event);
      continue;
    }
    
    try {
      console.log(`Updating dates for: ${event.title}`);
      const scrapedData = await scrapeEventFromUrl(event.originalLink);
      
      if (scrapedData && scrapedData.date) {
        updatedEvents.push({
          ...event,
          date: scrapedData.date,
          displayDate: scrapedData.displayDate,
          description: scrapedData.description || event.description,
          location: scrapedData.location || event.location
        });
        console.log(`✓ Updated: ${event.title} - New date: ${scrapedData.date}`);
      } else {
        updatedEvents.push(event);
      }
      
      // Add delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error updating ${event.title}:`, error);
      updatedEvents.push(event);
    }
  }
  
  return updatedEvents;
}