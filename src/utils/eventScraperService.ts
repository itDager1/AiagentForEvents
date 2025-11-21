import { Event } from '../data/mock';
import { supabase } from './supabaseClient';
import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1`;

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
    errors.push('Формат мероприятия обязателе��');
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
    const response = await fetch(`${BASE_URL}/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Search API error:', errorText);
      throw new Error(`AI Search API error: ${response.status}`);
    }
    
    const aiResponse = await response.json();
    
    // Check if response is null or error
    if (!aiResponse || aiResponse.error) {
      return null;
    }
    
    let eventData = aiResponse;
    if (aiResponse.choices) {
        // If backend returned raw OpenRouter response
        const content = aiResponse.choices[0].message.content;
        const match = content.match(/\{[\s\S]*\}/);
        if (match) eventData = JSON.parse(match[0]);
        else return null;
    }
    
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
      originalLink: eventData.originalLink,
      partners: eventData.partners || []
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
    
    // Use Backend API to extract structured event data
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
 * Uses Backend API to extract structured event data from HTML content
 */
async function extractEventDataWithAI(htmlContent: string, originalUrl: string): Promise<Partial<Event> | null> {
  try {
    // Clean the HTML to reduce token usage
    const cleanedContent = cleanHtmlContent(htmlContent);
    
    const response = await fetch(`${BASE_URL}/ai-extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ 
        content: cleanedContent,
        url: originalUrl
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Extract API error:', errorText);
      throw new Error(`AI Extract API error: ${response.status}`);
    }
    
    const aiResponse = await response.json();
    
    if (!aiResponse || aiResponse.error) {
      return null;
    }

    let eventData = aiResponse;
    if (aiResponse.choices) {
        // If backend returned raw OpenRouter response
        const content = aiResponse.choices[0].message.content;
        const match = content.match(/\{[\s\S]*\}/);
        if (match) eventData = JSON.parse(match[0]);
        else return null;
    }
    
    // Validate the extracted data
    if (!eventData.title || !eventData.date) {
      console.error('Missing required fields in extracted data');
      return null;
    }
    
    // CRITICAL: Validate date is in the future
    const eventDate = new Date(eventData.date);
    const now = new Date();
    
    if (isNaN(eventDate.getTime())) {
      console.error('Invalid date format:', eventData.date);
      return null;
    }
    
    if (eventDate < now) {
      console.error('Event date is in the past:', eventData.date, '(current:', now.toISOString(), ')');
      return null;
    }
    
    // Validate year is reasonable (current year or next 2 years)
    const currentYear = new Date().getFullYear();
    const eventYear = eventDate.getFullYear();
    if (eventYear < currentYear || eventYear > currentYear + 2) {
      console.error('Event year seems incorrect:', eventYear);
      return null;
    }
    
    console.log('✓ Valid event date extracted:', eventData.date);
    
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
      originalLink: originalUrl,
      partners: eventData.partners || []
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
  
  // Extract metadata
  const title = doc.querySelector('h1')?.textContent || '';
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Extract time elements with datetime attributes (CRITICAL for accurate dates)
  const timeElements: string[] = [];
  doc.querySelectorAll('time[datetime]').forEach(time => {
    const datetime = time.getAttribute('datetime');
    const text = time.textContent;
    timeElements.push(`TIME: ${text} (datetime: ${datetime})`);
  });
  
  // Extract date-related elements
  const dateElements: string[] = [];
  const dateSelectors = [
    '.date', '.event-date', '.schedule-date', '[class*="date"]',
    '[class*="Date"]', '.datetime', '.event-time', '[itemprop="startDate"]',
    '[itemprop="endDate"]', '.calendar-date', '.event-schedule'
  ];
  
  dateSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length < 100) { // Avoid long text blocks
        dateElements.push(`DATE: ${text}`);
      }
    });
  });
  
  // Get main content areas
  const contentSelectors = [
    'main', 'article', '[role="main"]', '.content', '.event-details',
    '.description', '.event-description', 'h1', 'h2', 'h3', '.location',
    '.event-location', '.venue', '[itemprop="location"]'
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
  
  // Extract JSON-LD structured data (often contains event dates)
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  let jsonLdData = '';
  jsonLdScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data['@type'] === 'Event' || data.eventSchedule || data.startDate) {
        jsonLdData += '\nJSON-LD Event Data: ' + JSON.stringify(data);
      }
    } catch (e) {
      // Ignore invalid JSON
    }
  });
  
  // Return structured representation with emphasis on dates
  return `
=== ОФИЦИАЛЬНАЯ ИНФОРМАЦИЯ О МЕРОПРИЯТИИ ===

Название: ${title}
Мета-описание: ${metaDescription}

=== ДАТЫ (КРИТИЧЕСКИ ВАЖНО) ===
${timeElements.length > 0 ? timeElements.join('\n') : 'Не найдено элементов <time>'}
${dateElements.length > 0 ? '\n' + dateElements.join('\n') : ''}

=== СТРУКТУРИРОВАННЫЕ ДАН��ЫЕ ===
${jsonLdData || 'Не найдено JSON-LD данных'}

=== ОСНОВНОЙ КОНТЕНТ ===
${relevantText.substring(0, 2500)}
  `.trim();
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