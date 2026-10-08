/**
 * ARCHIMEDES Client-Side Notification Manager
 * Handles local browser notifications for PWA/desktop and mobile devices.
 */

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermissionStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationStatus;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationStatus;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
}

export async function triggerNotification(title: string, options?: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const result = await requestBrowserNotificationPermission();
    if (result !== 'granted') return false;
  }

  const notificationOptions: NotificationOptions = {
    icon: '/icon-192.png',
    badge: '/icon-monochrome.svg',
    ...options
  };

  // Try service worker notification first (better on mobile & PWAs)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch {
      // Fallback to standard window Notification
    }
  }

  // Standard Web Notification API fallback
  try {
    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.warn('Direct Notification constructor failed:', err);
    return false;
  }
}

export async function sendTestNotification(): Promise<{ success: boolean; message: string }> {
  const status = getNotificationPermissionStatus();
  if (status === 'unsupported') {
    return { success: false, message: 'Notifications are not supported in this browser.' };
  }

  if (status === 'denied') {
    return {
      success: false,
      message: 'Notifications are blocked in your browser settings. Please enable permissions for this site.'
    };
  }

  const sent = await triggerNotification('ARCHIMEDES // TEST ALERT', {
    body: 'Notification system operational. Training alerts will appear here.',
    tag: 'archimedes-test-notification'
  });

  if (sent) {
    return { success: true, message: 'Test notification delivered successfully.' };
  } else {
    return { success: false, message: 'Could not deliver notification. Check permissions.' };
  }
}
