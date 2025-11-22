import React, { useState, useEffect } from 'react';
import { Bell, Check, Calendar, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead,
  EventNotification 
} from '../../utils/notificationService';

interface NotificationPanelProps {
  userId: string;
  onClose: () => void;
  onNotificationsRead?: () => void;
}

export function NotificationPanel({ userId, onClose, onNotificationsRead }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<EventNotification[]>([]);

  const loadNotifications = () => {
    const userNotifs = getUserNotifications(userId);
    setNotifications(userNotifs);
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    loadNotifications();
    if (onNotificationsRead) {
      onNotificationsRead();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
    loadNotifications();
    if (onNotificationsRead) {
      onNotificationsRead();
    }
  };

  const getNotificationIcon = (type: string) => {
    return <Calendar className="w-5 h-5 text-blue-500" />;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case '1_day':
        return 'bg-red-50 border-red-200';
      case '3_days':
        return 'bg-orange-50 border-orange-200';
      case '10_days':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case '1_day':
        return <Badge className="bg-red-500 text-white">Завтра</Badge>;
      case '3_days':
        return <Badge className="bg-orange-500 text-white">Через 3 дня</Badge>;
      case '10_days':
        return <Badge className="bg-blue-500 text-white">Через 10 дней</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Уведомления</h3>
          {unreadCount > 0 && (
            <Badge className="bg-blue-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Прочитать все
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[500px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Нет уведомлений</p>
            <p className="text-sm text-gray-400 mt-1">
              Мы уведомим вас о предстоящих событиях
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 mb-2 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
                  notification.read 
                    ? 'bg-white border-gray-100 opacity-70' 
                    : getNotificationColor(notification.type)
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-medium text-slate-900 leading-snug">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.eventDate)}
                      </p>
                      {getNotificationBadge(notification.type)}
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 w-full"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Отметить прочитанным
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Уведомления приходят за 10, 3 и 1 день до события
          </p>
        </div>
      )}
    </div>
  );
}
