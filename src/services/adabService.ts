/**
 * Adab & Daily Islamic Tasks Service for Santri
 * Tracks daily akhlak, manners, and prayer habits with XP & Star rewards
 */

import { StorageService } from './storageService';

export interface AdabTaskItem {
  id: string;
  title: string;
  category: 'sholat' | 'quran' | 'orang_tua' | 'akhlak' | 'kebersihan';
  icon: string;
  description: string;
  dalilOrHikmah: string;
  xpReward: number;
  starReward: number;
  completed: boolean;
  completedAt?: string;
}

const INITIAL_ADAB_TASKS: Omit<AdabTaskItem, 'completed' | 'completedAt'>[] = [
  {
    id: 'sholat-fardhu',
    title: 'Sholat 5 Waktu Tepat Waktu',
    category: 'sholat',
    icon: '🕌',
    description: 'Menunaikan sholat fardhu di awal waktu / berjamaah bersama keluarga atau di masjid.',
    dalilOrHikmah: '"Sesungguhnya sholat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman." (QS. An-Nisa: 103)',
    xpReward: 25,
    starReward: 2,
  },
  {
    id: 'murojaah-harian',
    title: 'Murojaah 1 Blok / 1 Surah Hari Ini',
    category: 'quran',
    icon: '📖',
    description: 'Menjaga hafalan ayat yang telah dipelajari dengan menyimak atau menyetor ke guru/orang tua.',
    dalilOrHikmah: 'Rasulullah SAW bersabda: "Jagalah Al-Qur\'an ini, demi Dzat yang jiwaku berada di tangan-Nya, ia lebih cepat lepas daripada unta dalam ikatannya."',
    xpReward: 35,
    starReward: 3,
  },
  {
    id: 'berbakti-orang-tua',
    title: 'Cium Tangan & Doakan Ayah Bunda',
    category: 'orang_tua',
    icon: '🤲',
    description: 'Mencium tangan kedua orang tua dengan takzim dan mendoakan kebaikan bagi mereka setiap hari.',
    dalilOrHikmah: '"Dan rendahkanlah dirimu terhadap mereka berdua dengan penuh kesayangan dan ucapkanlah: Wahai Tuhanku, sayangilah mereka berdua..." (QS. Al-Isra: 24)',
    xpReward: 20,
    starReward: 2,
  },
  {
    id: 'dzikir-harian',
    title: 'Dzikir & Tasbih Santri (33x)',
    category: 'akhlak',
    icon: '📿',
    description: 'Membasahi lisan dengan tasbih, tahmid, takbir, atau istighfar setelah sholat atau di waktu luang.',
    dalilOrHikmah: '"Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram." (QS. Ar-Ra\'d: 28)',
    xpReward: 15,
    starReward: 1,
  },
  {
    id: 'sedekah-subuh',
    title: 'Sedekah Subuh / Celengan Kebaikan',
    category: 'akhlak',
    icon: '🪙',
    description: 'Menyisihkan uang saku atau koin kebaikan untuk infaq santri dan membantu yang membutuhkan.',
    dalilOrHikmah: '"Tidaklah ada suatu hari pun saat hamba berada di pagi hari melainkan ada dua malaikat turun mendoakannya..." (HR. Bukhari)',
    xpReward: 20,
    starReward: 2,
  },
  {
    id: 'senyum-salam',
    title: 'Tersenyum & Mengucap Salam',
    category: 'akhlak',
    icon: '😊',
    description: 'Menebarkan salam "Assalamu\'alaikum" dan wajah ceria saat bertemu orang lain.',
    dalilOrHikmah: '"Senyummu di hadapan saudaramu adalah sedekah bagimu." (HR. Tirmidzi)',
    xpReward: 10,
    starReward: 1,
  },
  {
    id: 'adab-makan',
    title: 'Adab Makan: Bismillah & Tangan Kanan',
    category: 'akhlak',
    icon: '🍽️',
    description: 'Membaca doa sebelum makan, duduk tenang, dan menggunakan tangan kanan.',
    dalilOrHikmah: 'Rasulullah SAW bersabda: "Wahai anak muda, sebutlah nama Allah, makanlah dengan tangan kananmu, dan makanlah yang dekat denganmu."',
    xpReward: 15,
    starReward: 1,
  },
  {
    id: 'rapi-mushaf',
    title: 'Merapikan Mushaf Al-Qur\'an & Kamar',
    category: 'kebersihan',
    icon: '📚',
    description: 'Meletakkan Al-Qur\'an di tempat yang tinggi dan mulia serta merapikan tempat tidur sendiri.',
    dalilOrHikmah: '"Kebersihan itu sebagian dari iman" dan memuliakan mushaf adalah syiar ketakwaan hati.',
    xpReward: 15,
    starReward: 1,
  },
];

const STORAGE_PREFIX = 'cahaya_tahfiz_adab_tasks_';

export class AdabService {
  private static getTodayKey(childId: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `${STORAGE_PREFIX}${childId}_${today}`;
  }

  public static getDailyTasks(childId: string): AdabTaskItem[] {
    if (typeof window === 'undefined') {
      return INITIAL_ADAB_TASKS.map((t) => ({ ...t, completed: false }));
    }

    const key = this.getTodayKey(childId);
    const raw = localStorage.getItem(key);

    if (!raw) {
      const freshList: AdabTaskItem[] = INITIAL_ADAB_TASKS.map((t) => ({
        ...t,
        completed: false,
      }));
      localStorage.setItem(key, JSON.stringify(freshList));
      return freshList;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADAB_TASKS.map((t) => ({ ...t, completed: false }));
    }
  }

  public static toggleTask(
    childId: string,
    taskId: string
  ): {
    tasks: AdabTaskItem[];
    task: AdabTaskItem | null;
    completed: boolean;
  } {
    const currentTasks = this.getDailyTasks(childId);
    let changedTask: AdabTaskItem | null = null;
    let isNowCompleted = false;

    const updatedTasks = currentTasks.map((t) => {
      if (t.id === taskId) {
        isNowCompleted = !t.completed;
        changedTask = {
          ...t,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
        return changedTask;
      }
      return t;
    });

    const key = this.getTodayKey(childId);
    localStorage.setItem(key, JSON.stringify(updatedTasks));

    // If completed, award XP and Stars to child profile via Ledger
    if (isNowCompleted && changedTask) {
      const task = changedTask as AdabTaskItem;
      StorageService.recordPoints(
        childId,
        'ADAB_TASK',
        task.xpReward,
        task.starReward,
        `Adab Santri: ${task.title}`
      );
    }

    return {
      tasks: updatedTasks,
      task: changedTask,
      completed: isNowCompleted,
    };
  }

  public static getCompletedCount(tasks: AdabTaskItem[]): number {
    return tasks.filter((t) => t.completed).length;
  }
}
