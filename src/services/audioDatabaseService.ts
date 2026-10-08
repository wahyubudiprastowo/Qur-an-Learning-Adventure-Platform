/**
 * AudioDatabaseService
 * Persistent audio storage using browser IndexedDB with Base64 fallback.
 * Allows recitation recordings to be permanently preserved in the browser database
 * for later review and evaluation by parents or teachers across device sessions.
 */

const DB_NAME = 'cahaya_tahfiz_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings_audio';

export class AudioDatabaseService {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static urlCache = new Map<string, string>();

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported'));
      }

      const req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => {
        resolve(req.result);
      };

      req.onerror = () => {
        reject(req.error || new Error('Failed to open audio IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Converts a Blob to a persistent base64 data URL string.
   */
  static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Saves an audio Blob into IndexedDB and returns its base64 representation.
   */
  static async saveAudioBlob(recordingId: string, blob: Blob): Promise<{ objectUrl: string; dataUrl: string }> {
    const objectUrl = URL.createObjectURL(blob);
    this.urlCache.set(recordingId, objectUrl);

    let dataUrl = '';
    try {
      dataUrl = await this.blobToDataUrl(blob);
    } catch (e) {
      console.warn('Could not convert blob to dataUrl:', e);
    }

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blob, recordingId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB write failed, falling back to dataUrl only:', err);
    }

    return { objectUrl, dataUrl };
  }

  /**
   * Retrieves a playable audio URL (ObjectURL or DataURL) for a given recording ID.
   */
  static async getAudioUrl(recordingId: string, fallbackDataUrl?: string): Promise<string | null> {
    // 1. Check in-memory object URL cache
    if (this.urlCache.has(recordingId)) {
      return this.urlCache.get(recordingId)!;
    }

    // 2. Query IndexedDB
    try {
      const db = await this.getDB();
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(recordingId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (blob instanceof Blob) {
        const freshUrl = URL.createObjectURL(blob);
        this.urlCache.set(recordingId, freshUrl);
        return freshUrl;
      }
    } catch (e) {
      console.warn('Could not load audio from IndexedDB:', e);
    }

    // 3. Fallback to stored dataUrl or existing URL
    if (fallbackDataUrl && fallbackDataUrl.length > 0) {
      return fallbackDataUrl;
    }

    return null;
  }

  /**
   * Deletes an audio entry from the database.
   */
  static async deleteAudio(recordingId: string): Promise<void> {
    if (this.urlCache.has(recordingId)) {
      try {
        URL.revokeObjectURL(this.urlCache.get(recordingId)!);
      } catch (e) {}
      this.urlCache.delete(recordingId);
    }

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(recordingId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to delete audio from IndexedDB:', e);
    }
  }
}
