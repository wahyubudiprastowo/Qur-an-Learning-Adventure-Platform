import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Users,
  Flame,
  ChevronDown,
  RefreshCw,
  Search,
  Swords,
  Crown,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Award,
  Star,
  CheckCircle2,
  Medal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  UserActivityItem,
  LeaderboardPlayerItem,
  DuelLeaderboardItem,
  DuelLiveMatch,
  DuelStats,
} from '../../data/leaderboardAndActivityData';
import { StorageService } from '../../services/storageService';
import { SoundEffects } from '../../services/soundEffects';

interface LeaderboardAndActivityViewProps {
  childId?: string;
  onOpenGame?: (gameId: string) => void;
}

export const LeaderboardAndActivityView: React.FC<LeaderboardAndActivityViewProps> = ({
  childId,
  onOpenGame,
}) => {
  const activeChild = StorageService.getActiveChild();
  const currentChildId = childId || activeChild?.id || 'child-default';

  // Subtab: 'duel_leaderboard' (Global Duel Kuis Real-Time) vs 'daily_activity' (Aktivitas Harian)
  const [activeTab, setActiveTab] = useState<'duel_leaderboard' | 'daily_activity'>('duel_leaderboard');

  // Duel Leaderboard State
  const [duelLeaderboard, setDuelLeaderboard] = useState<DuelLeaderboardItem[]>([]);
  const [playerRank, setPlayerRank] = useState<number>(4);
  const [weekTitle, setWeekTitle] = useState<string>('Liga Santri Nasional - Pekan Ini');
  const [resetsInDays, setResetsInDays] = useState<number>(3);
  const [resetsInHours, setResetsInHours] = useState<number>(8);
  const [isDuelLoading, setIsDuelLoading] = useState<boolean>(true);
  const [duelStats, setDuelStats] = useState<DuelStats>(() =>
    StorageService.getDuelStats(currentChildId)
  );

  // Live Matches Feed
  const [liveMatches, setLiveMatches] = useState<DuelLiveMatch[]>(() =>
    StorageService.getLiveDuelMatches()
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Daily Activity State
  const [activities, setActivities] = useState<UserActivityItem[]>(() =>
    StorageService.getRecentActivities()
  );
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardPlayerItem[]>(() =>
    StorageService.getLeaderboard()
  );
  const [visibleLeaderboardCount, setVisibleLeaderboardCount] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch Duel Leaderboard from Backend API with natural user bot calibration
  const fetchDuelLeaderboard = async (triggerFeedback = false) => {
    setIsDuelLoading(true);
    try {
      const stats = StorageService.getDuelStats(currentChildId);
      setDuelStats(stats);
      const childName = activeChild?.name || 'Santri Cilik';
      const childAvatar = activeChild?.avatar || '👦';
      const childScore = stats.duelScore;

      const res = await fetch(
        `/api/duel/leaderboard?playerName=${encodeURIComponent(childName)}&playerAvatar=${encodeURIComponent(
          childAvatar
        )}&score=${childScore}`
      );
      if (res.ok) {
        const data = await res.json();
        setDuelLeaderboard(data.leaderboard || []);
        setPlayerRank(data.playerRank || 4);
        if (data.weekTitle) setWeekTitle(data.weekTitle);
        if (data.resetsInDays !== undefined) setResetsInDays(data.resetsInDays);
        if (data.resetsInHours !== undefined) setResetsInHours(data.resetsInHours);
      }
    } catch (e) {
      console.warn('[Leaderboard Fetch Error]', e);
    } finally {
      setIsDuelLoading(false);
      if (triggerFeedback) {
        SoundEffects.playPopSound();
      }
    }
  };

  // Fetch Live Matches from Backend API
  const fetchLiveMatches = async () => {
    try {
      const res = await fetch('/api/duel/live-matches');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.matches) && data.matches.length > 0) {
          setLiveMatches(data.matches);
        }
      }
    } catch (e) {
      console.warn('[Live Matches Fetch Error]', e);
    }
  };

  // Initial load & real-time auto refresh interval
  useEffect(() => {
    fetchDuelLeaderboard();
    fetchLiveMatches();

    const interval = setInterval(() => {
      fetchDuelLeaderboard();
      fetchLiveMatches();
      setActivities([...StorageService.getRecentActivities()]);
    }, 15000);

    return () => clearInterval(interval);
  }, [currentChildId, activeChild?.name]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    SoundEffects.playPopSound();
    fetchDuelLeaderboard(true);
    fetchLiveMatches();
    setActivities(StorageService.getRecentActivities());
    setDailyLeaderboard(StorageService.getLeaderboard());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleStartDuel = () => {
    SoundEffects.playSwishSound();
    onOpenGame?.('santri_duel');
  };

  const handleLoadMoreDaily = () => {
    setVisibleLeaderboardCount((prev) => prev + 5);
  };

  // Filtered Duel Leaderboard
  const filteredDuelLeaderboard = duelLeaderboard.filter((player) => {
    const matchQuery =
      searchQuery.trim() === '' ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === 'all' ||
      (player.categorySpecialty && player.categorySpecialty.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchQuery && matchCategory;
  });

  // Top 3 Podium
  const top1Player = duelLeaderboard.find((p) => p.rank === 1);
  const top2Player = duelLeaderboard.find((p) => p.rank === 2);
  const top3Player = duelLeaderboard.find((p) => p.rank === 3);

  // Find user in duel leaderboard
  const currentPlayerInBoard = duelLeaderboard.find((p) => p.isCurrentPlayer);
  const nextTargetPlayer =
    currentPlayerInBoard && currentPlayerInBoard.rank > 1
      ? duelLeaderboard.find((p) => p.rank === currentPlayerInBoard.rank - 1)
      : null;
  const pointsToOvertake = nextTargetPlayer && currentPlayerInBoard
    ? Math.max(10, nextTargetPlayer.score - currentPlayerInBoard.score + 5)
    : 25;

  return (
    <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 font-sans">
      {/* Top Main Navigation Header with Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-xl shadow-2xs">
              🏆
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#164C68] font-heading">
                  Leaderboard Global & Liga Santri
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Real-Time
                </span>
              </div>
              <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
                Peringkat kompetisi duel cerdas cermat & motivasi hafalan santri se-Indonesia
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            title="Perbarui data peringkat real-time"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#08B9EF]' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleStartDuel}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Swords size={15} />
            <span>Tantang Duel ⚔️</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          onClick={() => {
            setActiveTab('duel_leaderboard');
            SoundEffects.playPopSound();
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'duel_leaderboard'
              ? 'bg-white text-[#164C68] shadow-xs ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Swords size={16} className={activeTab === 'duel_leaderboard' ? 'text-rose-500' : ''} />
          <span>⚔️ Liga Duel Kuis (Global Real-Time)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('daily_activity');
            SoundEffects.playPopSound();
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'daily_activity'
              ? 'bg-white text-[#164C68] shadow-xs ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy size={16} className={activeTab === 'daily_activity' ? 'text-amber-500' : ''} />
          <span>🌟 Peringkat Umum & Feed Santri</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: LIGA DUEL KUIS GLOBAL (REAL-TIME MULTIPLAYER ARENA)    */}
      {/* ============================================================== */}
      {activeTab === 'duel_leaderboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* League Info & Prizes Banner */}
          <div className="bg-gradient-to-br from-[#164C68] via-[#103A50] to-[#0A2637] text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
            {/* Background glowing decorations */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 border border-white/15 text-[11px] font-bold">
                  <Clock size={13} className="text-amber-300" />
                  <span>Reset Liga: {resetsInDays} Hari {resetsInHours} Jam Lagi</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-heading text-white">
                  {weekTitle}
                </h3>
                <p className="text-xs text-cyan-100/90 leading-relaxed">
                  Kumpulkan skor kemenangan dari <strong>Duel Kuis Santri 1 vs 1</strong> (Sambung Ayat, Tebak Surah, Hukum Tajwid). Tiga santri teratas mendapatkan medali liga dan bonus ratusan bintang!
                </p>
              </div>

              {/* Weekly Podium Rewards Pill */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-3 text-xs space-y-1.5 shrink-0 w-full md:w-auto">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                  🎁 Hadiah Pekan Ini:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🥇</span>
                  <span className="font-extrabold text-white">+100 Bintang</span>
                  <span className="text-slate-300 text-[10px]">• Medali Emas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🥈</span>
                  <span className="font-bold text-white">+60 Bintang</span>
                  <span className="text-slate-300 text-[10px]">• Medali Perak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🥉</span>
                  <span className="font-bold text-white">+40 Bintang</span>
                  <span className="text-slate-300 text-[10px]">• Medali Perunggu</span>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL SPOTLIGHT CARD: Posisi Santri Saat Ini */}
          <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-emerald-50 border-2 border-cyan-300 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-xs ring-4 ring-cyan-200">
                  {activeChild?.avatar || '👦'}
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#164C68] text-white text-[9px] font-black border border-white">
                  Lv.{activeChild?.level || 1}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black text-[#164C68] truncate font-heading">
                    {activeChild?.name || 'Santri Bintang'} (Kamu)
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#164C68] text-white text-[10px] font-black uppercase">
                    Peringkat #{playerRank}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Flame size={12} className="text-amber-500 fill-amber-500" />
                    Streak x{duelStats.winStreak}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  Total Skor Duel: <strong className="text-cyan-700 font-black">{duelStats.duelScore} Poin</strong> • Menang {duelStats.matchesWon}/{duelStats.matchesTotal} Duel
                </p>

                {nextTargetPlayer && (
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Hanya butuh <strong>+{pointsToOvertake} poin</strong> lagi untuk menggeser posisi #{nextTargetPlayer.rank} ({nextTargetPlayer.name})!</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={handleStartDuel}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#08B9EF] hover:bg-[#069ecf] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Swords size={16} />
                <span>Mulai Duel Sekarang ⚔️</span>
              </button>
            </div>
          </div>

          {/* FAIRPLAY ASSURANCE BANNER (Anti Demotivasi) */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
            <Shield size={16} className="text-amber-600 shrink-0" />
            <p className="leading-snug">
              <strong>Sistem Fairplay & Motivasi Positif:</strong> Pesaing dan bot natural diatur secara dinamis dengan jarak maksimal <strong>1-3 tingkat</strong> di atas posisimu. Papan peringkat selalu kompetitif dan kesempatanmu naik podium terbuka lebar!
            </p>
          </div>

          {/* GRAND PODIUM JUARA 1, 2, 3 */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-2 border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className="text-center mb-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                👑 PODIUM KELAS UTAMA PEKAN INI
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4">
              {/* RANK 2 - PERAK */}
              {top2Player && (
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center text-2xl sm:text-3xl shadow-sm">
                      {top2Player.avatar}
                    </div>
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
                      🥈
                    </span>
                    <span className="absolute -bottom-1 right-0 text-[9px] font-black bg-slate-700 text-white px-1.5 rounded-full">
                      #2
                    </span>
                  </div>
                  <strong className="text-xs sm:text-sm font-black text-slate-800 truncate max-w-[90px] sm:max-w-[130px] block">
                    {top2Player.name}
                  </strong>
                  <span className="text-[10px] text-slate-500 truncate max-w-[90px] sm:max-w-[130px] block">
                    {top2Player.schoolName}
                  </span>
                  <span className="font-mono text-xs font-black text-cyan-700 mt-1">
                    {top2Player.score} Poin
                  </span>
                  {/* Step bar */}
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-300 to-slate-200 rounded-t-2xl mt-3 flex items-center justify-center text-slate-600 font-black text-sm">
                    2
                  </div>
                </div>
              )}

              {/* RANK 1 - EMAS (CENTER & HIGHEST) */}
              {top1Player && (
                <div className="flex flex-col items-center text-center -mt-6">
                  <div className="relative mb-2">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border-3 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-md ring-4 ring-amber-200">
                      {top1Player.avatar}
                    </div>
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                      👑
                    </span>
                    <span className="absolute -bottom-1 right-0 text-[10px] font-black bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full shadow-2xs">
                      #1 Juara
                    </span>
                  </div>
                  <strong className="text-xs sm:text-base font-black text-[#164C68] truncate max-w-[110px] sm:max-w-[160px] block font-heading">
                    {top1Player.name}
                  </strong>
                  <span className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[110px] sm:max-w-[160px] block">
                    {top1Player.schoolName}
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-black text-amber-600 mt-1 bg-amber-100 px-2 py-0.5 rounded-lg">
                    {top1Player.score} Poin
                  </span>
                  {/* Step bar */}
                  <div className="w-full h-28 sm:h-34 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t-2xl mt-3 flex flex-col items-center justify-center text-amber-950 font-black shadow-sm">
                    <span className="text-lg">🥇</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Puncak</span>
                  </div>
                </div>
              )}

              {/* RANK 3 - PERUNGGU */}
              {top3Player && (
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-amber-600/40 flex items-center justify-center text-2xl sm:text-3xl shadow-sm">
                      {top3Player.avatar}
                    </div>
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
                      🥉
                    </span>
                    <span className="absolute -bottom-1 right-0 text-[9px] font-black bg-amber-700 text-white px-1.5 rounded-full">
                      #3
                    </span>
                  </div>
                  <strong className="text-xs sm:text-sm font-black text-slate-800 truncate max-w-[90px] sm:max-w-[130px] block">
                    {top3Player.name}
                  </strong>
                  <span className="text-[10px] text-slate-500 truncate max-w-[90px] sm:max-w-[130px] block">
                    {top3Player.schoolName}
                  </span>
                  <span className="font-mono text-xs font-black text-cyan-700 mt-1">
                    {top3Player.score} Poin
                  </span>
                  {/* Step bar */}
                  <div className="w-full h-16 sm:h-18 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-t-2xl mt-3 flex items-center justify-center text-amber-900 font-black text-sm">
                    3
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari santri, teman, atau nama pesantren..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#08B9EF] focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'sambung', label: 'Sambung Ayat' },
                { id: 'surah', label: 'Tebak Surah' },
                { id: 'tajwid', label: 'Hukum Tajwid' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#164C68] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* FULL LEADERBOARD TABLE */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
            <div className="bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 grid grid-cols-12 gap-2">
              <span className="col-span-2 sm:col-span-1 text-center">Rank</span>
              <span className="col-span-6 sm:col-span-6">Santri & Asal Sekolah</span>
              <span className="hidden sm:block sm:col-span-2 text-center">Gelar / Badge</span>
              <span className="col-span-4 sm:col-span-3 text-right">Skor Duel</span>
            </div>

            {filteredDuelLeaderboard.map((item) => {
              const isMe = item.isCurrentPlayer;
              const isTop1 = item.rank === 1;
              const isTop2 = item.rank === 2;
              const isTop3 = item.rank === 3;

              return (
                <div
                  key={item.id}
                  className={`px-4 py-3.5 grid grid-cols-12 gap-2 items-center transition-colors ${
                    isMe
                      ? 'bg-cyan-50/90 border-l-4 border-l-[#08B9EF] ring-2 ring-cyan-200 shadow-2xs'
                      : isTop1
                      ? 'bg-amber-50/40'
                      : isTop2
                      ? 'bg-slate-50/70'
                      : isTop3
                      ? 'bg-amber-50/20'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono shadow-2xs ${
                        isTop1
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : isTop2
                          ? 'bg-slate-300 text-slate-800'
                          : isTop3
                          ? 'bg-amber-700/30 text-amber-950'
                          : isMe
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${item.rank}`}
                    </span>
                  </div>

                  {/* Santri Info */}
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                        {item.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-slate-700 text-white px-1.5 rounded-full">
                        Lv.{item.isBot ? 3 + (item.rank % 3) : activeChild?.level || 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {item.name}
                        </strong>
                        {isMe && (
                          <span className="px-1.5 py-0.2 bg-cyan-600 text-white text-[9px] font-black rounded uppercase">
                            Kamu
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                          <Flame size={10} className="text-amber-500 fill-amber-500" />
                          x{item.streak}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-500 truncate block">
                        {item.schoolName}
                      </span>
                    </div>
                  </div>

                  {/* Gelar Badge */}
                  <div className="hidden sm:flex sm:col-span-2 items-center justify-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate">
                      {item.tierBadge}
                    </span>
                  </div>

                  {/* Score & Challenge Button */}
                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2">
                    <div className="text-right">
                      <span className="font-mono text-xs sm:text-sm font-black text-cyan-800 block">
                        {item.score.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Poin Duel</span>
                    </div>

                    {!isMe && (
                      <button
                        onClick={handleStartDuel}
                        className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 border border-slate-200 text-[11px] font-bold transition-all cursor-pointer items-center gap-1"
                        title={`Tantang ${item.name} duel 1 vs 1`}
                      >
                        <Swords size={12} />
                        <span>Tantang</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* LIVE DUEL MATCH TICKER (SPECTATOR / ACTIVITY) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <h4 className="text-xs sm:text-sm font-black text-[#164C68] font-heading">
                  Hasil Pertandingan Duel Terkini (Live Feed)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">
                Real-Time Arena
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {liveMatches.slice(0, 6).map((match) => (
                <div
                  key={match.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{match.player1Avatar}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 leading-tight truncate">
                        <strong>{match.winnerName}</strong> menang duel
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {match.player1Name} vs {match.player2Name} • {match.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold block">
                      {match.scoreDisplay}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {match.timeAgoText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: AKTIVITAS SANTRI & PAPAN PERINGKAT HARIAN             */}
      {/* ============================================================== */}
      {activeTab === 'daily_activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* LEFT COLUMN: Aktivitas terbaru */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#164C68] font-heading flex items-center gap-1.5">
                <span>⚡</span>
                <span>Aktivitas Belajar & Hafalan Santri</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Live Feed Nusantara
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1 space-y-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="py-2.5 px-2 rounded-2xl hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-2.5 group"
                >
                  {/* User Avatar & Level Badge */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        {act.userAvatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-[#164C68] text-white px-1.5 py-0.2 rounded-full border border-white">
                        Lv.{act.userLevel}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 leading-snug">
                        <strong className="font-extrabold text-[#164C68] group-hover:text-[#08B9EF] transition-colors">
                          {act.userName}
                        </strong>{' '}
                        <span className="font-medium text-slate-600">
                          {act.actionText.replace(act.userName, '').trim()}
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {act.timeAgoText} {act.location ? `• ${act.location}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Points & Game Icon Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {act.score > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-black">
                        {act.score.toLocaleString('id-ID')}
                      </span>
                    )}
                    <span
                      className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center text-xs shadow-2xs"
                      title={act.gameName}
                    >
                      {act.gameIcon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Pemain terbaik hari ini (Leaderboard) */}
          <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#164C68] font-heading flex items-center gap-1.5">
                <span>🏅</span>
                <span>Pemain Terbaik Hari Ini</span>
              </h3>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Top Santri
              </span>
            </div>

            <div className="space-y-1.5">
              {dailyLeaderboard.slice(0, visibleLeaderboardCount).map((player) => {
                const isTop1 = player.rank === 1;
                const isTop2 = player.rank === 2;
                const isTop3 = player.rank === 3;

                return (
                  <div
                    key={player.rank}
                    className={`p-2.5 rounded-2xl flex items-center justify-between transition-all ${
                      player.isCurrentUser
                        ? 'bg-cyan-50/80 border border-[#08B9EF] ring-2 ring-cyan-200 shadow-xs'
                        : isTop1
                        ? 'bg-amber-50/50 border border-amber-200 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Circle Badge */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isTop1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : isTop2
                            ? 'bg-slate-300 text-slate-800'
                            : isTop3
                            ? 'bg-amber-600/30 text-amber-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {player.rank}
                      </div>

                      {/* Avatar with Lv */}
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base border border-slate-200">
                          {player.userAvatar}
                        </div>
                        <span className="absolute -bottom-1 -right-1 text-[7px] font-black bg-slate-700 text-white px-1 rounded-full">
                          Lv.{player.userLevel}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#164C68] truncate max-w-[130px] sm:max-w-[150px]">
                            {player.userName}
                          </span>
                          {player.trophyCount && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-full">
                              🏆 x{player.trophyCount}
                            </span>
                          )}
                        </div>
                        {player.badgeIcon && (
                          <span className="text-[10px] text-slate-400">
                            {player.badgeIcon} {player.location || 'Santri'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <span className="font-mono text-xs font-black text-slate-800 shrink-0">
                      {player.score.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Muat Lagi Button */}
            {visibleLeaderboardCount < dailyLeaderboard.length && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleLoadMoreDaily}
                  className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Muat lagi</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
