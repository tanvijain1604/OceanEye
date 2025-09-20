import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  role?: string;
}

export const NOTIFICATION_TYPES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  urgent: 'error' // Urgent notifications use error styling
} as const;

export const showNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  options?: ToastOptions
) => {
  const toastOptions: ToastOptions = {
    position: 'top-right',
    autoClose: type === 'urgent' ? false : 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options
  };

  switch (type) {
    case 'success':
      toast.success(`${title}: ${message}`, toastOptions);
      break;
    case 'warning':
      toast.warning(`${title}: ${message}`, toastOptions);
      break;
    case 'error':
    case 'urgent':
      toast.error(`${title}: ${message}`, toastOptions);
      break;
    default:
      toast.info(`${title}: ${message}`, toastOptions);
  }
};

export const showUrgentAlert = (title: string, message: string) => {
  showNotification('urgent', title, message, {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    className: 'urgent-alert'
  });
};

// Mock notification data
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Tsunami Warning',
    message: 'High alert: Tsunami warning issued for coastal areas. Evacuate immediately.',
    timestamp: new Date(),
    read: false,
    role: 'citizen'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Heavy Rain Alert',
    message: 'Heavy rainfall expected in the next 2 hours. Stay indoors.',
    timestamp: new Date(Date.now() - 300000),
    read: false,
    role: 'citizen'
  },
  {
    id: '3',
    type: 'info',
    title: 'Shelter Update',
    message: 'New emergency shelter opened at Central Park.',
    timestamp: new Date(Date.now() - 600000),
    read: true,
    role: 'citizen'
  }
];

export const getNotificationsForRole = (role: string): Notification[] => {
  return mockNotifications.filter(notification => 
    !notification.role || notification.role === role
  );
};


