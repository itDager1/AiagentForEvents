import { projectId, publicAnonKey } from './supabase/info';
import { MOCK_EVENTS, User, Event, EventRegistration } from '../data/mock';
import {
  getLocalRegistrations,
  createLocalRegistration,
  getLocalUserRegistrations,
  updateLocalRegistrationStatus,
  deleteLocalRegistration
} from './localRegistrationService';

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
    
    // For seed endpoint, accept both 200 and 400 as valid responses
    // 400 means API key is not configured, which is a valid state
    if (endpoint === '/seed-ai-events' && response.status === 400) {
      return await response.json();
    }
    
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
  try {
    // First check if events already exist
    const existingEvents = await fetchAPI('/events');
    
    if (existingEvents?.data && Array.isArray(existingEvents.data) && existingEvents.data.length > 0) {
      console.log("✅ Events already exist in database, skipping seed");
      return;
    }

    console.log("🌱 Attempting to seed with AI events...");
    
    // Try AI seeding only if events are empty
    const aiResult = await fetchAPI('/seed-ai-events', 'POST');
    
    if (aiResult && aiResult.success) {
        console.log("✅ Successfully seeded DB with AI events");
        return;
    }

    if (aiResult && aiResult.error) {
        console.warn("⚠️ AI seeding error:", aiResult.error);
    }
  } catch (error) {
    console.warn("⚠️ AI seeding failed:", error);
  }

  // Fallback to mock events
  console.log("📦 Falling back to Mock data");
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

// New Registration System with Approval (with localStorage fallback)
export async function createRegistration(userId: string, eventId: string): Promise<EventRegistration | null> {
  // Always use localStorage for now (until backend is deployed)
  return createLocalRegistration(userId, eventId);
}

export async function getUserRegistrations(userId: string): Promise<EventRegistration[]> {
  // Always use localStorage for now (until backend is deployed)
  return getLocalUserRegistrations(userId);
}

export async function getAllRegistrations(): Promise<EventRegistration[]> {
  // Always use localStorage for now (until backend is deployed)
  return getLocalRegistrations();
}

export async function updateRegistrationStatus(
  registrationId: string, 
  status: 'approved' | 'rejected'
): Promise<EventRegistration | null> {
  // Always use localStorage for now (until backend is deployed)
  return updateLocalRegistrationStatus(registrationId, status);
}

export async function deleteRegistration(registrationId: string): Promise<boolean> {
  // Always use localStorage for now (until backend is deployed)
  return deleteLocalRegistration(registrationId);
}

// Get all approved registrations (for admin calendar view)
export async function getApprovedRegistrations(): Promise<EventRegistration[]> {
  const allRegs = getLocalRegistrations();
  return allRegs.filter(r => r.status === 'approved');
}