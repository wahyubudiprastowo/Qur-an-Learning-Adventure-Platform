import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Send,
  Bell,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  CheckCircle2,
  Clock,
  Smartphone,
  Heart,
  Flame,
  BookOpen,
  Crown,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  AlertCircle,
  Filter,
  Calendar,
  Volume2,
  Layers,
  Copy,
  Check,
  Radio,
  PlusCircle,
  TrendingUp,
  Award,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { BroadcastAnnouncement, DailyEncouragementQuote, DailyPushSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { NotificationService } from '../../services/notificationService';

interface BroadcastManagerTabProps {
  onNotify?: (message: string) => void;
}

// Preset Islamic high-quality imagery for announcements
const PRESET_IMAGE_TEMPLATES = [
  {
    label: 'Mufrodat & Kosakata',
    url: 'https://images.unsplash.com/photo-1584281722572-88151f153b66?q=80&w=900&auto=format&fit=crop',
    caption: 'Kosakata Al-Qur\'an Tematik Penuh Warna',
  },
  {
    label: 'Mushaf & Tilawah',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=900&auto=format&fit=crop',
    caption: 'Tadabbur & Tilawah Al-Qur\'an Cahaya Hati',
  },
  {
    label: 'Santri Berprestasi',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=900&auto=format&fit=crop',
    caption: 'Semangat Santri Cilik Menghafal Al-Qur\'an',
  },
  {
    label: 'Keluarga & Wali',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=900&auto=format&fit=crop',
    caption: 'Murojaah Hangat Bersama Ayah & Bunda',
  },
  {
    label: 'Masjid & Syiar',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900&auto=format&fit=crop',
    caption: 'Program Syiar & Kajian Pekanan Tahfiz',
  },
  {
    label: 'Keamanan 2FA',
    url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=900&auto=format&fit=crop',
    caption: 'Keamanan Tingkat Tinggi Akun Santri',
  },
];

// Preset Videos for guidance & tutorials
const PRESET_VIDEO_TEMPLATES = [
  {
    label: 'Tutorial Murojaah Santri (YouTube)',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    caption: 'Tips 3x Murojaah Menyenangkan Tanpa Bosan',
  },
  {
    label: 'Panduan Mufrodat Interaktif',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    caption: 'Cara Memanfaatkan AI Audio Checker untuk Anak',
  },
];

export const BroadcastManagerTab: React.FC<BroadcastManagerTabProps> = ({ onNotify }) => {
  // Navigation within tab: 'broadcast_list' | 'create_broadcast' | 'daily_encouragement'
  const [subTab, setSubTab] = useState<'broadcasts' | 'daily_encouragement'>('broadcasts');

  // Broadcast List State
  const [broadcasts, setBroadcasts] = useState<BroadcastAnnouncement[]>(() =>
    StorageService.getBroadcastAnnouncements()
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');

  // New Broadcast Form State
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<BroadcastAnnouncement['category']>('feature_update');
  const [audience, setAudience] = useState<BroadcastAnnouncement['audience']>('all');
  const [content, setContent] = useState<string>('');
  const [badge, setBadge] = useState<string>('Fitur Baru 🚀');
  const [priority, setPriority] = useState<BroadcastAnnouncement['priority']>('high');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('image');
  const [mediaUrl, setMediaUrl] = useState<string>(PRESET_IMAGE_TEMPLATES[0].url);
  const [mediaCaption, setMediaCaption] = useState<string>(PRESET_IMAGE_TEMPLATES[0].caption);
  const [hasActionBtn, setHasActionBtn] = useState<boolean>(true);
  const [actionLabel, setActionLabel] = useState<string>('Jelajahi Sekarang');
  const [actionTarget, setActionTarget] = useState<string>('mufrodat');
  const [sendAsPush, setSendAsPush] = useState<boolean>(true);

  // Daily Encouragement State
  const [dailyQuotes, setDailyQuotes] = useState<DailyEncouragementQuote[]>(() =>
    StorageService.getDailyEncouragements()
  );
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(dailyQuotes[0]?.id || 'quote-subuh-01');
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState<string>('all');
  const [customQuoteText, setCustomQuoteText] = useState<string>('');
  const [targetAudiencePush, setTargetAudiencePush] = useState<string>('all');
  const [pushSettings, setPushSettings] = useState<DailyPushSettings>(() =>
    StorageService.getDailyPushSettings()
  );
  const [pushSuccessToast, setPushSuccessToast] = useState<string | null>(null);
  const [isSendingPush, setIsSendingPush] = useState<boolean>(false);

  // Browser Permission State
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  // Selected Quote Details
  const activeQuote = dailyQuotes.find((q) => q.id === selectedQuoteId) || dailyQuotes[0];

  useEffect(() => {
    if (activeQuote) {
      setCustomQuoteText(activeQuote.encouragementMessage);
    }
  }, [selectedQuoteId]);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
        if (res === 'granted') {
          onNotify?.('Izin Web Push Notification berhasil diaktifkan!');
        }
      } catch (e) {
        console.warn('Failed to request notification permission', e);
      }
    }
  };

  // Submit Broadcast Announcement
  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      if (onNotify) onNotify('Mohon isi judul dan isi pesan broadcast!');
      return;
    }

    const newBroadcast = StorageService.saveBroadcastAnnouncement({
      title,
      category,
      audience,
      content,
      badge: badge.trim() || undefined,
      priority,
      mediaType,
      mediaUrl: mediaType !== 'none' ? mediaUrl : undefined,
      mediaCaption: mediaType !== 'none' ? mediaCaption : undefined,
      actionLabel: hasActionBtn ? actionLabel : undefined,
      actionTarget: hasActionBtn ? actionTarget : undefined,
      isPushNotification: sendAsPush,
      status: 'published',
      authorAdmin: 'Admin Syiar Pusat',
    });

    // If push notification is checked, also trigger chime & notification
    if (sendAsPush) {
      NotificationService.playChimeSound();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: content.slice(0, 120) + (content.length > 120 ? '...' : ''),
            icon: '/favicon.ico',
          });
        } catch {
          // Ignore
        }
      }
    }

    setBroadcasts(StorageService.getBroadcastAnnouncements());
    setIsCreating(false);
    // Reset form
    setTitle('');
    setContent('');
    onNotify?.(`Broadcast "${newBroadcast.title}" berhasil dipublikasikan ke seluruh santri & wali! 📢`);
  };

  // Delete Broadcast
  const handleDeleteBroadcast = (id: string, titleName: string) => {
    if (window.confirm(`Yakin ingin menghapus broadcast "${titleName}"?`)) {
      StorageService.deleteBroadcastAnnouncement(id);
      setBroadcasts(StorageService.getBroadcastAnnouncements());
      onNotify?.('Broadcast telah dihapus dari sistem.');
    }
  };

  // Resend / Push Broadcast
  const handleResendBroadcastPush = (broadcast: BroadcastAnnouncement) => {
    NotificationService.playChimeSound();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`📢 ${broadcast.title}`, {
          body: broadcast.content.slice(0, 130),
          icon: '/favicon.ico',
        });
      } catch {
        // Ignore
      }
    }
    onNotify?.(`Push Notification untuk "${broadcast.title}" berhasil dikirimkan ulang! 🚀`);
  };

  // Send Daily Encouragement Push
  const handleSendDailyPush = () => {
    setIsSendingPush(true);
    NotificationService.playChimeSound();

    const res = StorageService.sendDailyPushEncouragement(
      selectedQuoteId,
      customQuoteText,
      targetAudiencePush
    );

    setTimeout(() => {
      setIsSendingPush(false);
      setPushSettings(StorageService.getDailyPushSettings());
      setBroadcasts(StorageService.getBroadcastAnnouncements());
      setPushSuccessToast(`Push Notification Terkirim! "${res.notificationTitle}"`);
      onNotify?.(`Kalimat penyemangat harian berhasil di-push ke ${targetAudiencePush === 'all' ? 'seluruh santri & wali' : targetAudiencePush}! ✨`);
      setTimeout(() => setPushSuccessToast(null), 4000);
    }, 600);
  };

  // Filtered broadcasts
  const filteredBroadcasts = broadcasts.filter((b) => {
    if (filterCategory !== 'all' && b.category !== filterCategory) return false;
    if (filterAudience !== 'all' && b.audience !== filterAudience) return false;
    return true;
  });

  // Filtered quotes
  const filteredQuotes = dailyQuotes.filter((q) => {
    if (quoteCategoryFilter !== 'all' && q.category !== quoteCategoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#164C68] via-[#1E5D7B] to-[#0D3043] p-6 sm:p-8 text-white shadow-lg border border-teal-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Megaphone size={14} className="animate-bounce" />
              <span>Pusat Siaran Syiar & Push Notifikasi Harian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Broadcast Pengumuman & Penyemangat Santri
            </h2>
            <p className="text-sm text-teal-100/90 leading-relaxed">
              Kirimkan pengumuman fitur baru, video panduan tilawah, materi kajian, serta kalimat mutiara & hadits
              penyemangat murojaah harian langsung ke aplikasi seluruh santri dan wali santri.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                setSubTab('broadcasts');
                setIsCreating(true);
              }}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle size={18} />
              <span>Buat Broadcast Baru</span>
            </button>
            <button
              onClick={() => setSubTab('daily_encouragement')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles size={18} className="text-amber-300" />
              <span>Penyemangat Harian ({dailyQuotes.length} Hadits)</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-teal-200/80 font-medium block">Total Broadcast Aktif</span>
            <span className="text-xl font-black text-white">{broadcasts.length} Rilis</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-teal-200/80 font-medium block">Push Notification Terkirim</span>
            <span className="text-xl font-black text-amber-300">{pushSettings.totalNotificationsSent}x</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-teal-200/80 font-medium block">Status Web Push Browser</span>
            <span className="text-sm font-black flex items-center gap-1.5 mt-1">
              {notificationPermission === 'granted' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Aktif & Siap
                </span>
              ) : notificationPermission === 'denied' ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle size={14} /> Diblokir di Browser
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="text-amber-300 underline hover:text-amber-200 text-xs font-bold"
                >
                  Klik Izinkan Notifikasi
                </button>
              )}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-xs text-teal-200/80 font-medium block">Auto-Push Harian</span>
            <span className="text-sm font-black text-emerald-300 flex items-center gap-1 mt-1">
              <Clock size={14} /> 3 Slot (Subuh, Ashar, Malam)
            </span>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      <AnimatePresence>
        {pushSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-slate-950" />
              <span>{pushSuccessToast}</span>
            </div>
            <button
              onClick={() => setPushSuccessToast(null)}
              className="p-1 rounded-lg hover:bg-black/10 text-slate-950 font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-TAB SELECTOR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setSubTab('broadcasts');
            setIsCreating(false);
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'broadcasts' && !isCreating
              ? 'bg-[#164C68] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone size={16} />
          <span>Daftar Broadcast & Pengumuman ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('broadcasts');
            setIsCreating(true);
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'broadcasts' && isCreating
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlusCircle size={16} />
          <span>Editor Broadcast & Media</span>
        </button>

        <button
          onClick={() => setSubTab('daily_encouragement')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'daily_encouragement'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles size={16} />
          <span>Kalimat Penyemangat Harian (Push Notif) ⭐</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. EDITOR BUAT BROADCAST BARU DENGAN IMAGE / VIDEO / CTA PREVIEW          */}
      {/* ========================================================================= */}
      {subTab === 'broadcasts' && isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* FORM EDITOR */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Buat Broadcast & Pengumuman Baru</h3>
                  <p className="text-xs text-slate-500">Rilis pengumuman fitur, video edukasi, atau materi terbaru</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} className="space-y-5">
              {/* Judul & Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <span>Judul Broadcast Pengumuman *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 🚀 Rilis Fitur Baru: Modul Mufrodat Interaktif & AI Audio Checker"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-[#164C68] focus:bg-white transition-all"
                />
              </div>

              {/* Grid: Kategori & Sasaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Kategori Broadcast</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs focus:ring-2 focus:ring-[#164C68] focus:bg-white"
                  >
                    <option value="feature_update">🚀 Fitur Baru & Update Aplikasi</option>
                    <option value="important_announcement">📢 Pengumuman Penting & Kebijakan</option>
                    <option value="materi_tilawah">📖 Update Materi Tilawah & Tahfiz</option>
                    <option value="kajian_event">🕌 Kajian & Webinar Wali Santri</option>
                    <option value="promo_syiar">🌟 Promo Spesial & Program Syiar</option>
                    <option value="daily_encouragement">✨ Nasihat & Motivasi Qurani</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Target Penerima (Audiens)</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs focus:ring-2 focus:ring-[#164C68] focus:bg-white"
                  >
                    <option value="all">👥 Semua Pengguna & Wali Santri</option>
                    <option value="wali_santri">👨‍👩‍👧 Khusus Wali Santri (Orang Tua)</option>
                    <option value="santri_aktif">⭐ Santri Aktif Mengaji</option>
                    <option value="free_users">🌱 Pengguna Free / Masa Percobaan</option>
                    <option value="pro_users">👑 Pengguna Pro Berlangganan</option>
                  </select>
                </div>
              </div>

              {/* Badge & Prioritas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Badge Label (Pill Mini)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fitur Baru 🌟, Kajian 📹, Penting 🔒"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs focus:ring-2 focus:ring-[#164C68] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Tingkat Prioritas</label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPriority('normal')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        priority === 'normal'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Biasa
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('high')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        priority === 'high'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tinggi ⭐
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('urgent')}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        priority === 'urgent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Urgent 🚨
                    </button>
                  </div>
                </div>
              </div>

              {/* Isi Konten Pesan */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Isi Pesan Pengumuman *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Mendukung emotikon & format teks jelas</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan detail pengumuman yang jelas, informatif, dan ramah untuk santri dan orang tua..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-[#164C68] focus:bg-white leading-relaxed resize-none"
                />
              </div>

              {/* PILIHAN MEDIA: GAMBAR / VIDEO / NONE */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Layers size={14} className="text-[#164C68]" />
                    <span>Lampiran Media Visual</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        mediaType === 'image'
                          ? 'bg-[#164C68] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ImageIcon size={12} />
                      <span>Gambar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        mediaType === 'video'
                          ? 'bg-rose-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <VideoIcon size={12} />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('none')}
                      className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        mediaType === 'none'
                          ? 'bg-slate-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Tanpa Media</span>
                    </button>
                  </div>
                </div>

                {mediaType === 'image' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">URL Gambar Banner</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>

                    {/* Quick Preset Images */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        Pilih Cepat dari Preset Gambar Islami:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_IMAGE_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setMediaUrl(tmpl.url);
                              setMediaCaption(tmpl.caption);
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              mediaUrl === tmpl.url
                                ? 'border-[#164C68] bg-teal-50 ring-1 ring-[#164C68]'
                                : 'border-slate-200 bg-white hover:bg-slate-100'
                            }`}
                          >
                            <img
                              src={tmpl.url}
                              alt={tmpl.label}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                            <div className="overflow-hidden">
                              <span className="text-[11px] font-black text-slate-800 block truncate">
                                {tmpl.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Keterangan Gambar (Caption)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Modul kosakata tematik Al-Qur'an ramah anak"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                {mediaType === 'video' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">URL Embed Video / YouTube</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/embed/..."
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>

                    {/* Quick Preset Videos */}
                    <div className="flex flex-wrap gap-2">
                      {PRESET_VIDEO_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setMediaUrl(tmpl.url);
                            setMediaCaption(tmpl.caption);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            mediaUrl === tmpl.url
                              ? 'border-rose-600 bg-rose-50 text-rose-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          ▶ {tmpl.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Keterangan Video (Caption)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Video panduan mendampingi santri murojaah di rumah"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CALL TO ACTION BUTTON (CTA) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasActionBtn}
                      onChange={(e) => setHasActionBtn(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-[#164C68]"
                    />
                    <span>Sertakan Tombol Aksi (CTA Button)</span>
                  </label>
                  {hasActionBtn && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                      Aktif
                    </span>
                  )}
                </div>

                {hasActionBtn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Teks Tombol Aksi</label>
                      <input
                        type="text"
                        placeholder="Contoh: Mulai Belajar, Coba Sekarang"
                        value={actionLabel}
                        onChange={(e) => setActionLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Target Modul / Halaman</label>
                      <select
                        value={actionTarget}
                        onChange={(e) => setActionTarget(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                      >
                        <option value="mufrodat">Modul Mufrodat Bahasa Al-Qur'an</option>
                        <option value="iqra">Modul Iqra & AI Tajwid</option>
                        <option value="tahfiz">Ruang Murojaah & Setoran</option>
                        <option value="ibadah">Pusat Doa & Ibadah Harian</option>
                        <option value="pro">Upgrade Langganan Pro</option>
                        <option value="akun">Pengaturan Akun & 2FA</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* OPSI PUSH NOTIFICATION */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <Bell size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-950 block">
                      Kirim Sebagai Push Notification Perangkat
                    </span>
                    <span className="text-[11px] text-amber-800/80 font-medium">
                      Memunculkan notifikasi banner di ponsel/browser santri & wali santri
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendAsPush}
                  onChange={(e) => setSendAsPush(e.target.checked)}
                  className="w-5 h-5 rounded-md text-amber-600 cursor-pointer"
                />
              </div>

              {/* TOMBOL PUBLIKASIKAN */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#164C68] hover:bg-[#1E5D7B] text-white font-black text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Send size={16} />
                  <span>Publikasikan Broadcast Sekarang</span>
                </button>
              </div>
            </form>
          </div>

          {/* LIVE MOBILE & CARD PREVIEW */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Eye size={14} className="text-[#164C68]" />
                <span>Pratinjau Tampilan Pengguna (Live Preview)</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Mobile Card Simulation</span>
            </div>

            {/* CARD MOCKUP */}
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-linear-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-slate-950 font-black text-xs">
                    CT
                  </div>
                  <span className="text-xs font-black tracking-wide">Cahaya Tahfiz App</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Baru saja</span>
              </div>

              {/* Card Container */}
              <div className="bg-slate-800/90 rounded-2xl overflow-hidden border border-slate-700/80 shadow-md">
                {/* Media Preview */}
                {mediaType === 'image' && mediaUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={mediaUrl}
                      alt={mediaCaption || 'Preview'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = PRESET_IMAGE_TEMPLATES[0].url;
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-black border border-amber-400/30">
                        {badge || 'Fitur Baru'}
                      </span>
                    </div>
                  </div>
                )}

                {mediaType === 'video' && mediaUrl && (
                  <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center mb-2 shadow-lg">
                      <Play size={20} className="ml-1" />
                    </div>
                    <span className="text-xs font-black text-white">{mediaCaption || 'Video Edukasi'}</span>
                    <span className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">{mediaUrl}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#164C68] text-teal-200 text-[10px] font-black uppercase">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Untuk: {audience === 'all' ? 'Semua Santri & Wali' : audience}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white leading-snug">
                    {title || 'Judul Pengumuman Preview...'}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {content || 'Isi deskripsi pengumuman akan tampil di sini dengan tata letak yang menarik dan ramah pengguna...'}
                  </p>

                  {/* CTA Button Preview */}
                  {hasActionBtn && (
                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>{actionLabel || 'Coba Sekarang'}</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Push Banner Mockup if enabled */}
              {sendAsPush && (
                <div className="p-3 rounded-2xl bg-slate-800 border border-amber-400/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-300">Push Notification</span>
                      <span className="text-[9px] text-slate-400">Ponsel Santri</span>
                    </div>
                    <p className="text-[11px] font-bold text-white truncate">{title || 'Judul notifikasi'}</p>
                    <p className="text-[10px] text-slate-300 truncate">{content || 'Isi singkat push...'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAFTAR RIWAYAT BROADCAST & PENGUMUMAN AKTIF                            */}
      {/* ========================================================================= */}
      {subTab === 'broadcasts' && !isCreating && (
        <div className="space-y-4">
          {/* FILTER TOOLBAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={15} className="text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
              >
                <option value="all">Semua Kategori</option>
                <option value="feature_update">Fitur Baru</option>
                <option value="important_announcement">Pengumuman Penting</option>
                <option value="materi_tilawah">Materi Tilawah</option>
                <option value="kajian_event">Kajian & Webinar</option>
                <option value="daily_encouragement">Penyemangat Harian</option>
              </select>

              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
              >
                <option value="all">Semua Sasaran</option>
                <option value="wali_santri">Wali Santri</option>
                <option value="santri_aktif">Santri Aktif</option>
                <option value="pro_users">Pengguna Pro</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan <strong className="text-slate-900">{filteredBroadcasts.length}</strong> broadcast
              </span>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#164C68] hover:bg-[#1E5D7B] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Buat Baru</span>
              </button>
            </div>
          </div>

          {/* LIST ITEMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBroadcasts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Media Thumbnail */}
                {item.mediaType === 'image' && item.mediaUrl && (
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = PRESET_IMAGE_TEMPLATES[0].url;
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black">
                        {item.badge || 'Broadcast'}
                      </span>
                    </div>
                  </div>
                )}

                {item.mediaType === 'video' && item.mediaUrl && (
                  <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center mb-1 shadow-md">
                      <Play size={18} className="ml-0.5" />
                    </div>
                    <span className="text-[11px] font-black text-white">{item.mediaCaption || 'Video Panduan'}</span>
                  </div>
                )}

                {item.mediaType === 'none' && (
                  <div className="p-4 bg-linear-to-r from-teal-50 to-emerald-50 border-b border-teal-100 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white text-teal-800 text-[10px] font-black border border-teal-200">
                      {item.badge || 'Pengumuman Teks'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}

                {/* Content details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {item.audience === 'all' ? 'Semua Pengguna' : item.audience}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* Metrics and Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {item.impressionsCount || 0} Dilihat
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} /> {item.clicksCount || 0} Klik
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleResendBroadcastPush(item)}
                        title="Kirim Ulang Push Notification"
                        className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Bell size={13} />
                        <span>Push Ulang</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBroadcast(item.id, item.title)}
                        title="Hapus Broadcast"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: KALIMAT PENGINGAT PENYEMANGAT HARIAN (PUSH NOTIFICATION)       */}
      {/* ========================================================================= */}
      {subTab === 'daily_encouragement' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* TOP CONTROLS & GENERATOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SENDER BOX */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Kirim Push Notifikasi Penyemangat Santri & Wali
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kirimkan kalimat mutiara Al-Qur'an dan hadits nabawi penguat niat istiqomah
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  Live Dispatcher
                </span>
              </div>

              {/* TARGET AUDIENCE & TIME SLOT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Sasaran Notifikasi</label>
                  <select
                    value={targetAudiencePush}
                    onChange={(e) => setTargetAudiencePush(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs"
                  >
                    <option value="all">👥 Seluruh Santri & Wali Santri</option>
                    <option value="wali_santri">👨‍👩‍👧 Khusus Ayah & Bunda (Wali)</option>
                    <option value="santri_aktif">⭐ Santri Aktif Mengaji</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Waktu Rekomendasi</label>
                  <div className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-700" />
                      <span>{activeQuote.recommendedTime} WIB ({activeQuote.tagLabel})</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-black">
                      Otomatis
                    </span>
                  </div>
                </div>
              </div>

              {/* SELECTED QUOTE PREVIEW */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-teal-800 text-white text-[10px] font-black">
                    {activeQuote.source}
                  </span>
                  <span className="text-xs font-bold text-teal-900">{activeQuote.tagLabel}</span>
                </div>

                {activeQuote.arabicText && (
                  <p className="text-right font-serif text-lg text-slate-800 leading-loose tracking-wide pt-1">
                    {activeQuote.arabicText}
                  </p>
                )}

                <p className="text-xs text-slate-700 italic border-l-2 border-teal-600 pl-3">
                  "{activeQuote.translationIndo}"
                </p>
              </div>

              {/* CUSTOMIZABLE MOTIVATION MESSAGE */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Kalimat Pengingat & Penyemangat (Dapat Disesuaikan Hari Ini):</span>
                  <span className="text-[10px] text-slate-400 font-medium">Muncul di banner notifikasi ponsel</span>
                </label>
                <textarea
                  rows={3}
                  value={customQuoteText}
                  onChange={(e) => setCustomQuoteText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:bg-white resize-none leading-relaxed"
                />
              </div>

              {/* DISPATCH BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Volume2 size={16} className="text-emerald-700" />
                  <span>Disertai audio chime adzan/notifikasi islami merdu</span>
                </div>

                <button
                  type="button"
                  onClick={handleSendDailyPush}
                  disabled={isSendingPush}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSendingPush ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Mengirimkan Push...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Kirim Push Notification Sekarang 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SMARTPHONE LOCKSCREEN MOCKUP */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-emerald-700" />
                  <span>Simulasi Layar Kunci Smartphone Santri</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">Lockscreen Preview</span>
              </div>

              {/* PHONE FRAME */}
              <div className="relative mx-auto max-w-[320px] rounded-[40px] bg-slate-950 p-3.5 shadow-2xl border-4 border-slate-800 text-white">
                {/* Dynamic Island / Notch */}
                <div className="w-24 h-4 bg-black rounded-full mx-auto mb-4" />

                {/* Clock & Date Header */}
                <div className="text-center space-y-1 mb-8">
                  <span className="text-[11px] font-medium text-slate-300 block">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                  <span className="text-5xl font-light tracking-tight text-white block">
                    {activeQuote.recommendedTime}
                  </span>
                </div>

                {/* NOTIFICATION CARD IN LOCKSCREEN */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-linear-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-slate-950 font-black text-[9px]">
                        CT
                      </div>
                      <span className="text-[10px] font-black uppercase text-teal-200">CAHAYA TAHFIZ</span>
                    </div>
                    <span className="text-[9px] text-slate-300">Baru saja</span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-white leading-tight">
                      ⭐ Semangat Murojaah Hari Ini ({activeQuote.tagLabel})
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-snug line-clamp-3">
                      {customQuoteText || activeQuote.encouragementMessage}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-teal-300 font-bold">
                    <span>Sentuh untuk buka Al-Qur'an</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Bottom lockscreen buttons */}
                <div className="mt-12 flex items-center justify-between px-4 pb-2">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    🔦
                  </div>
                  <div className="w-16 h-1 bg-white/40 rounded-full" />
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    📷
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BANK KALIMAT MUTIARA & HADITS PENYEMANGAT */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-[#164C68]" />
                  <span>Bank Hadits & Kata Mutiara Penyemangat Murojaah ({dailyQuotes.length} Pilihan)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Pilih salah satu hadits shahih di bawah ini untuk langsung dijadikan push notification harian
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'Semua Kategori' },
                  { id: 'subuh_semangat', label: '🌅 Waktu Subuh' },
                  { id: 'murojaah_sore', label: '☀️ Murojaah Sore' },
                  { id: 'wali_kebanggaan', label: '🌙 Apresiasi Wali' },
                  { id: 'adab_santri', label: '🌿 Adab & Akhlak' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setQuoteCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                      quoteCategoryFilter === cat.id
                        ? 'bg-[#164C68] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QUOTES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuotes.map((q) => {
                const isSelected = selectedQuoteId === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuoteId(q.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black">
                          {q.tagLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{q.source}</span>
                      </div>

                      {q.arabicText && (
                        <p className="text-right font-serif text-base text-slate-800 leading-relaxed">
                          {q.arabicText}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 italic">
                        "{q.translationIndo}"
                      </p>

                      <div className="p-3 rounded-2xl bg-white border border-slate-100 text-xs font-medium text-slate-800 leading-relaxed shadow-2xs">
                        {q.encouragementMessage}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> Jam {q.recommendedTime} WIB
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuoteId(q.id);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ Terpilih' : 'Gunakan Quote Ini'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
