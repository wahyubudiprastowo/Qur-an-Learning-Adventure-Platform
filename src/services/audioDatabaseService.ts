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
   * Converts a Base64 data URL back to a binary Blob.
   */
  static dataUrlToBlob(dataUrl: string): Blob | null {
    try {
      const parts = dataUrl.split(',');
      if (parts.length < 2) return null;
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'audio/webm';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.warn('Failed to convert dataUrl to Blob:', e);
      return null;
    }
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
   * Retrieves raw binary Blob for a given recording ID.
   */
  static async getAudioBlob(recordingId: string, fallbackDataUrl?: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(recordingId);
        req.onsuccess = () => resolve(req.result instanceof Blob ? req.result : null);
        req.onerror = () => reject(req.error);
      });

      if (blob instanceof Blob) {
        return blob;
      }
    } catch (e) {
      console.warn('Could not read Blob from IndexedDB:', e);
    }

    if (fallbackDataUrl && fallbackDataUrl.length > 0) {
      const parsedBlob = this.dataUrlToBlob(fallbackDataUrl);
      if (parsedBlob) return parsedBlob;
    }

    return null;
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

  /**
   * Deletes multiple audio entries from the database.
   */
  static async deleteMultipleAudio(recordingIds: string[]): Promise<void> {
    for (const id of recordingIds) {
      await this.deleteAudio(id);
    }
  }

  /**
   * Clears all audio records from IndexedDB.
   */
  static async clearAllAudio(): Promise<void> {
    this.urlCache.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    this.urlCache.clear();

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to clear audio store:', e);
    }
  }

  /**
   * Downloads an individual recording audio file directly to the user's local device.
   */
  static async downloadAudioFile(rec: {
    id: string;
    surahName?: string;
    ayahNumber: number;
    audioBlobUrl?: string;
    audioDataUrl?: string;
    createdAt?: string;
  }): Promise<boolean> {
    try {
      const blob = await this.getAudioBlob(rec.id, rec.audioDataUrl || rec.audioBlobUrl);
      if (!blob) {
        console.warn('File audio tidak ditemukan di memori perangkat.');
        return false;
      }

      const surahClean = (rec.surahName || 'Surah').replace(/[^a-zA-Z0-9_-]/g, '_');
      const dateClean = rec.createdAt ? new Date(rec.createdAt).toISOString().split('T')[0] : 'hafalan';
      const ext = blob.type.includes('mp3') ? 'mp3' : blob.type.includes('wav') ? 'wav' : 'webm';
      const filename = `CahayaTahfiz_${surahClean}_Ayat_${rec.ayahNumber}_${dateClean}.${ext}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);

      return true;
    } catch (err) {
      console.error('Failed to download audio file:', err);
      return false;
    }
  }

  /**
   * Estimates total audio records and approximate size in bytes stored in IndexedDB.
   */
  static async getStorageUsageEstimate(): Promise<{ count: number; estimatedBytes: number }> {
    try {
      const db = await this.getDB();
      return await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        let count = 0;
        let estimatedBytes = 0;

        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            count++;
            if (cursor.value instanceof Blob) {
              estimatedBytes += cursor.value.size;
            } else if (typeof cursor.value === 'string') {
              estimatedBytes += cursor.value.length;
            }
            cursor.continue();
          } else {
            resolve({ count, estimatedBytes });
          }
        };
        req.onerror = () => resolve({ count: 0, estimatedBytes: 0 });
      });
    } catch {
      return { count: 0, estimatedBytes: 0 };
    }
  }
}
