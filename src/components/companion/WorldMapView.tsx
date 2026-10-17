import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Gamepad2,
  Home,
  BookOpen,
  Sparkles,
  Lock,
  ChevronRight,
  Star,
  CheckCircle2,
  Heart,
  Volume2,
  ArrowLeft,
  X,
  Map as MapIcon,
  LayoutList,
  Trophy,
} from 'lucide-react';
import { ChildProfile, UserAccount } from '../../types';
import {
  CompanionData,
  WorldLand,
  RoomDecoration,
  SurahKnowledgeCard,
} from '../../types/companion';
import {
  WORLD_LANDS,
  COMPANION_STAGES,
  ROOM_DECORATIONS,
  SURAH_KNOWLEDGE_CARDS,
  getStageForXp,
} from '../../data/companionData';
import { CompanionService } from '../../services/companionService';
import { ACHIEVEMENTS_CATALOG } from '../../data/levelsAndAchievements';
import { StorageService } from '../../services/storageService';
import { AdventureTrailMap } from './AdventureTrailMap';
import { CompanionSprite } from './CompanionSprite';
import {
  PrayerRugVisual,
  BloomingTreeVisual,
  LanternVisual,
  TelescopeVisual,
  QuranBookVisual,
} from './ObjectVisuals';
import { CardShareButton } from '../common/CardShareButton';
import { ShareModal, SharePayload } from '../common/ShareModal';
import { LeaderboardAndActivityView } from '../game/LeaderboardAndActivityView';

const renderDecorationVisual = (id: string, fallbackIcon: string, size = 42) => {
  if (id === 'carpet-bintang') return <PrayerRugVisual size={size} />;
  if (id === 'tanaman-cahaya') return <BloomingTreeVisual size={size} />;
  if (id === 'lampu-kubah') return <LanternVisual size={size} />;
  if (id === 'teropong-bintang') return <TelescopeVisual size={size} />;
  if (id === 'kitab-mushaf') return <QuranBookVisual size={size} />;
  return <span className="text-3xl">{fallbackIcon}</span>;
};

interface WorldMapViewProps {
  child: ChildProfile;
  companion: CompanionData;
  initialTab?: 'map' | 'games' | 'room' | 'collection' | 'leaderboard';
  onNavigateToLand: (tab: 'tahfiz' | 'alquran', subView?: string) => void;
  onRefreshCompanion: () => void;
  // Mini-game launcher
  onLaunchMiniGame: (gameId: string) => void;
  userAccount?: UserAccount;
  onOpenUpgradeModal?: () => void;
  onOpenStarShop?: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  child,
  companion,
  initialTab = 'map',
  onNavigateToLand,
  onRefreshCompanion,
  onLaunchMiniGame,
  userAccount,
  onOpenUpgradeModal,
  onOpenStarShop,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'map' | 'games' | 'room' | 'collection' | 'leaderboard'>(initialTab);
  const [selectedLand, setSelectedLand] = useState<WorldLand | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'tahfiz' | 'alquran'>('all');
  const [mapViewMode, setMapViewMode] = useState<'trail' | 'cards'>('trail');
  const [collectionSubTab, setCollectionSubTab] = useState<'stages' | 'cards' | 'badges' | 'plants'>('stages');
  const [roomActionNotice, setRoomActionNotice] = useState<string | null>(null);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [lockedGamePrompt, setLockedGamePrompt] = useState<{ title: string; desc: string } | null>(null);

  const currentUserAccount = userAccount || StorageService.getUserAccount();
  const accountTier = StorageService.getAccountTier(currentUserAccount);
  const isPro = accountTier === 'pro';

  const handleShareCard = (payload: SharePayload, e: React.MouseEvent) => {
    e.stopPropagation();
    setSharePayload(payload);
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  const stageConfig = getStageForXp(companion.xp);

  // Handle purchasing/placing room decorations
  const handleToggleRoomItem = (itemId: string) => {
    const res = CompanionService.buyRoomDecoration(child.id, itemId);
    setRoomActionNotice(res.message);
    onRefreshCompanion();
    setTimeout(() => setRoomActionNotice(null), 3000);
  };

  const handlePetLumi = () => {
    const res = CompanionService.petCompanion(child.id);
    setRoomActionNotice(res.message);
    onRefreshCompanion();
    setTimeout(() => setRoomActionNotice(null), 2500);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 5-Tab Main Navigation Header */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-1.5 shadow-xs grid grid-cols-5 gap-1 text-center">
        <button
          onClick={() => setActiveMainTab('map')}
          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeMainTab === 'map'
              ? 'bg-[#08B9EF] text-white shadow-sm'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Compass size={18} />
          <span className="text-[10px] sm:text-[11px] font-heading truncate">Peta Dunia</span>
        </button>

        <button
          onClick={() => setActiveMainTab('games')}
          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeMainTab === 'games'
              ? 'bg-[#FF946F] text-white shadow-sm'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Gamepad2 size={18} />
          <span className="text-[10px] sm:text-[11px] font-heading truncate">Arena Game</span>
        </button>

        <button
          onClick={() => setActiveMainTab('leaderboard')}
          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeMainTab === 'leaderboard'
              ? 'bg-[#FFD83E] text-amber-950 shadow-sm'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Trophy size={18} />
          <span className="text-[10px] sm:text-[11px] font-heading truncate">Peringkat</span>
        </button>

        <button
          onClick={() => setActiveMainTab('room')}
          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeMainTab === 'room'
              ? 'bg-[#B797F6] text-white shadow-sm'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Home size={18} />
          <span className="text-[10px] sm:text-[11px] font-heading truncate">Kamar</span>
        </button>

        <button
          onClick={() => setActiveMainTab('collection')}
          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeMainTab === 'collection'
              ? 'bg-[#81E850] text-[#164C68] shadow-sm'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-[10px] sm:text-[11px] font-heading truncate">Koleksi</span>
        </button>
      </div>

      {/* --- TAB 1: PETA DUNIA (WORLD MAP ADVENTURE) --- */}
      {activeMainTab === 'map' && (
        <motion.div
          key="tab-map"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* World Header Banner */}
          <div className="bg-gradient-to-r from-[#164C68] via-[#0e638b] to-[#08B9EF] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-cyan-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span>🗺️</span> Peta Petualangan Cahaya
                </span>
                <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-black">
                  Level {child.level}
                </span>
              </div>
              <h2 className="text-xl font-black font-heading tracking-tight">
                Peta Petualangan Al-Qur'an
              </h2>
              <p className="text-xs text-cyan-100 font-medium leading-relaxed max-w-md">
                Jelajahi setiap wilayah belajar untuk memperkuat hafalanmu bersama Lumi!
              </p>

              {/* Progress Bar of Unlocked Lands */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-cyan-100 font-bold mb-1">
                  <span>
                    Wilayah Terbuka:{' '}
                    {WORLD_LANDS.filter((l) => child.level >= l.levelRequired).length} dari{' '}
                    {WORLD_LANDS.length}
                  </span>
                  <span>{companion.xp} XP</span>
                </div>
                <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-[#81E850] h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.round((WORLD_LANDS.filter((l) => child.level >= l.levelRequired).length / WORLD_LANDS.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* View Mode Toggle: Interactive Trail vs Directory */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setMapViewMode('trail')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapViewMode === 'trail'
                      ? 'bg-[#FFD83E] text-[#164C68] shadow-sm font-black'
                      : 'bg-white/15 text-white hover:bg-white/25 font-semibold'
                  }`}
                >
                  <MapIcon size={14} />
                  <span>Jalur Petualangan (Game)</span>
                </button>
                <button
                  onClick={() => setMapViewMode('cards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapViewMode === 'cards'
                      ? 'bg-[#FFD83E] text-[#164C68] shadow-sm font-black'
                      : 'bg-white/15 text-white hover:bg-white/25 font-semibold'
                  }`}
                >
                  <LayoutList size={14} />
                  <span>Daftar Wilayah</span>
                </button>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 pointer-events-none">
              🏰
            </div>
          </div>

          {/* Interactive Game Trail with Framer-Motion Animated Lumi Movement */}
          {mapViewMode === 'trail' && (
            <motion.div
              key="view-trail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <AdventureTrailMap
                child={child}
                companion={companion}
                onNavigateToLand={onNavigateToLand}
                onSelectLandModal={(land) => setSelectedLand(land)}
              />
            </motion.div>
          )}

          {/* Directory Cards View */}
          {mapViewMode === 'cards' && (
            <motion.div
              key="view-cards"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Clean Category Filters */}
              <div className="flex gap-1.5 bg-white border border-[#C9E1ED] p-1.5 rounded-2xl shadow-xs overflow-x-auto">
                {[
                  { id: 'all', label: 'Semua Wilayah (10)' },
                  { id: 'tahfiz', label: 'Tahfiz & Hafalan' },
                  { id: 'alquran', label: "Ilmu Al-Qur'an" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setMapFilter(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      mapFilter === cat.id
                        ? 'bg-[#08B9EF] text-white shadow-xs'
                        : 'text-[#8C9BA7] hover:text-[#164C68]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Beautiful, Organized Adventure Cards */}
              <div className="space-y-3">
                {WORLD_LANDS.filter((land) => {
                  if (mapFilter === 'tahfiz') return land.destinationTab === 'tahfiz';
                  if (mapFilter === 'alquran') return land.destinationTab === 'alquran';
                  return true;
                }).map((land, idx) => {
                  const isLocked = child.level < land.levelRequired;

                  return (
                    <motion.div
                      key={land.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setSelectedLand(land)}
                      className={`bg-white border-2 rounded-3xl p-4.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative group select-none ${
                        isLocked
                          ? 'border-slate-200 bg-slate-50/70 opacity-70'
                          : 'border-[#C9E1ED] hover:border-[#08B9EF]'
                      }`}
                    >
                      {/* Card Share Button */}
                      <CardShareButton
                        onShare={(e) =>
                          handleShareCard(
                            {
                              title: `Jelajahi Wilayah ${land.name} di Cahaya Tahfiz`,
                              text: `${land.tagline} • ${land.description}`,
                              category: "Peta Petualangan Tahfiz",
                              badge: `Wilayah #${idx + 1}`,
                            },
                            e
                          )
                        }
                        title={`Bagikan Wilayah ${land.name}`}
                      />

                      <div className="flex items-start gap-4">
                        {/* Glowing Emblemed Avatar */}
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${land.color} text-white flex items-center justify-center text-3xl shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {isLocked ? '🔒' : land.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#EEF8FF] text-[#08B9EF]">
                                Wilayah #{idx + 1}
                              </span>
                              {isLocked ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                  Perlu Lv. {land.levelRequired}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Terbuka
                                </span>
                              )}
                            </div>
                            <span className="font-quran text-base text-[#08B9EF] font-bold">
                              {land.arabicName}
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
                            {land.name}
                          </h3>

                          <p className="text-xs text-[#08B9EF] font-bold">
                            {land.tagline}
                          </p>

                          <p className="text-[11px] text-[#8C9BA7] font-medium leading-relaxed pt-0.5">
                            {land.description}
                          </p>

                          {/* Card Bottom CTA */}
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-[#8C9BA7]">
                              Tujuan: {land.destinationTab === 'tahfiz' ? 'Tahfiz' : "Al-Qur'an"} •{' '}
                              {land.destinationSubView}
                            </span>
                            <span className="text-xs font-black text-[#08B9EF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              {isLocked ? 'Lihat Syarat' : 'Masuk Wilayah'}{' '}
                              <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* --- TAB 2: ARENA GAME (MINI-GAMES DIRECT ACCESS) --- */}
      {activeMainTab === 'games' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-orange-100 font-bold uppercase tracking-wider">
                Taman Bermain Santri
              </span>
              <h2 className="text-xl font-black font-heading tracking-tight mt-0.5">
                8 Arena Mini-Game Al-Qur'an
              </h2>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                Kuis ceria tanpa tekanan dengan materi Al-Qur'an terverifikasi!
              </p>

              {/* Status Access Badge */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isPro
                      ? 'bg-amber-300 text-amber-950 border-amber-200'
                      : 'bg-white/20 text-white border-white/30'
                  }`}
                >
                  {isPro
                    ? '👑 Status: PRO AKTIF (Semua 8 Game Terbuka)'
                    : 'Status: Paket FREE (4 Terbuka • 4 Khusus PRO)'}
                </span>

                {!isPro && onOpenUpgradeModal && (
                  <button
                    onClick={onOpenUpgradeModal}
                    className="text-[10px] font-black bg-white hover:bg-orange-50 text-orange-950 px-3 py-0.5 rounded-full shadow-xs cursor-pointer transition-colors"
                  >
                    Buka Semua dengan PRO 👑
                  </button>
                )}
              </div>
            </div>

            <div className="text-4xl p-2 bg-white/20 rounded-2xl backdrop-blur-xs self-start sm:self-auto">
              🎮
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                id: 'santri_duel',
                title: 'Duel Kuis Santri ⚔️',
                isProOnly: false,
                defaultTag: 'LOBBY & REAL-TIME ⚔️',
                desc: 'Adu kecerdasan sambung ayat, tajwid & surah 1 vs 1 dengan HP Bar & Room Code!',
                icon: '⚔️',
                badgeBg: 'bg-rose-600',
                bannerGradient: 'from-rose-600 via-red-600 to-amber-500',
                illustration: '⚡ ⚔️ 🏆',
              },
              {
                id: 'voice_stt',
                title: 'Setoran Suara AI (Voice STT) 🎙️',
                isProOnly: false,
                defaultTag: 'AI TERBIMBING 🎙️',
                desc: 'Uji lafal tajwid mandiri dengan teknologi Speech-to-Text cerdas dan skor otomatis!',
                icon: '🎙️',
                badgeBg: 'bg-cyan-600',
                bannerGradient: 'from-cyan-600 via-teal-600 to-sky-700',
                illustration: '🎙️ 🌟 📖',
              },
              {
                id: 'continue_ayah',
                title: 'Sambung Ayat',
                isProOnly: true,
                defaultTag: 'PVP ONLINE',
                desc: 'Duel sambung ayat Al-Qur\'an seru melawan waktu dan teman!',
                icon: '🔗',
                badgeBg: 'bg-rose-500',
                bannerGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
                illustration: '⚔️ 📖',
              },
              {
                id: 'arrange_ayah',
                title: 'Susun Ayat',
                isProOnly: false,
                defaultTag: 'PEMAIN TUNGGAL',
                desc: 'Ketik & urutkan kata menjadi ayat yang tepat sebelum waktu habis!',
                icon: '🧩',
                badgeBg: 'bg-sky-600',
                bannerGradient: 'from-cyan-600 via-sky-600 to-indigo-700',
                illustration: '🚀 ✨',
              },
              {
                id: 'missing_word',
                title: 'Hujan Kata',
                isProOnly: false,
                defaultTag: 'PEMAIN TUNGGAL',
                desc: 'Baca arti lafaz yang jatuh, ingat kata Arabnya lalu ketik tepat!',
                icon: '🔍',
                badgeBg: 'bg-emerald-600',
                bannerGradient: 'from-teal-600 via-emerald-600 to-cyan-700',
                illustration: '🌧️ ⛵',
              },
              {
                id: 'hijaiyah_sound',
                title: 'Lebah Ejaan',
                isProOnly: false,
                defaultTag: 'PEMAIN TUNGGAL',
                desc: 'Dengar pelafalan makhraj qari dan ketik kata dengan ejaan sempurna.',
                icon: '🎧',
                badgeBg: 'bg-amber-600',
                bannerGradient: 'from-amber-500 via-yellow-500 to-orange-600',
                illustration: '🐝 🍯',
              },
              {
                id: 'arabic_matching',
                title: 'Cocokkan Kata & Arti',
                isProOnly: true,
                defaultTag: 'BARU',
                desc: 'Pasangkan kartu kata Arab dengan terjemahannya secara cepat.',
                icon: '🎯',
                badgeBg: 'bg-purple-600',
                bannerGradient: 'from-purple-600 via-pink-600 to-indigo-600',
                illustration: '🍎 🍉',
              },
              {
                id: 'tajwid_class',
                title: 'Klasifikasi Tajwid',
                isProOnly: true,
                defaultTag: 'TANTANGAN',
                desc: 'Kelompokkan hukum nun sukun, idgham, dan makhraj ke keranjang yang tepat.',
                icon: '🏷️',
                badgeBg: 'bg-teal-600',
                bannerGradient: 'from-emerald-500 via-teal-600 to-sky-700',
                illustration: '🌉 🕊️',
              },
              {
                id: 'guess_surah',
                title: 'Detektif Surah',
                isProOnly: true,
                defaultTag: 'BARU',
                desc: 'Buka petunjuk rahasia dan tebak nama surah Al-Qur\'an.',
                icon: '💡',
                badgeBg: 'bg-blue-600',
                bannerGradient: 'from-blue-600 via-indigo-600 to-purple-700',
                illustration: '🔍 📜',
              },
              {
                id: 'audio_to_ayah',
                title: 'Dengar & Pilih Ayat',
                isProOnly: false,
                defaultTag: 'PEMAIN TUNGGAL',
                desc: 'Simak tartil merdu Syaikh qari lalu pilih ayat yang sedang dibaca.',
                icon: '🎵',
                badgeBg: 'bg-pink-600',
                bannerGradient: 'from-rose-500 via-pink-500 to-purple-600',
                illustration: '🎧 🌟',
              },
            ].map((game) => {
              const isGameLocked = !StorageService.isGameUnlocked(game.id, accountTier);

              return (
                <div
                  key={game.id}
                  onClick={() => {
                    if (isGameLocked) {
                      setLockedGamePrompt({
                        title: game.title,
                        desc: game.desc,
                      });
                    } else {
                      onLaunchMiniGame(game.id);
                    }
                  }}
                  className={`bg-white border-2 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group select-none relative ${
                    isGameLocked
                      ? 'border-amber-300 hover:border-amber-400'
                      : 'border-[#C9E1ED] hover:border-[#08B9EF]'
                  }`}
                >
                  {/* 1. Card Banner Image / Illustration */}
                  <div
                    className={`w-full h-28 sm:h-32 bg-gradient-to-br ${game.bannerGradient} relative p-3 flex flex-col justify-between overflow-hidden`}
                  >
                    {/* Subtle Background Pattern & Glow */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/15 rounded-full blur-md pointer-events-none" />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                    {/* LOCK OVERLAY IF GAME IS LOCKED */}
                    {isGameLocked && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-15 flex flex-col items-center justify-center text-white text-center p-2 animate-in fade-in">
                        <div className="w-8 h-8 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-md mb-1">
                          <Lock size={16} />
                        </div>
                        <span className="text-[11px] font-black text-amber-300 tracking-wide">
                          Khusus Paket PRO 👑
                        </span>
                        <span className="text-[9px] text-slate-300">Ketuk untuk Buka</span>
                      </div>
                    )}

                    {/* Top Row: Mode Tag & Share Button */}
                    <div className="flex items-center justify-between relative z-10">
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase ${
                          isGameLocked
                            ? 'bg-amber-500 text-white'
                            : game.isProOnly && isPro
                            ? 'bg-amber-400 text-amber-950 font-black'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isGameLocked
                          ? '👑 KHUSUS PRO'
                          : game.isProOnly && isPro
                          ? '✨ PRO AKTIF'
                          : '✓ GRATIS'}
                      </span>

                      {/* Image Card Share Button */}
                      <CardShareButton
                        onShare={(e) =>
                          handleShareCard(
                            {
                              title: `Main Game ${game.title} di Cahaya Tahfiz!`,
                              text: `${game.desc} Mari belajar Al-Qur'an dengan cara menyenangkan bersama keluarga.`,
                              category: "Arena Game Al-Qur'an",
                              badge: game.defaultTag,
                            },
                            e
                          )
                        }
                        title={`Bagikan Game ${game.title}`}
                      />
                    </div>

                    {/* Center Illustration Sprites */}
                    <div className="flex items-center justify-center relative z-10 text-3xl sm:text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                      <span>{game.illustration}</span>
                    </div>

                    {/* Bottom subtle indicator */}
                    <div className="text-[10px] text-white/80 font-bold flex items-center gap-1 relative z-10">
                      <span>{game.icon}</span>
                      <span>Arena Edukasi</span>
                    </div>
                  </div>

                  {/* 2. Card Content & Action Button */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors leading-tight">
                          {game.title}
                        </h3>
                        {isGameLocked && <Lock size={12} className="text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-[#8C9BA7] font-medium mt-1 line-clamp-2 leading-relaxed">
                        {game.desc}
                      </p>
                    </div>

                    {/* Action Button styled according to Locked vs Free */}
                    <div className="pt-1">
                      {isGameLocked ? (
                        <div className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                          <Lock size={13} />
                          <span>BUKA DENGAN PRO</span>
                        </div>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-2xl bg-[#08B9EF] group-hover:bg-[#069bc9] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                          <span>MAIN SEKARANG</span>
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: PAPAN PERINGKAT & AKTIVITAS LIVE --- */}
      {activeMainTab === 'leaderboard' && (
        <div className="animate-in fade-in space-y-4">
          <LeaderboardAndActivityView
            childId={child.id}
            onOpenGame={(gameId) => {
              if (!StorageService.isGameUnlocked(gameId, accountTier)) {
                setLockedGamePrompt({
                  title: 'Arena Game Terkunci',
                  desc: accountTier === 'guest'
                    ? 'Game ini membutuhkan akun terdaftar. Yuk daftar gratis via Gmail atau WhatsApp!'
                    : 'Game ini memerlukan paket Cahaya Tahfiz PRO aktif.',
                });
              } else {
                onLaunchMiniGame(gameId);
              }
            }}
          />
        </div>
      )}

      {/* --- TAB 3: KAMAR LUMI (COMPANION ROOM & DECORATOR) --- */}
      {activeMainTab === 'room' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Room Visual Canvas */}
          <div className="bg-gradient-to-b from-indigo-100 via-sky-100 to-cyan-50 border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-sm relative overflow-hidden min-h-[220px] flex flex-col justify-between text-center">
            {/* Placed Room Furniture Floating Sprites */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-2 relative z-10">
              {companion.roomItems.map((itemId) => {
                const dec = ROOM_DECORATIONS.find((d) => d.id === itemId);
                if (!dec) return null;
                return (
                  <div
                    key={itemId}
                    className="p-2 bg-white/90 backdrop-blur-xs rounded-2xl border border-white shadow-xs animate-in zoom-in-50 flex items-center justify-center"
                    title={dec.name}
                  >
                    {renderDecorationVisual(dec.id, dec.icon, 44)}
                  </div>
                );
              })}
            </div>

            {/* Central Companion Avatar in the Room */}
            <div
              onClick={handlePetLumi}
              className="my-3 flex flex-col items-center justify-center cursor-pointer select-none relative z-10 group"
              title="Sentuh untuk menyapa Lumi!"
            >
              <div className="group-hover:scale-105 active:scale-95 transition-transform filter drop-shadow-lg flex items-center justify-center">
                <CompanionSprite
                  species={companion.species || 'lumi'}
                  stage={stageConfig.id}
                  mood={companion.mood || 'content'}
                  size={135}
                />
              </div>
              <h3 className="text-base font-black text-[#164C68] font-heading mt-2">
                {companion.name} ({stageConfig.name})
              </h3>
              <p className="text-xs text-[#08B9EF] font-bold">
                Tingkat {companion.level} • {companion.xp} XP
              </p>
            </div>

            {/* Bottom Status / Dialogue */}
            <div className="bg-white/90 backdrop-blur-xs border border-[#C9E1ED] rounded-2xl p-2.5 text-xs text-[#164C68] font-semibold relative z-10">
              "{companion.dialogueMessage || 'Kamar ini terasa nyaman dan hangat berkat lantunan ayatmu!'}"
            </div>
          </div>

          {/* Action Feedback Notice */}
          {roomActionNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold text-center animate-in fade-in">
              {roomActionNotice}
            </div>
          )}

          {/* Companion Traits Growth Tree Breakdown */}
          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-2.5">
            <h4 className="text-xs font-black text-[#164C68] font-heading flex items-center justify-between">
              <span>CABANG KARAKTER LUMI (TRAITS)</span>
              <span className="text-[10px] text-[#8C9BA7] font-semibold">Tumbuh sesuai caramu belajar</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200">
                <span className="text-[11px] font-bold text-cyan-800 block">🌙 Hafiz Trait</span>
                <span className="text-xs font-black text-[#164C68]">Lv. {companion.traits.hafiz || 1}</span>
                <p className="text-[10px] text-cyan-700">Dari Dengar & Hafalan</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">🎵 Tartil Trait</span>
                <span className="text-xs font-black text-[#164C68]">Lv. {companion.traits.tartil || 1}</span>
                <p className="text-[10px] text-emerald-700">Dari Tajwid & Suara</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-800 block">📖 Reader Trait</span>
                <span className="text-xs font-black text-[#164C68]">Lv. {companion.traits.reader || 1}</span>
                <p className="text-[10px] text-blue-700">Dari Huruf Iqra</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 block">📚 Scholar Trait</span>
                <span className="text-xs font-black text-[#164C68]">Lv. {companion.traits.scholar || 1}</span>
                <p className="text-[10px] text-amber-700">Dari Bahasa & Kisah</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-purple-800 block">🌟 Explorer Trait</span>
                <span className="text-xs font-black text-[#164C68]">Lv. {companion.traits.explorer || 1}</span>
                <p className="text-[10px] text-purple-700">Dari Kuis & Arena Game</p>
              </div>
            </div>
          </div>

          {/* Room Decorator Catalog (Toko Dekorasi Kamar - Transparent, Zero Lootbox) */}
          <div className="bg-white border border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-[#164C68] font-heading">
                  Dekorasi Kamar Lumi
                </h4>
                <p className="text-[11px] text-[#8C9BA7] font-medium">
                  Buka perabot dengan bintang hasil belajar (Tanpa gacha / kotak acak)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onOpenStarShop && (
                  <button
                    onClick={onOpenStarShop}
                    className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 px-2.5 py-1 rounded-full text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <span>+ Beli Bintang</span>
                  </button>
                )}
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full text-xs font-black">
                  <Star size={14} className="fill-amber-400 text-amber-500" />
                  <span>{child.totalStars} ⭐</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROOM_DECORATIONS.map((dec) => {
                const isOwned = companion.unlockedItems.includes(dec.id);
                const isPlaced = companion.roomItems.includes(dec.id);

                return (
                  <div
                    key={dec.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isPlaced
                        ? 'bg-cyan-50/70 border-[#08B9EF]'
                        : isOwned
                        ? 'bg-[#EEF8FF]/50 border-[#C9E1ED]'
                        : 'bg-white border-[#C9E1ED]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {renderDecorationVisual(dec.id, dec.icon, 34)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#164C68]">{dec.name}</h5>
                        <p className="text-[10px] text-[#8C9BA7]">{dec.unlockRequirement}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRoomItem(dec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPlaced
                          ? 'bg-[#08B9EF] text-white shadow-xs'
                          : isOwned
                          ? 'bg-[#EEF8FF] text-[#08B9EF] border border-[#C9E1ED] hover:bg-cyan-100'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      {isPlaced ? 'Terpasang' : isOwned ? 'Pasang' : `${dec.costStars} ⭐ Beli`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: BUKU KOLEKSI (COLLECTION BOOK) --- */}
      {activeMainTab === 'collection' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Subtabs */}
          <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
            {[
              { id: 'stages', label: '🐾 Evolusi Lumi' },
              { id: 'cards', label: '🃏 Kartu Hikmah Surah' },
              { id: 'badges', label: '🏅 Lencana Prestasi' },
              { id: 'plants', label: '🌱 Kebun & Benih' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setCollectionSubTab(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  collectionSubTab === st.id
                    ? 'bg-[#08B9EF] text-white shadow-xs'
                    : 'text-[#8C9BA7] hover:text-[#164C68]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* 1. Stages Collection */}
          {collectionSubTab === 'stages' && (
            <div className="space-y-3">
              {COMPANION_STAGES.map((stage) => {
                const isUnlocked = companion.xp >= stage.minXp;
                const isCurrent = stage.id === stageConfig.id;

                return (
                  <div
                    key={stage.id}
                    className={`bg-white border-2 rounded-3xl p-4 shadow-xs transition-all flex items-center gap-3.5 relative group ${
                      isCurrent
                        ? 'border-[#08B9EF] ring-2 ring-cyan-200 bg-cyan-50/20'
                        : isUnlocked
                        ? 'border-[#C9E1ED]'
                        : 'border-slate-200 opacity-50 bg-slate-50'
                    }`}
                  >
                    {isUnlocked && (
                      <CardShareButton
                        onShare={(e) =>
                          handleShareCard(
                            {
                              title: `Tahap Evolusi Lumi: ${stage.name}`,
                              text: `"${stage.storyQuote}". Kemampuan: ${stage.unlockedAbility}`,
                              category: "Evolusi Sahabat Tahfiz",
                              badge: stage.name,
                            },
                            e
                          )
                        }
                        title={`Bagikan Tahap ${stage.name}`}
                      />
                    )}
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center text-3xl shrink-0">
                      {isUnlocked ? stage.avatarIcon : '🔒'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-[#164C68] font-heading">
                          {stage.name}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-[#08B9EF] text-white px-2 py-0.2 rounded-full">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#08B9EF] font-bold mt-0.5">{stage.subtitle}</p>
                      <p className="text-[11px] text-[#8C9BA7] font-medium mt-1 italic">
                        "{stage.storyQuote}"
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                        ✨ Kemampuan: {stage.unlockedAbility}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Surah Knowledge Cards */}
          {collectionSubTab === 'cards' && (
            <div className="space-y-3">
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3 text-xs text-[#164C68] font-medium">
                💡 <strong>Kartu Hikmah Surah:</strong> Terbuka otomatis seiring bertambahnya hafalan dan tilawah surahmu.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SURAH_KNOWLEDGE_CARDS.map((card) => {
                  const isUnlocked = companion.unlockedCards.includes(card.id);

                  return (
                    <div
                      key={card.id}
                      className={`bg-white border-2 rounded-3xl p-4 shadow-xs space-y-2 transition-all relative group ${
                        isUnlocked ? 'border-[#C9E1ED]' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      {isUnlocked && (
                        <CardShareButton
                          onShare={(e) =>
                            handleShareCard(
                              {
                                title: `Kartu Hikmah: Surah ${card.surahName}`,
                                text: `${card.badgeTitle}: "${card.keyWisdom}". Dipelajari di Cahaya Tahfiz.`,
                                category: "Koleksi Hikmah Surah",
                                badge: `Surah ${card.surahName}`,
                              },
                              e
                            )
                          }
                          title={`Bagikan Kartu ${card.surahName}`}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{card.icon}</span>
                          <div>
                            <h4 className="text-xs font-black text-[#164C68] font-heading">
                              Surah {card.surahName}
                            </h4>
                            <p className="text-[10px] text-[#8C9BA7]">
                              {card.ayahCount} Ayat • {card.revelationType}
                            </p>
                          </div>
                        </div>

                        <span className="font-quran text-lg text-[#08B9EF]">
                          {card.surahArabic}
                        </span>
                      </div>

                      <div className="bg-[#EEF8FF] rounded-xl p-2.5 text-[11px] text-[#164C68]">
                        <p className="font-bold text-[#08B9EF] mb-0.5">{card.badgeTitle}</p>
                        <p className="leading-relaxed">{card.keyWisdom}</p>
                      </div>

                      <p className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                        🌱 Hikmah: "{card.moralLesson}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Badges */}
          {collectionSubTab === 'badges' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ACHIEVEMENTS_CATALOG.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white border border-[#C9E1ED] rounded-2xl p-3 shadow-xs text-center space-y-1"
                >
                  <span className="text-3xl block py-1">{ach.icon}</span>
                  <h4 className="text-xs font-black text-[#164C68] font-heading">{ach.title}</h4>
                  <p className="text-[10px] text-[#8C9BA7] font-medium line-clamp-2">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 4. Plants & Seeds */}
          {collectionSubTab === 'plants' && (
            <div className="bg-white border border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#164C68] font-heading">
                  Benih Cahaya & Tanaman Belajar
                </h4>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {companion.seedsCount || 0} Benih Tersimpan
                </span>
              </div>
              <p className="text-xs text-[#8C9BA7] font-medium leading-relaxed">
                Setiap kali kamu menuntaskan hafalan atau membaca kisah Al-Qur'an, Lumi berkesempatan menemukan Benih Cahaya untuk ditanam di kebun belajarmu.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-3xl block">🌱</span>
                  <span className="text-xs font-bold text-[#164C68] mt-1 block">Tunas Ziarah</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-3xl block">🌷</span>
                  <span className="text-xs font-bold text-[#164C68] mt-1 block">Bunga Murojaah</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-3xl block">🌳</span>
                  <span className="text-xs font-bold text-[#164C68] mt-1 block">Pohon Penjaga</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Action Sheet Modal when tapping a World Land --- */}
      <AnimatePresence>
        {selectedLand && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-3"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#C9E1ED] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedLand.color} text-white flex items-center justify-center text-2xl shadow-xs`}
                >
                  {selectedLand.icon}
                </div>
                <button
                  onClick={() => setSelectedLand(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <span className="font-quran text-lg text-[#08B9EF] block">
                  {selectedLand.arabicName}
                </span>
                <h3 className="text-lg font-black text-[#164C68] font-heading mt-0.5">
                  {selectedLand.name}
                </h3>
                <p className="text-xs text-[#08B9EF] font-bold mt-0.5">
                  {selectedLand.tagline}
                </p>
                <p className="text-xs text-[#8C9BA7] font-medium mt-2 leading-relaxed">
                  {selectedLand.description}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  const destTab = selectedLand.destinationTab;
                  const destSub = selectedLand.destinationSubView;
                  setSelectedLand(null);
                  onNavigateToLand(destTab, destSub);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#08B9EF] to-[#07a6d7] text-white font-black text-xs shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 hover:bg-[#07a6d7] cursor-pointer"
              >
                <Compass size={16} />
                <span>Mulai Petualangan di Wilayah Ini</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked Game Prompt Modal */}
      <AnimatePresence>
        {lockedGamePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 space-y-4 text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 border-2 border-amber-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
                👑
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  Fitur Eksklusif Paket PRO
                </span>
                <h3 className="text-lg font-black text-[#164C68] font-heading mt-2">
                  Game {lockedGamePrompt.title} Masih Terkunci
                </h3>
                <p className="text-xs text-[#8C9BA7] font-medium mt-1 leading-relaxed">
                  {lockedGamePrompt.desc}
                </p>
              </div>

              {/* Benefits list */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5 text-slate-700">
                <span className="font-bold text-amber-900 block mb-1">
                  Keuntungan Cahaya Tahfiz PRO:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Buka seluruh 8 Arena Mini-Game & PVP Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Akses 30 Juz Mushaf & Analisis Suara AI Tartil</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Multi-Profil Anak & Laporan Kemajuan Mingguan</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setLockedGamePrompt(null);
                    onOpenUpgradeModal?.();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-amber-950 font-black text-xs shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-101"
                >
                  <Sparkles size={16} />
                  <span>Lihat Paket PRO & Buka Sekarang</span>
                </button>

                <button
                  onClick={() => setLockedGamePrompt(null)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer transition-colors"
                >
                  Coba Game Gratis Dulu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        payload={sharePayload}
      />
    </div>
  );
};
