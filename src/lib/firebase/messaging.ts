import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import app, { isFirebaseConfigured } from './config';

let messaging: Messaging | null = null;

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window) || !isFirebaseConfigured) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    if (!messaging) {
      try {
        messaging = getMessaging(app);
      } catch {
        return null;
      }
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined
    });
    return token;
  } catch (error) {
    console.warn('FCM registration skipped or failed:', error);
    return null;
  }
}

export function subscribeToForegroundNotifications(callback: (payload: any) => void) {
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch {
      return () => {};
    }
  }

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}
