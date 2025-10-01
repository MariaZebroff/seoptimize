'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationBanner, { Notification } from '@/components/NotificationBanner';

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'success',
      message,
      title,
      duration: duration ?? 4000, // Success messages auto-dismiss after 4 seconds
    });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'error',
      message,
      title,
      duration: duration ?? 0, // Error messages don't auto-dismiss by default
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'warning',
      message,
      title,
      duration: duration ?? 6000, // Warning messages auto-dismiss after 6 seconds
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'info',
      message,
      title,
      duration: duration ?? 5000, // Info messages auto-dismiss after 5 seconds
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationBanner
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
