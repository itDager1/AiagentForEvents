import { EventRegistration } from '../data/mock';

const STORAGE_KEY = 'exact_direction_registrations';

// Local storage service for registrations (fallback when backend is unavailable)
export function getLocalRegistrations(): EventRegistration[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(registrations: EventRegistration[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  } catch (e) {
    console.error('Failed to save registrations to localStorage', e);
  }
}

export function createLocalRegistration(userId: string, eventId: string, userEmail?: string): EventRegistration {
  const registrations = getLocalRegistrations();
  
  // Check if already exists
  const existing = registrations.find(
    r => r.userId === userId && r.eventId === eventId
  );
  
  if (existing) {
    return existing;
  }
  
  // Auto-approve for admin users
  const isAdmin = userEmail === 'admin@sberbank.ru';
  
  const newRegistration: EventRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    eventId,
    status: isAdmin ? 'approved' : 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  registrations.push(newRegistration);
  saveLocalRegistrations(registrations);
  
  return newRegistration;
}

export function getLocalUserRegistrations(userId: string): EventRegistration[] {
  const registrations = getLocalRegistrations();
  return registrations.filter(r => r.userId === userId);
}

export function updateLocalRegistrationStatus(
  registrationId: string,
  status: 'approved' | 'rejected'
): EventRegistration | null {
  const registrations = getLocalRegistrations();
  const index = registrations.findIndex(r => r.id === registrationId);
  
  if (index === -1) {
    return null;
  }
  
  registrations[index] = {
    ...registrations[index],
    status,
    updatedAt: new Date().toISOString()
  };
  
  saveLocalRegistrations(registrations);
  return registrations[index];
}

export function deleteLocalRegistration(registrationId: string): boolean {
  const registrations = getLocalRegistrations();
  const filtered = registrations.filter(r => r.id !== registrationId);
  saveLocalRegistrations(filtered);
  return true;
}