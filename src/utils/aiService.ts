import { Event, User } from '../data/mock';
import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1`;

export async function getAIRecommendations(user: User, events: Event[], _apiKey?: string): Promise<Event[]> {
  try {
    // Simplify events to save tokens
    const simplifiedEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      tags: e.tags,
      location: e.location,
      date: e.date,
      description: e.description.substring(0, 150)
    }));

    const currentDate = new Date();
    const sixMonthsLater = new Date(currentDate);
    sixMonthsLater.setMonth(currentDate.getMonth() + 6);
    
    const prompt = `
      Context:
      - Current Date: ${currentDate.toISOString().split('T')[0]}
      - Target Date Range: Next 6 months (until ${sixMonthsLater.toISOString().split('T')[0]})
      - Target Location: Russia (or Online)
      - Target Topic: IT and Tech events

      User Profile:
      - Role: ${user.role}
      - Schedule: ${user.schedule || 'Standard'}
      - Interests: ${user.interests.length > 0 ? user.interests.join(', ') : 'General'}
      
      Available Events:
      ${JSON.stringify(simplifiedEvents)}
      
      Task: 
      1. Filter for events happening within the Target Date Range (IMPORTANT).
      2. Filter for events in Russia or Online.
      3. PRIORITIZE IT and Tech related events.
      4. Consider the user's work schedule constraints (e.g., 5/2 prefers weekends/evenings, Remote allows more flexibility).
      5. From the filtered list, select the top 3 events that best match the user's role, schedule, and interests.
      
      Return a JSON array of strings containing ONLY the IDs of the selected events.
      Example output: ["1", "5", "9"]
    `;

    const response = await fetch(`${BASE_URL}/ai-recommend`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Service Error: ${response.status} ${errText}`);
    }

    const json = await response.json();
    
    if (!json.choices || !json.choices[0] || !json.choices[0].message) {
      throw new Error("Invalid response structure from AI");
    }

    const content = json.choices[0].message.content;
    
    // Clean up markdown if present (e.g. ```json ... ```)
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let recommendedIds: string[] = [];
    try {
      recommendedIds = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response JSON", content);
      throw e;
    }
    
    if (Array.isArray(recommendedIds)) {
      // Filter events preserving order of recommendation if possible, or just filter
      return events.filter(e => recommendedIds.includes(e.id));
    }
    
    return [];
    
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    
    // Fallback to heuristic logic if AI fails
    return events.filter(event => {
      // Role-based heuristics
      const roleKeywords: Record<string, string[]> = {
        'Разработчик': ['Tech', 'Coding', 'AI', 'Java', 'Python'],
        'Менеджер': ['Management', 'Leadership', 'Agile', 'Soft Skills'],
        'Дизайнер': ['Design', 'UX', 'UI', 'Creative'],
        'HR': ['People', 'Recruiting', 'Psychology'],
        'Аналитик': ['Data', 'Analysis', 'SQL', 'Big Data'],
        'Стажер': ['Education', 'Basics', 'Start']
      };

      const keywords = roleKeywords[user.role] || [];
      const matchesRole = keywords.some(k => event.tags.includes(k) || event.title.includes(k));
      const matchesInterest = user.interests.some(interest => event.tags.includes(interest));
      
      return matchesRole || matchesInterest;
    }).slice(0, 3);
  }
}
