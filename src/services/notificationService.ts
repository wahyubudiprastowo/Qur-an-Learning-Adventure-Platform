/**
 * Notification Service for Cahaya Tahfiz
 * Local browser (PWA) push notifications for daily murojaah reminders
 */

export interface ReminderSchedule {
  id: string;
  name: string;
  time: string; // HH:MM in 24h format
  title: string;
  body: string;
  enabled: boolean;
  sound: boolean;
  tag: string;
}

const STORAGE_KEYS = {
  REMINDER_SETTINGS: 'cahaya_tahfiz_reminder_settings',
  LAST_TRIGGERED_LOG: 'cahaya_tahfiz_reminder_last_triggered',
  IN_APP_TOAST_LISTENER: 'cahaya_tahfiz_reminder_toast',
};

export const DEFAULT_REMINDERS: ReminderSchedule[] = [
  {
    id: 'subuh',
    name: 'Murojaah Ba\'da Shubuh (Golden Hour)',
    time: '05:30',
    title: '🌅 Waktu Emas Murojaah Subuh!',
    body: 'Assalamu\'alaikum! Pikiran masih segar dan tenang. Yuk murojaah 1 surah bersama Lumi sekarang ✨',
    enabled: true,
    sound: true,
    tag: 'reminder-subuh',
  },
  {
    id: 'ashar',
    name: 'Murojaah Sore Ba\'da Ashar',
    time: '16:00',
    title: '☀️ Semangat Sore Hafiz Cilik!',
    body: 'Yuk luangkan 10 menit untuk setor hafalan dan raih bintang baru hari ini ⭐',
    enabled: true,
    sound: true,
    tag: 'reminder-ashar',
  },
  {
    id: 'maghrib',
    name: 'Murojaah Ba\'da Maghrib (Keluarga)',
    time: '18:30',
    title: '🌙 Murojaah Ba\'da Maghrib Berkah',
    body: 'Waktu terbaik mengulang hafalan bersama ayah & bunda. Buka Al-Qur\'an dan dengarkan bacaanmu 📖',
    enabled: true,
    sound: true,
    tag: 'reminder-maghrib',
  },
];

export type InAppNotificationCallback = (reminder: ReminderSchedule) => void;

class NotificationServiceManager {
  private inAppListeners: InAppNotificationCallback[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initWatcher();
  }

  // Check if browser supports notifications
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status: 'granted' | 'denied' | 'default' | 'unsupported'
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Request browser permission
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  // Detect whether running inside an installed Android Launcher App (PWA / Standalone / WebAPK)
  public isAndroidLauncher(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true ||
        (document.referrer && document.referrer.includes('android-app://'));
      return !!isStandalone;
    } catch {
      return false;
    }
  }

  // Get stored reminders or defaults
  public getReminders(): ReminderSchedule[] {
    if (typeof window === 'undefined') return DEFAULT_REMINDERS;
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
    if (!raw) {
      this.saveReminders(DEFAULT_REMINDERS);
      return DEFAULT_REMINDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_REMINDERS;
    }
  }

  // Save reminders configuration
  public saveReminders(reminders: ReminderSchedule[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(reminders));
  }

  // Toggle single reminder
  public toggleReminder(id: string, enabled: boolean): ReminderSchedule[] {
    const list = this.getReminders();
    const updated = list.map((r) => (r.id === id ? { ...r, enabled } : r));
    this.saveReminders(updated);
    return updated;
  }

  // Update reminder time
  public updateReminderTime(id: string, time: string): ReminderSchedule[] {
    const list = this.getReminders();
    const updated = list.map((r) => (r.id === id ? { ...r, time } : r));
    this.saveReminders(updated);
    return updated;
  }

  // Add custom reminder
  public addReminder(name: string, time: string, title?: string, body?: string): ReminderSchedule[] {
    const list = this.getReminders();
    const newReminder: ReminderSchedule = {
      id: `custom-${Date.now()}`,
      name,
      time,
      title: title || `📖 Pengingat Murojaah ${name}`,
      body: body || 'Waktunya menyegarkan hafalan Al-Qur\'an santri agar semakin mutqin! ✨',
      enabled: true,
      sound: true,
      tag: `reminder-custom-${Date.now()}`,
    };
    const updated = [...list, newReminder];
    this.saveReminders(updated);
    return updated;
  }

  // Delete custom reminder
  public deleteReminder(id: string): ReminderSchedule[] {
    const list = this.getReminders();
    const updated = list.filter((r) => r.id !== id);
    this.saveReminders(updated);
    return updated;
  }

  // Play gentle Islamic chime synthesizer using Web Audio API
  public playChimeSound(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Soft spiritual harmonic chord: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + index * 0.12;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.3);
      });
    } catch {}
  }

  // Trigger notification (Browser native + Service Worker if available + Audio Chime + In-App Callback)
  public async triggerNotification(reminder: ReminderSchedule, isTest = false): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Play gentle chime if sound enabled
    if (reminder.sound) {
      this.playChimeSound();
    }

    // 2. Notify in-app subscribers (active React components)
    this.inAppListeners.forEach((fn) => {
      try {
        fn(reminder);
      } catch {}
    });

    // 3. Dispatch native browser & Android launcher notification
    const title = isTest ? `[Uji Coba] ${reminder.title}` : reminder.title;
    const options: NotificationOptions & {
      renotify?: boolean;
      vibrate?: number[];
      actions?: { action: string; title: string }[];
    } = {
      body: reminder.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: reminder.tag || `reminder-${reminder.id}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url: reminder.id.includes('calendar') || reminder.id.includes('adab') ? '/#calendar' : '/#murojaah',
        reminderId: reminder.id,
      },
      actions: [
        { action: 'open_murojaah', title: '📖 Buka Murojaah' },
        { action: 'view_calendar', title: '📅 Cek Kalender Santri' },
      ],
    };

    // Try service worker registration first (ensures push arrives when installed on Android Launcher)
    if ('serviceWorker' in navigator) {
      try {
        let reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          reg = await navigator.serviceWorker.register('/sw.js');
        }
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options);
          if ('setAppBadge' in navigator) {
            (navigator as any).setAppBadge(1).catch(() => {});
          }
          return true;
        }
      } catch (err) {
        console.warn('SW notification fallback note:', err);
      }
    }

    // Fallback to standard Notification constructor
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, options);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  // Explicit Android Launcher Push Notification Trigger
  public async triggerAndroidPushNotification(
    title: string,
    body: string,
    targetUrl: string = '/#calendar'
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    this.playChimeSound();

    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch {}
    }

    const options: any = {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `android-launcher-push-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [250, 100, 250, 100, 250],
      data: {
        url: targetUrl,
      },
      actions: [
        { action: 'view_calendar', title: '📅 Cek Agenda Santri' },
        { action: 'open_murojaah', title: '📖 Lanjut Murojaah' },
      ],
    };

    if ('serviceWorker' in navigator) {
      try {
        let reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          reg = await navigator.serviceWorker.register('/sw.js');
        }
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options);
          if ('setAppBadge' in navigator) {
            (navigator as any).setAppBadge(1).catch(() => {});
          }
          return true;
        }
      } catch (e) {
        console.warn('SW push error:', e);
      }
    }

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, options);
        notif.onclick = () => {
          window.focus();
          window.location.hash = targetUrl.replace('/', '');
          notif.close();
        };
        return true;
      } catch {}
    }

    return false;
  }

  // Subscribe to in-app toast alerts
  public onInAppNotification(callback: InAppNotificationCallback): () => void {
    this.inAppListeners.push(callback);
    return () => {
      this.inAppListeners = this.inAppListeners.filter((fn) => fn !== callback);
    };
  }

  // Background watcher: checks current time every 30 seconds
  private initWatcher(): void {
    if (typeof window === 'undefined') return;
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkInterval = setInterval(() => {
      this.checkScheduledReminders();
    }, 25000); // Check every 25 seconds
  }

  // Check if any reminder matches current minute
  private checkScheduledReminders(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const todayDateStr = now.toISOString().split('T')[0];

    const reminders = this.getReminders();
    const logRaw = localStorage.getItem(STORAGE_KEYS.LAST_TRIGGERED_LOG);
    let log: Record<string, string> = {};
    if (logRaw) {
      try {
        log = JSON.parse(logRaw);
      } catch {}
    }

    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      if (reminder.time === currentTimeStr) {
        const key = `${todayDateStr}_${reminder.id}`;
        // If not already triggered today for this minute
        if (log[key] !== currentTimeStr) {
          log[key] = currentTimeStr;
          localStorage.setItem(STORAGE_KEYS.LAST_TRIGGERED_LOG, JSON.stringify(log));
          this.triggerNotification(reminder, false);
        }
      }
    }
  }
}

export const NotificationService = new NotificationServiceManager();
