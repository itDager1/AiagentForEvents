import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { NotificationPanel } from './NotificationPanel';
import { getUnreadCount } from '../../utils/notificationService';

interface NotificationBellProps {
  userId: string;
  onNotificationChange?: () => void;
}

export function NotificationBell({ userId, onNotificationChange }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateUnreadCount = () => {
    const count = getUnreadCount(userId);
    setUnreadCount(count);
  };

  useEffect(() => {
    updateUnreadCount();
    
    // Check for new notifications every 30 seconds
    const interval = setInterval(updateUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationsRead = () => {
    updateUnreadCount();
    if (onNotificationChange) {
      onNotificationChange();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative hover:bg-blue-50 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <NotificationPanel
          userId={userId}
          onClose={() => setIsOpen(false)}
          onNotificationsRead={handleNotificationsRead}
        />
      )}
    </div>
  );
}
