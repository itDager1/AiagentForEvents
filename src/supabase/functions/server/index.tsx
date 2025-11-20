import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono().basePath('/make-server-6f7662b1');

// Enable logger
app.use('*', logger(console.log));

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-4o-mini",
        "messages": [
          {"role": "system", "content": "You are a helpful recommendation assistant. You must output valid JSON only (an array of strings). Do not include markdown formatting."},
          {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
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

// Start the server
Deno.serve(app.fetch);