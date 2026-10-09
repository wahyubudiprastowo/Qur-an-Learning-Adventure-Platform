import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Heart,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Compass,
  Star,
  BookOpen,
  Calendar,
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChildProfile } from '../../types';
import { AdabService, AdabTaskItem } from '../../services/adabService';
import {
  NotificationService,
  ReminderSchedule,
  DEFAULT_REMINDERS,
} from '../../services/notificationService';

interface PusatIbadahDoaModalProps {
  isOpen: boolean;
  onClose?: () => void;
  activeChild?: ChildProfile;
  initialTab?: 'jadwal' | 'adab' | 'doa' | 'tasbih' | 'notifikasi';
  onTasksUpdated?: () => void;
  isFullPage?: boolean;
}

interface DoaItem {
  id: string;
  category: 'hafalan' | 'harian' | 'masjid' | 'adab';
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  benefit: string;
}

const DOA_LIST: DoaItem[] = [
  {
    id: 'doa-belajar-quran',
    category: 'hafalan',
    title: 'Doa Sebelum Menghafal & Belajar Al-Qur\'an',
    arabic: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا وَاجْعَلْنِي مِنَ الصَّالِحِينَ',
    latin: "Rabbi zidnii 'ilman warzuqnii fahman waj'alnii minash-shaalihiin.",
    translation: 'Ya Tuhanku, tambahkanlah ilmuku, karuniakanlah pemahaman yang mendalam, dan jadikanlah aku termasuk golongan orang-orang yang sholeh.',
    benefit: 'Membuka kelapangan dada dan ketajaman daya ingat saat menghafal ayat-ayat baru.',
  },
  {
    id: 'doa-khatmil-quran',
    category: 'hafalan',
    title: 'Doa Senandung Kasih Al-Qur\'an (Khatmil Qur\'an)',
    arabic: 'اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ وَاجْعَلْهُ لَنَا إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
    latin: "Allahummarhamnaa bil Qur'aan, waj'alhu lanaa imaaman wa nuuran wa hudan wa rahmah.",
    translation: 'Ya Allah, sayangilah kami dengan Al-Qur\'an, jadikanlah ia bagi kami sebagai pedoman, cahaya, petunjuk, dan rahmat.',
    benefit: 'Dianjurkan dibaca setelah sesi murojaah dan tilawah agar Al-Qur\'an menjadi syafaat.',
  },
  {
    id: 'doa-orang-tua',
    category: 'harian',
    title: 'Doa untuk Kedua Orang Tua',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin: "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.",
    translation: 'Ya Allah, ampunilah dosaku dan kedua orang tuaku, dan sayangilah mereka berdua sebagaimana mereka telah menyayangiku sewaktu kecil.',
    benefit: 'Kunci keberkahan ilmu santri dan pintu pembuka ridho Allah SWT.',
  },
  {
    id: 'doa-sebelum-tidur',
    category: 'harian',
    title: 'Doa Sebelum Tidur',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
    latin: 'Bismikallaahumma ahyaa wa amuut.',
    translation: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.',
    benefit: 'Perlindungan dari gangguan mimpi buruk dan menjaga hafalan tersimpan baik di memori tidur.',
  },
  {
    id: 'doa-bangun-tidur',
    category: 'harian',
    title: 'Doa Bangun Tidur',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: "Alhamdulillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur.",
    translation: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya lah tempat kembali.',
    benefit: 'Memulai hari santri dengan rasa syukur dan semangat menyambut fajar.',
  },
  {
    id: 'doa-masuk-masjid',
    category: 'masjid',
    title: 'Doa Masuk Masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: 'Allaahummaftah lii abwaaba rahmatik.',
    translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    benefit: 'Mendapat ketenangan bathin dan keberkahan setiap melangkah ke rumah Allah.',
  },
  {
    id: 'doa-keluar-masjid',
    category: 'masjid',
    title: 'Doa Keluar Masjid',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    latin: 'Allaahumma innii as-aluka min fadhlik.',
    translation: 'Ya Allah, sesungguhnya aku memohon karunia kemurahan-Mu.',
    benefit: 'Membawa berkah ibadah kembali ke dalam aktivitas santri sehari-hari.',
  },
  {
    id: 'doa-kebaikan-dunia-akhirat',
    category: 'adab',
    title: 'Doa Sapu Jagad (Kebaikan Dunia & Akhirat)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: 'Rabbanaa aatinaa fid-dunyaa hasanah wa fil-aakhirati hasanah wa qinaa adzaaban-naar.',
    translation: 'Ya Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari siksa api neraka.',
    benefit: 'Doa yang paling sering dibaca oleh Rasulullah SAW mencakup seluruh hajat.',
  },
];

export const PusatIbadahDoaModal: React.FC<PusatIbadahDoaModalProps> = ({
  isOpen,
  onClose,
  activeChild,
  initialTab = 'jadwal',
  onTasksUpdated,
  isFullPage = false,
}) => {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'adab' | 'doa' | 'tasbih' | 'notifikasi'>(
    initialTab
  );
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hafalan' | 'harian' | 'masjid' | 'adab'>('all');
  const [copiedDoaId, setCopiedDoaId] = useState<string | null>(null);
  const [playingDoaId, setPlayingDoaId] = useState<string | null>(null);

  // Digital Tasbih State
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [tasbihTarget, setTasbihTarget] = useState<number>(33);
  const [tasbihZikir, setTasbihZikir] = useState<string>('Subhanallah');

  // Adab Tasks State
  const childId = activeChild?.id || 'default-child';
  const [adabTasks, setAdabTasks] = useState<AdabTaskItem[]>(() =>
    AdabService.getDailyTasks(childId)
  );

  // Notifications State
  const [reminders, setReminders] = useState<ReminderSchedule[]>(() =>
    NotificationService.getReminders()
  );
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(
    () => NotificationService.getPermissionStatus()
  );
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  const [showAddCustomTime, setShowAddCustomTime] = useState<boolean>(false);
  const [customTimeInput, setCustomTimeInput] = useState<string>('20:00');
  const [customNameInput, setCustomNameInput] = useState<string>('Murojaah Malam');

  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    setAdabTasks(AdabService.getDailyTasks(childId));
    setReminders(NotificationService.getReminders());
    setPermissionStatus(NotificationService.getPermissionStatus());

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isOpen, childId]);

  if (!isOpen) return null;

  // Prayer times baseline (WIB)
  const prayerSchedule = [
    { name: 'Subuh', time: '04:36', icon: Sunrise, color: 'text-amber-500', isGoldenHafalan: true },
    { name: 'Terbit', time: '05:52', icon: Sun, color: 'text-orange-400', isGoldenHafalan: false },
    { name: 'Dzuhur', time: '11:58', icon: Sun, color: 'text-yellow-500', isGoldenHafalan: false },
    { name: 'Ashar', time: '15:14', icon: Sunset, color: 'text-orange-500', isGoldenHafalan: false },
    { name: 'Maghrib', time: '17:59', icon: Moon, color: 'text-indigo-400', isGoldenHafalan: true },
    { name: 'Isya', time: '19:08', icon: Moon, color: 'text-purple-500', isGoldenHafalan: false },
  ];

  // Adab Task Toggler
  const handleToggleAdabTask = (taskId: string) => {
    const res = AdabService.toggleTask(childId, taskId);
    setAdabTasks(res.tasks);

    if (res.completed && res.task) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
      NotificationService.playChimeSound();
    }

    if (onTasksUpdated) {
      onTasksUpdated();
    }
  };

  // Notification Permission Request
  const handleRequestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    setPermissionStatus(granted ? 'granted' : NotificationService.getPermissionStatus());
    if (granted) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
      });
      // Send welcoming notification
      NotificationService.triggerNotification(
        {
          id: 'welcome-reminder',
          name: 'Izin Notifikasi Aktif',
          time: '',
          title: '🔔 Pengingat Murojaah Aktif!',
          body: 'Masha Allah! Browser Anda kini siap mengingatkan santri rutin murojaah di waktu emas tahfiz ✨',
          enabled: true,
          sound: true,
          tag: 'welcome-reminder',
        },
        true
      );
    }
  };

  // Test Notification
  const handleTestNotification = async () => {
    setTestNotificationSent(true);
    await NotificationService.triggerNotification(
      {
        id: 'test-reminder',
        name: 'Uji Coba Pengingat',
        time: '',
        title: '📖 Waktunya Murojaah Santri!',
        body: 'Assalamu\'alaikum! Ini adalah pengingat hafalan Al-Qur\'an dari Cahaya Tahfiz. Hafalan mutqin dimulai dari konsistensi harian ⭐',
        enabled: true,
        sound: true,
        tag: 'test-reminder',
      },
      true
    );
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  // Toggle Reminder
  const handleToggleReminder = (id: string, enabled: boolean) => {
    const updated = NotificationService.toggleReminder(id, enabled);
    setReminders(updated);
  };

  // Add Custom Reminder
  const handleAddCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTimeInput) return;
    const updated = NotificationService.addReminder(
      customNameInput || 'Murojaah Pilihan',
      customTimeInput
    );
    setReminders(updated);
    setShowAddCustomTime(false);
    setCustomNameInput('Murojaah Malam');
  };

  const completedAdabCount = AdabService.getCompletedCount(adabTasks);

  const handleCopyDoa = (item: DoaItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\n${item.latin}\n\nArtinya: "${item.translation}"\n\n(Aplikasi Cahaya Tahfiz Santri)`;
    navigator.clipboard.writeText(text);
    setCopiedDoaId(item.id);
    setTimeout(() => setCopiedDoaId(null), 2500);
  };

  const handleSpeakDoa = (item: DoaItem) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPlayingDoaId(item.id);

      const utterance = new SpeechSynthesisUtterance(item.arabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingDoaId(null);
      utterance.onerror = () => setPlayingDoaId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTasbihClick = () => {
    const nextCount = tasbihCount + 1;
    setTasbihCount(nextCount);

    if (nextCount === tasbihTarget) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      NotificationService.playChimeSound();
    }
  };

  const filteredDoa =
    selectedCategory === 'all'
      ? DOA_LIST
      : DOA_LIST.filter((d) => d.category === selectedCategory);

  const innerContent = (
    <div className="bg-white rounded-3xl border border-[#C9E1ED] shadow-sm sm:shadow-lg overflow-hidden relative font-sans text-left">
      {/* Close / Back Button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label={isFullPage ? 'Kembali' : 'Tutup'}
          className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          {isFullPage ? <span>← Kembali</span> : <X size={16} />}
        </button>
      )}

        {/* TOP HEADER */}
        <div className="pt-7 pb-5 px-6 bg-gradient-to-b from-sky-50 via-cyan-50/40 to-white border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#08B9EF] to-teal-400 text-white flex items-center justify-center text-2xl shadow-md ring-4 ring-cyan-100 shrink-0">
              🕌
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-heading text-[#164C68] tracking-tight">
                  Pusat Ibadah, Adab & Doa Santri
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  HARIAN & PWA
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Jadwal sholat 5 waktu, waktu emas tahfiz, misi adab harian berhadiah XP/Bintang, doa santri, & notifikasi murojaah.
              </p>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('jadwal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'jadwal'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock size={13} />
              <span>Jadwal Sholat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('adab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'adab'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Daily Task Adab ({completedAdabCount}/{adabTasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifikasi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'notifikasi'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bell size={13} className="text-rose-400" />
              <span>Pengingat Murojaah</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('doa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'doa'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={13} />
              <span>Koleksi Doa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasbih')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tasbih'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Heart size={13} />
              <span>Tasbih Digital</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {/* TAB 1: JADWAL SHOLAT & WAKTU EMAS HAFALAN */}
          {activeTab === 'jadwal' && (
            <div className="space-y-4">
              {/* Golden Hours Alert Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-md space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h4 className="text-sm font-black font-heading tracking-tight">
                    Waktu Emas Menghafal Al-Qur'an (Golden Hours)
                  </h4>
                </div>
                <p className="text-xs text-amber-50 leading-relaxed font-medium">
                  Menurut ulama tahfiz, <strong>Ba'da Subuh</strong> (05:00 - 06:30) dan <strong>Ba'da Maghrib</strong> (18:15 - 19:00) adalah waktu konsentrasi otak santri paling tajam untuk menyerap hafalan baru (Ziadah) dan memperkuat Murojaah!
                </p>
              </div>

              {/* Live Clock & Schedule Grid */}
              <div className="p-4 bg-[#EEF8FF] border border-[#C9E1ED] rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs text-[#164C68]">
                  <span className="font-bold flex items-center gap-1.5">
                    <Clock size={14} className="text-[#08B9EF]" />
                    <span>Waktu Saat Ini:</span>
                  </span>
                  <span className="font-mono font-black text-sm text-[#08B9EF]">
                    {currentTime.toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {prayerSchedule.map((p) => {
                    const IconComp = p.icon;
                    return (
                      <div
                        key={p.name}
                        className={`p-3 rounded-2xl text-center border transition-all ${
                          p.isGoldenHafalan
                            ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <IconComp size={18} className={`mx-auto mb-1 ${p.color}`} />
                        <span className="text-[11px] font-bold text-slate-600 block">
                          {p.name}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#164C68] font-mono block">
                          {p.time}
                        </span>
                        {p.isGoldenHafalan && (
                          <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-200/70 px-1 py-0.2 rounded-full inline-block mt-0.5">
                            Tahfiz
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Jump to Murojaah Reminder */}
              <div
                onClick={() => setActiveTab('notifikasi')}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-100/60 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <BellRing size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#164C68] block">
                      Ingin diingatkan otomatis saat waktu murojaah tiba?
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Aktifkan notifikasi browser lokal harian (Subuh, Ashar, Maghrib)
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-emerald-700" />
              </div>
            </div>
          )}

          {/* TAB 2: DAILY TASK ADAB & AMALAN SANTRI */}
          {activeTab === 'adab' && (
            <div className="space-y-4">
              {/* Progress Summary Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-[#164C68] text-white rounded-3xl shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                      Misi Harian Akhlak & Ibadah Santri
                    </span>
                    <h3 className="text-base sm:text-lg font-black font-heading text-amber-300">
                      {completedAdabCount === adabTasks.length
                        ? '🎉 Masha Allah! Seluruh Misi Hari Ini Tuntas!'
                        : `${completedAdabCount} dari ${adabTasks.length} Adab Santri Tuntas`}
                    </h3>
                  </div>

                  <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white font-mono">
                    {Math.round((completedAdabCount / adabTasks.length) * 100)}%
                  </span>
                </div>

                <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-300"
                    style={{ width: `${(completedAdabCount / adabTasks.length) * 100}%` }}
                  />
                </div>

                <p className="text-[11px] text-emerald-100 font-medium">
                  Setiap adab yang diselesaikan melatih karakter mulia dan menghadiahkan bintang ⭐ serta poin XP untuk menaikkan level hafiz!
                </p>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {adabTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleAdabTask(task.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                      task.completed
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-cyan-300'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-2xl shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={24} className="text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle size={24} className="text-slate-300 hover:text-cyan-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base">{task.icon}</span>
                          <h4
                            className={`text-xs font-black font-heading ${
                              task.completed ? 'text-emerald-950 line-through opacity-80' : 'text-[#164C68]'
                            }`}
                          >
                            {task.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-500" />
                            +{task.starReward}
                          </span>
                          <span className="text-[10px] font-black text-[#08B9EF] bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-md">
                            +{task.xpReward} XP
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>

                      <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        {task.dalilOrHikmah}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PENGINGAT NOTIFIKASI MUROJAAH PWA (BROWSER LOKAL) */}
          {activeTab === 'notifikasi' && (
            <div className="space-y-4">
              {/* Permission Status Alert */}
              <div className={`p-4 rounded-3xl border space-y-2 ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : permissionStatus === 'denied'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {permissionStatus === 'granted' ? (
                      <BellRing size={20} className="text-emerald-600" />
                    ) : permissionStatus === 'denied' ? (
                      <BellOff size={20} className="text-rose-600" />
                    ) : (
                      <Bell size={20} className="text-amber-600" />
                    )}
                    <h4 className="text-xs sm:text-sm font-black font-heading">
                      Status Notifikasi Browser: {
                        permissionStatus === 'granted'
                          ? 'Aktif & Siap Mengingatkan ✅'
                          : permissionStatus === 'denied'
                          ? 'Izin Diblokir Browser ❌'
                          : 'Izin Belum Diaktifkan ⚠️'
                      }
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {permissionStatus === 'granted'
                    ? 'Browser lokal Anda akan memunculkan notifikasi pop-up dan suara pengingat murojaah otomatis pada jam yang dijadwalkan di bawah ini.'
                    : permissionStatus === 'denied'
                    ? 'Izin notifikasi diblokir pada pengaturan browser. Silakan klik ikon gembok di bilah alamat browser untuk mengizinkan notifikasi aplikasi ini.'
                    : 'Aktifkan izin notifikasi sekali klik agar anak tidak melewatkan jadwal murojaah harian meskipun sedang membuka tab lain.'}
                </p>

                {permissionStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="py-2 px-4 rounded-xl bg-[#164C68] hover:bg-[#08B9EF] text-white font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Bell size={14} />
                    <span>Aktifkan Izin Notifikasi Browser Sekarang</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Test Notification */}
              <div className="flex items-center justify-between gap-3 p-3.5 bg-[#EEF8FF] border border-[#C9E1ED] rounded-2xl flex-wrap">
                <div>
                  <span className="text-xs font-black text-[#164C68] block">
                    Uji Coba Notifikasi & Suara Chime
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Cek langsung tampilan pop-up dan suara bel di perangkat Anda
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={testNotificationSent}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#08B9EF] to-teal-500 hover:opacity-90 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Zap size={14} />
                  <span>{testNotificationSent ? 'Notifikasi Terkirim! ✨' : 'Kirim Uji Coba Sekarang'}</span>
                </button>
              </div>

              {/* Reminder Schedules List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#164C68]">
                  <span>Jadwal Pengingat Murojaah Harian:</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomTime(!showAddCustomTime)}
                    className="text-[#08B9EF] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Plus size={13} />
                    <span>Tambah Jam Pengingat</span>
                  </button>
                </div>

                {/* Form Add Custom Time */}
                {showAddCustomTime && (
                  <form
                    onSubmit={handleAddCustomTime}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Nama Pengingat:
                        </label>
                        <input
                          type="text"
                          value={customNameInput}
                          onChange={(e) => setCustomNameInput(e.target.value)}
                          placeholder="Misal: Sebelum Tidur"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:border-[#08B9EF] outline-hidden font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Jam (24 Jam):
                        </label>
                        <input
                          type="time"
                          value={customTimeInput}
                          onChange={(e) => setCustomTimeInput(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:border-[#08B9EF] outline-hidden font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCustomTime(false)}
                        className="px-3 py-1 text-xs text-slate-500 font-bold hover:text-slate-800"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 rounded-xl bg-[#164C68] text-white text-xs font-bold hover:bg-[#08B9EF]"
                      >
                        Simpan Jadwal
                      </button>
                    </div>
                  </form>
                )}

                {/* Reminders Cards */}
                <div className="space-y-2">
                  {reminders.map((r) => (
                    <div
                      key={r.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        r.enabled
                          ? 'bg-white border-slate-200 hover:border-cyan-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-[#08B9EF] flex items-center justify-center font-mono font-black text-sm shrink-0">
                          {r.time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-[#164C68]">
                              {r.name}
                            </h4>
                            {r.id === 'subuh' && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                Golden Hour
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {r.body}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={r.enabled}
                            onChange={(e) => handleToggleReminder(r.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>

                        {r.id.startsWith('custom-') && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = NotificationService.deleteReminder(r.id);
                              setReminders(updated);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KOLEKSI DOA SANTRI */}
          {activeTab === 'doa' && (
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'Semua Doa' },
                  { id: 'hafalan', label: '📖 Hafalan & Qur\'an' },
                  { id: 'harian', label: '☀️ Doa Harian' },
                  { id: 'masjid', label: '🕌 Masjid' },
                  { id: 'adab', label: '🌟 Adab Santri' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-[#164C68] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Doa Cards List */}
              <div className="space-y-3">
                {filteredDoa.map((doa) => (
                  <div
                    key={doa.id}
                    className="p-4 bg-white border border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#164C68] font-heading">
                        {doa.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSpeakDoa(doa)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            playingDoaId === doa.id
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Putar Lafal Suara"
                        >
                          <Volume2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyDoa(doa)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Salin Doa"
                        >
                          {copiedDoaId === doa.id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-amber-100 text-right">
                      <p className="text-lg sm:text-xl font-arabic leading-loose text-slate-900 font-bold">
                        {doa.arabic}
                      </p>
                    </div>

                    <p className="text-xs font-medium text-slate-600 italic">
                      "{doa.latin}"
                    </p>

                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                      Artinya: {doa.translation}
                    </p>

                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10px] text-emerald-900 font-medium flex items-center gap-1.5">
                      <Sparkles size={12} className="text-emerald-600 shrink-0" />
                      <span>{doa.benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TASBIH DIGITAL SANTRI */}
          {activeTab === 'tasbih' && (
            <div className="space-y-4 text-center">
              {/* Preset Selector */}
              <div className="flex justify-center gap-2 flex-wrap">
                {[
                  { name: 'Subhanallah', target: 33 },
                  { name: 'Alhamdulillah', target: 33 },
                  { name: 'Allahu Akbar', target: 33 },
                  { name: 'Astaghfirullah', target: 100 },
                  { name: 'Shalawat Nabi', target: 100 },
                ].map((z) => (
                  <button
                    key={z.name}
                    type="button"
                    onClick={() => {
                      setTasbihZikir(z.name);
                      setTasbihTarget(z.target);
                      setTasbihCount(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tasbihZikir === z.name
                        ? 'bg-[#164C68] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {z.name} ({z.target}x)
                  </button>
                ))}
              </div>

              {/* Big Interactive Counter Card */}
              <div className="p-6 bg-gradient-to-b from-[#164C68] to-[#0d3143] text-white rounded-3xl shadow-xl space-y-4 max-w-sm mx-auto">
                <span className="text-xs font-bold text-cyan-200 tracking-wider uppercase block">
                  Lafadz Zikir Santri
                </span>
                <h3 className="text-2xl font-black font-heading text-amber-300">
                  {tasbihZikir}
                </h3>

                {/* Big Button Ring */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleTasbihClick}
                    className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-[#08B9EF] to-teal-400 hover:from-[#07a6d7] hover:to-teal-300 text-white shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all ring-8 ring-cyan-500/30"
                  >
                    <span className="text-4xl font-black font-mono tracking-tight">
                      {tasbihCount}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-100 mt-1">
                      Target: {tasbihTarget}x
                    </span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-200"
                      style={{ width: `${Math.min(100, (tasbihCount / tasbihTarget) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-cyan-200 font-bold">
                    <span>Progres: {Math.round((tasbihCount / tasbihTarget) * 100)}%</span>
                    <span>Sisa: {Math.max(0, tasbihTarget - tasbihCount)}x</span>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => setTasbihCount(0)}
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Hitungan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  if (isFullPage) {
    return (
      <div className="max-w-3xl mx-auto pb-20 font-sans text-left animate-in fade-in duration-200">
        {innerContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="max-w-2xl w-full my-4 relative font-sans text-left"
      >
        {innerContent}
      </motion.div>
    </div>
  );
};
