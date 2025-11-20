import { projectId, publicAnonKey } from './supabase/info';
import { MOCK_EVENTS, User, Event } from '../data/mock';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6f7662b1`;

async function fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
        console.warn(`API Error ${response.status} on ${endpoint}`);
        return null;
    }
    
    // Await the JSON to catch parse errors within the try-catch block
    return await response.json();
  } catch (error) {
    console.error(`Network Error on ${endpoint}:`, error);
    return null;
  }
}

// Helper to seed events if empty
export async function seedEvents() {
  // Force update events to ensure they match the latest MOCK_EVENTS
  // This is important because we changed the dataset requirements
  await fetchAPI('/events', 'POST', MOCK_EVENTS);
}

export async function fetchEvents(): Promise<Event[]> {
  const response = await fetchAPI('/events');
  const events = response?.data;
  
  if (events && Array.isArray(events) && events.length > 0) {
      return events;
  }
  return MOCK_EVENTS;
}

export async function getUserProfile(userId: string): Promise<User | null> {
  if (userId.startsWith('mock-user')) return null;
  
  const response = await fetchAPI(`/profile/${userId}`);
  const profile = response?.data;
  
  if (profile) {
      // Ensure structure matches User interface
      return {
          ...profile,
          myEventIds: profile.myEventIds || []
      };
  }
  return null;
}

export async function createUserProfile(user: User) {
  if (user.id.startsWith('mock-user')) return { error: null };

  const result = await fetchAPI('/profile', 'POST', user);
  if (result && result.success) {
      return { error: null };
  }
  return { error: 'Failed to save profile' };
}

export async function fetchUserRegistrations(userId: string): Promise<string[]> {
    const profile = await getUserProfile(userId);
    return profile ? profile.myEventIds : [];
}

export async function toggleRegistration(userId: string, eventId: string, isRegistered: boolean) {
  if (userId.startsWith('mock-user')) return { error: null };

  // We need to fetch current profile to get current list
  const profile = await getUserProfile(userId);
  
  if (!profile) {
      // If profile doesn't exist, we can't update registration
      return { error: 'Profile not found' };
  }

  let newIds = profile.myEventIds || [];
  if (isRegistered) {
      newIds = newIds.filter(id => id !== eventId);
  } else {
      if (!newIds.includes(eventId)) {
          newIds.push(eventId);
      }
  }

  const updatedUser = { ...profile, myEventIds: newIds };
  return createUserProfile(updatedUser);
}