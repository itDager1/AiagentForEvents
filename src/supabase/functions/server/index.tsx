import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono().basePath('/make-server-6f7662b1');

// Enable logger
app.use('*', logger(console.log));

// Check API Key Endpoint (Lightweight)
app.get('/check-api-key', async (c) => {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  return c.json({ isConfigured: !!apiKey });
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Events Endpoints
app.get('/events', async (c) => {
  try {
    const events = await kv.get('events');
    return c.json({ data: events || [] });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ data: [], error: error.message }, 500);
  }
});

app.post('/events', async (c) => {
  try {
    const events = await c.req.json();
    await kv.set('events', events);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving events:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Profile Endpoints
app.get('/profile/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const profile = await kv.get(`profile:${id}`);
    return c.json({ data: profile || null });
  } catch (error) {
    console.error(`Error fetching profile ${id}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/profile', async (c) => {
  try {
    const profile = await c.req.json();
    // Store profile keyed by user ID
    await kv.set(`profile:${profile.id}`, profile);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Auth Endpoints
app.post('/signup', async (c) => {
  try {
    const { email, password, user_metadata } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata,
      email_confirm: true
    });

    if (error) {
        // If user already exists, treat as success to allow login flow to proceed
        if (error.code === 'email_exists' || error.message?.includes('already been registered')) {
             console.log(`User ${email} already exists. Proceeding to login flow.`);
             return c.json({ message: "User already registered" });
        }

        console.error("Supabase Auth Error:", error);
        return c.json({ error: error.message }, 400);
    }

    return c.json(data);

  } catch (error) {
    console.error('Signup Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

    // AI Proxy Endpoint
    app.post('/ai-recommend', async (c) => {
      try {
        const { prompt } = await c.req.json();
        const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
        if (!apiKey) {
          return c.json({ error: 'OPENROUTER_API_KEY is not set' }, 500);
        }
    
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://figma-make.com", // Required by OpenRouter
            "X-Title": "Figma Make App"
          },
          body: JSON.stringify({
            "model": "perplexity/sonar",
            "messages": [
              {"role": "system", "content": "You are a helpful recommendation assistant for the 'Exact Direction' app. You have access to real-time data. You must output valid JSON only (an array of strings for recommendations, or specific format requested). Do not include markdown formatting."},
              {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
          })
        });
    
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API Error: ${response.status} ${errText}`);
        }
    
        const data = await response.json();
        return c.json(data);
    
      } catch (error) {
        console.error('AI Error:', error);
        return c.json({ error: error.message }, 500);
      }
    });
    
    // AI Search Endpoint (New)
    app.post('/ai-search', async (c) => {
      try {
        const { query } = await c.req.json();
        const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
        if (!apiKey) {
          return c.json({ error: 'OPENROUTER_API_KEY is not set' }, 500);
        }

        const prompt = `Найди актуальную информацию о следующем IT-мероприятии: "${query}"
 
 Пожалуйста, верни информацию в формате JSON:
 {
   "title": "Точное название мероприятия (включая номер, если это митап)",
   "description": "Подр��бное описание мероприятия (2-3 предложения)",
   "date": "Дата начала в формате ISO (YYYY-MM-DDTHH:mm:ss)",
   "displayDate": "Красиво отформатированная дата для отображения (например, '27–28 ноября 2025')",
   "format": "Онлайн" | "Оффлайн" | "Гибрид",
   "category": "Обучение" | "Хакатон" | "Митап" | "Конференция",
   "location": "Место проведения",
   "tags": ["тег1", "тег2", "тег3"],
   "originalLink": "Официальный сайт мероприятия",
   "partners": ["Название партнера 1", "Название партнера 2"]
 }
 
 ВАЖНО:
 - Ищи ТОЛЬКО будущие мероприятия (дата после ${new Date().toISOString().split('T')[0]})
 - Если название содержит номер (например, Moscow Python Meetup #90), ОБЯЗАТЕЛЬНО проверь, какой номер актуален сейчас. Не используй старые номера.
 - Если мероприятие регулярное (митап), найди информацию именно о БЛИЖАЙШЕМ.
 - Даты должны быть точными.
 - Найди 3-5 ключевых п��ртнеров или спонсоров события.
 - Если партнеры не найдены, верни пустой массив [].
 - Если мероприятие не найдено или информация устарела, верни null.
 - Формат даты ISO: YYYY-MM-DDTHH:mm:ss.
 - Категория должна быть одной из: "Обучение", "Хакатон", "Митап", "Конференция".
 - Формат должен быть одним из: "Онлайн", "Оффлайн", "Гибрид".
 
 Верни ТОЛЬКО JSON объект или null, без дополнительного текста.`;
    
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://figma-make.com", 
            "X-Title": "Figma Make App"
          },
          body: JSON.stringify({
            "model": "perplexity/sonar",
            "messages": [
              {"role": "system", "content": "Ты - эксперт по IT-мероприятиям. Ты находишь актуальную информацию о конференциях, хакатонах и митапах. Всегд�� возвращай валидный JSON с точными датами или null, если информация недоступна."},
              {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 1000
          })
        });
    
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API Error: ${response.status} ${errText}`);
        }
    
        const data = await response.json();
        return c.json(data);
    
      } catch (error) {
        console.error('AI Search Error:', error);
        return c.json({ error: error.message }, 500);
      }
    });
    
    // AI Extract Endpoint (New)
    app.post('/ai-extract', async (c) => {
      try {
        const { content, url } = await c.req.json();
        const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
        if (!apiKey) {
          return c.json({ error: 'OPENROUTER_API_KEY is not set' }, 500);
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const prompt = `Ты - эксперт по извлечению информации о IT-мероприятиях с веб-сайтов.
 
 ТЕКУЩАЯ ДАТА: ${currentDate}
 
 Проанализируй содержимое следующей веб-страницы и извлеки ТОЧНУЮ информацию о мероприятии:
 
 URL: ${url}
 
 СОДЕРЖИМОЕ СТРАНИЦЫ:
 ${content.substring(0, 5000)}
 
 КРИТИЧЕСКИ ВАЖНО - ИЗВЛЕЧЕНИЕ ДАТ:
 1. Найди ТОЧНЫЕ даты проведения мероприятия на странице
 2. Обрати внимание на:
    - Элементы <time> с атрибутами datetime
    - Текст вида "27-28 ноября 2025" или "November 27-28, 2025"
    - Блоки с классами типа .date, .event-date, .schedule
    - Мета-теги с датами события
 3. Если видишь несколько дат (например, диапазон), используй дату НАЧАЛА мероприятия
 4. Убедись, что дата в будущем (после ${currentDate})
 5. Если мероприятие уже прошло - верни null
 
 ФОРМАТ ДАТЫ:
 - ISO формат: YYYY-MM-DDTHH:mm:ss
 - Если время не указано, используй 10:00:00 для дневных событий
 - Для онлайн-событий можно использовать 19:00:00
 
 Верни JSON в следующем формате:
 {
   "title": "Точное официальное название мероприятия со страницы",
   "description": "Краткое описаие из официального источника (2-3 предложения)",
   "date": "YYYY-MM-DDTHH:mm:ss (ТОЧНАЯ дата начала)",
   "displayDate": "Красивая дата для показа (например: '27–28 ноября 2025')",
   "format": "Онлайн" | "Оффлайн" | "Гибрид",
   "category": "Обучение" | "Хакатон" | "Митап" | "Конференция",
   "location": "Точное место проведения",
   "tags": ["тег1", "тег2", "тег3"],
   "partners": ["Партнер 1", "Партнер 2"]
 }
 
 Верни ТОЛЬКО JSON объект или null, БЕЗ дополнительного текста или markdown.`;
    
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://figma-make.com", 
            "X-Title": "Figma Make App"
          },
          body: JSON.stringify({
            "model": "perplexity/sonar",
            "messages": [
              {"role": "system", "content": "Ты - эксперт по извлечению структурированных данных о мероприятиях из HTML. Твоя главная задача - найти ТОЧНЫЕ даты с официальных сайтов. Ты ВСЕГДА проверяешь актуальность дат. Возвращай только валидный JSON с точными датами или null."},
              {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 1500
          })
        });
    
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API Error: ${response.status} ${errText}`);
        }
    
        const data = await response.json();
        return c.json(data);
    
      } catch (error) {
        console.error('AI Extract Error:', error);
        return c.json({ error: error.message }, 500);
      }
    });

    // Seed AI Events Endpoint
    app.post('/seed-ai-events', async (c) => {
      try {
        const apiKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!apiKey) {
          console.warn('⚠️ OPENROUTER_API_KEY is not configured in Supabase secrets');
          // Return error status to prevent retrying
          return c.json({ 
            success: false, 
            error: 'OPENROUTER_API_KEY not configured',
            message: 'Please configure OPENROUTER_API_KEY in Supabase Dashboard > Edge Functions > Secrets' 
          }, 400);
        }
    
        const currentDate = new Date().toISOString().split('T')[0];
        const prompt = `
          Find and generate a list of 12-15 ACTUAL and UPCOMING IT and Tech events in Russia for the upcoming year (starting from ${currentDate}).
          
          Use your search capabilities to find the LATEST CONFIRMED dates and details for:
          1. HighLoad++
          2. HolyJS
          3. Heisenbug
          4. Mobius
          5. Joker
          6. Podlodka Techlead Crew
          7. GigaConf
          8. CodeFest
          
          Also include other relevant major IT events (e.g., Yandex Scale, SberTech events, major meetups).
          
          For each event provide:
          - title (Exact name)
          - description (2-3 sentences in Russian explaining what it is)
          - date (ISO 8601 string YYYY-MM-DD)
          - format (one of: 'Онлайн', 'Оффлайн', 'Гибрид')
          - category (one of: 'Обучение', 'Хакатон', 'Митап', 'Конференция')
          - location (City name e.g. "Москва", "Санкт-Петербург" or "Онлайн")
          - tags (array of 3-4 strings in English, e.g. ["Backend", "Java"])
          - originalLink (URL to the official event website or ticketing page)
          
          Return ONLY a valid JSON array of objects. Do not include markdown.
        `;
    
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://figma-make.com",
            "X-Title": "Figma Make App"
          },
          body: JSON.stringify({
            "model": "perplexity/sonar",
            "messages": [
              {"role": "system", "content": "You are a helpful assistant that finds real-time event data. Return only valid JSON array. No markdown."},
              {"role": "user", "content": prompt}
            ],
            "temperature": 0.1, // Lower temperature for more factual data
            "max_tokens": 4000
          })
        });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenRouter API Error: ${response.status}`, errText);
      return c.json({ 
        success: false, 
        error: `OpenRouter API Error: ${response.status}` 
      }, 200);
    }

    const json = await response.json();
    const content = json.choices[0].message.content;
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let generatedEvents = [];
    try {
      generatedEvents = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI events JSON", content);
      return c.json({ 
        success: false, 
        error: "Failed to parse AI response" 
      }, 200);
    }

    // Add IDs and Images
    const techImages = [
      'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1568716353609-12ddc5c67f04?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1662252900942-2d7e1feb6494?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1636471339409-8eb98c018b0e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1531498860503-618dbfe43603?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1584188335984-7781d3194e03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBxYSUyMGJ1Z3xlbnwxfHx8fDE3NjM2NjYxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1762341119237-98df67c9c3c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudCUyMHBob25lfGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1633457896836-f8d6025c85d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMG9mZmljZSUyMGRpc2N1c3Npb258ZW58MXx8fHwxNzYzNjY2MTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1687603858673-a08a2dc2302c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXZhJTIwY29kZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1560523159-94c9d18bcf27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMGNyb3dkJTIwc3RhZ2V8ZW58MXx8fHwxNzYzNjY2MTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwcm9ib3QlMjB0ZWNofGVufDF8fHx8MTc2MzY2NjE4MXww&ixlib=rb-4.1.0&q=80&w=1080'
    ];

    const eventsWithMeta = generatedEvents.map((evt: any, index: number) => ({
      ...evt,
      id: `ai-event-${Date.now()}-${index}`,
      image: techImages[index % techImages.length]
    }));

    // Save to KV
    await kv.set('events', eventsWithMeta);

    console.log(`✅ Successfully seeded ${eventsWithMeta.length} AI events`);
    return c.json({ success: true, data: eventsWithMeta });

  } catch (error) {
    console.error('Seed AI Events Error:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 200);
  }
});

// Event Registration Endpoints (Approval System)
app.post('/registrations', async (c) => {
  try {
    const { userId, eventId } = await c.req.json();
    
    // Get existing registrations
    const allRegistrations = await kv.get('registrations') || [];
    
    // Check if registration already exists
    const existing = allRegistrations.find(
      (r: any) => r.userId === userId && r.eventId === eventId
    );
    
    if (existing) {
      return c.json({ data: existing });
    }
    
    // Create new registration with pending status
    const registration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allRegistrations.push(registration);
    await kv.set('registrations', allRegistrations);
    
    return c.json({ data: registration });
  } catch (error) {
    console.error('Error creating registration:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/registrations/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const allRegistrations = await kv.get('registrations') || [];
    
    const userRegistrations = allRegistrations.filter(
      (r: any) => r.userId === userId
    );
    
    return c.json({ data: userRegistrations });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/registrations', async (c) => {
  try {
    const allRegistrations = await kv.get('registrations') || [];
    return c.json({ data: allRegistrations });
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/registrations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const allRegistrations = await kv.get('registrations') || [];
    const index = allRegistrations.findIndex((r: any) => r.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Registration not found' }, 404);
    }
    
    allRegistrations[index] = {
      ...allRegistrations[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set('registrations', allRegistrations);
    
    return c.json({ data: allRegistrations[index] });
  } catch (error) {
    console.error('Error updating registration:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/registrations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const allRegistrations = await kv.get('registrations') || [];
    const filtered = allRegistrations.filter((r: any) => r.id !== id);
    
    await kv.set('registrations', filtered);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);