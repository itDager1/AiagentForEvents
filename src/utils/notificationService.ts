import { Event, EventRegistration } from '../data/mock';

export type NotificationType = '10_days' | '3_days' | '1_day';

export interface EventNotification {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'exact_direction_notifications';

// Get all notifications from localStorage
export function getAllNotifications(): EventNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
}

// Save notifications to localStorage
function saveNotifications(notifications: EventNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

// Get notifications for a specific user
export function getUserNotifications(userId: string): EventNotification[] {
  const all = getAllNotifications();
  return all.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Get unread count for user
export function getUnreadCount(userId: string): number {
  const userNotifications = getUserNotifications(userId);
  return userNotifications.filter(n => !n.read).length;
}

// Mark notification as read
export function markAsRead(notificationId: string): void {
  const notifications = getAllNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

// Mark all notifications as read for user
export function markAllAsRead(userId: string): void {
  const notifications = getAllNotifications();
  const updated = notifications.map(n => 
    n.userId === userId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

// Delete old notifications (older than 30 days)
export function cleanupOldNotifications(): void {
  const notifications = getAllNotifications();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filtered = notifications.filter(n => 
    new Date(n.createdAt) > thirtyDaysAgo
  );
  
  if (filtered.length !== notifications.length) {
    saveNotifications(filtered);
  }
}

// Create notification message based on type
function createNotificationMessage(eventTitle: string, type: NotificationType): string {
  switch (type) {
    case '10_days':
      return `Через 10 дней начнется событие "${eventTitle}"`;
    case '3_days':
      return `Через 3 дня начнется событие "${eventTitle}"`;
    case '1_day':
      return `Завтра начнется событие "${eventTitle}"`;
  }
}

// Check if notification already exists
function notificationExists(
  userId: string, 
  eventId: string, 
  type: NotificationType
): boolean {
  const notifications = getAllNotifications();
  return notifications.some(n => 
    n.userId === userId && 
    n.eventId === eventId && 
    n.type === type
  );
}

// Calculate days until event
function getDaysUntilEvent(eventDate: string): number {
  const now = new Date();
  const event = new Date(eventDate);
  
  // Reset time to start of day for accurate day calculation
  now.setHours(0, 0, 0, 0);
  event.setHours(0, 0, 0, 0);
  
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Create a new notification
function createNotification(
  userId: string,
  event: Event,
  type: NotificationType
): EventNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    type,
    message: createNotificationMessage(event.title, type),
    read: false,
    createdAt: new Date().toISOString()
  };
}

// Main function to check and create notifications for user's approved events
export function checkAndCreateNotifications(
  userId: string,
  approvedRegistrations: EventRegistration[],
  events: Event[]
): EventNotification[] {
  const newNotifications: EventNotification[] = [];
  
  // Cleanup old notifications first
  cleanupOldNotifications();
  
  // Check each approved registration
  for (const registration of approvedRegistrations) {
    if (registration.status !== 'approved') continue;
    
    const event = events.find(e => e.id === registration.eventId);
    if (!event) continue;
    
    const daysUntil = getDaysUntilEvent(event.date);
    
    // Skip if event is in the past or more than 10 days away
    if (daysUntil < 0 || daysUntil > 10) continue;
    
    // Check which notification to create based on days until event
    let notificationType: NotificationType | null = null;
    
    if (daysUntil === 10) {
      notificationType = '10_days';
    } else if (daysUntil === 3) {
      notificationType = '3_days';
    } else if (daysUntil === 1) {
      notificationType = '1_day';
    }
    
    // Create notification if type is determined and doesn't exist yet
    if (notificationType && !notificationExists(userId, event.id, notificationType)) {
      const notification = createNotification(userId, event, notificationType);
      newNotifications.push(notification);
    }
  }
  
  // Save new notifications
  if (newNotifications.length > 0) {
    const allNotifications = getAllNotifications();
    saveNotifications([...allNotifications, ...newNotifications]);
  }
  
  return newNotifications;
}

// Delete notifications for a specific event (when user cancels registration)
export function deleteEventNotifications(userId: string, eventId: string): void {
  const notifications = getAllNotifications();
  const filtered = notifications.filter(n => 
    !(n.userId === userId && n.eventId === eventId)
  );
  saveNotifications(filtered);
}
