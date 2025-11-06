import { useEventListener } from '../hooks/useEventBus';
import { useState } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function EventNotificationListener() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
console.log('notifications', notifications);
  // Listen to notification events from remotes
  useEventListener('notification:show', ({ message, type, duration = 3000 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type, duration };
    
    console.log('[Portfolio] Notification received:', notification);
    
    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  });

  // Log remote lifecycle events
  useEventListener('remote:mounted', ({ remoteName }) => {
    console.log(`[Portfolio] 🟢 Remote mounted: ${remoteName}`);
  });

  useEventListener('remote:unmounted', ({ remoteName }) => {
    console.log(`[Portfolio] 🔴 Remote unmounted: ${remoteName}`);
  });

  // Log user actions from remotes
  useEventListener('user:action', ({ action, data }) => {
    console.log(`[Portfolio] 👤 User action: ${action}`, data);
  });

  // Log data sharing between remotes
  useEventListener('data:share', ({ type, payload, source }) => {
    console.log(`[Portfolio] 📤 Data shared from ${source}:`, { type, payload });
  });

  const getNotificationStyles = (type: Notification['type']) => {
    const baseStyles = 'px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2 animate-slide-in';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white`;
      default:
        return baseStyles;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-16 sm:top-4 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
        >
          <span className="text-base sm:text-xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
          <span className="font-medium text-xs sm:text-sm md:text-base flex-1 min-w-0 break-words">{notification.message}</span>
          <button
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            className="ml-2 text-white hover:opacity-80 text-lg sm:text-xl flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
