import { useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification } from '@/store/notificationStore';
import { connectSocket, disconnectSocket } from '@/services/socket';

export default function NotificationSocket() {
  const { token, user } = useAuthStore();
  const setNotifications = useNotificationStore.setState;
  const connectedRef = useRef(false);

  useEffect(() => {
    if (token && user && !connectedRef.current) {
      connectedRef.current = true;
      const socket = connectSocket(token);

      socket.on(
        'task-reminder',
        (data: {
          id: string;
          title: string;
          time?: string;
          timeEnd?: string;
          taskDate: string;
          type: string;
        }) => {
          const notification: Notification = {
            ...data,
            read: false,
            receivedAt: new Date().toISOString(),
          };

          setNotifications((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.notifications.filter((n) => !n.read).length + 1,
          }));

          toast(`Reminder: ${data.title}`, {
            description: data.time
              ? `Scheduled at ${data.time}${data.timeEnd ? ` - ${data.timeEnd}` : ''}`
              : 'All day task',
            duration: 5000,
          });
        },
      );
    }

    if (!token) {
      disconnectSocket();
      connectedRef.current = false;
    }

    return () => {};
  }, [token, user]);

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#e0e0e0',
        },
      }}
    />
  );
}
