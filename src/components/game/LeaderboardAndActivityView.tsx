import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Users,
  Flame,
  ChevronDown,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  UserActivityItem,
  LeaderboardPlayerItem,
} from '../../data/leaderboardAndActivityData';
import { StorageService } from '../../services/storageService';

interface LeaderboardAndActivityViewProps {
  childId?: string;
  onOpenGame?: (gameId: string) => void;
}

export const LeaderboardAndActivityView: React.FC<LeaderboardAndActivityViewProps> = ({
  childId,
  onOpenGame,
}) => {
  const [activities, setActivities] = useState<UserActivityItem[]>(() =>
    StorageService.getRecentActivities()
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayerItem[]>(() =>
    StorageService.getLeaderboard()
  );
  const [visibleLeaderboardCount, setVisibleLeaderboardCount] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Periodic fresh live simulated activities
  useEffect(() => {
    const timer = setInterval(() => {
      const liveList = StorageService.getRecentActivities();
      setActivities([...liveList]);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setActivities(StorageService.getRecentActivities());
      setLeaderboard(StorageService.getLeaderboard());
      setIsRefreshing(false);
    }, 600);
  };

  const handleLoadMore = () => {
    setVisibleLeaderboardCount((prev) => prev + 5);
  };

  return (
    <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 font-sans">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-lg sm:text-xl font-black text-[#164C68] font-heading">
              Aktivitas Santri & Papan Peringkat
            </h2>
          </div>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Kompetisi sehat & motivasi harian hafalan Al-Qur'an nusantara
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#08B9EF]' : ''} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* TWO COLUMNS MATCHING SCREENSHOT 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Aktivitas terbaru */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#164C68] font-heading flex items-center gap-1.5">
              <span>⚡</span>
              <span>Aktivitas terbaru</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● Live Feed
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
                      {act.timeAgoText}
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
              <span>Pemain terbaik hari ini</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Top Santri
            </span>
          </div>

          <div className="space-y-1.5">
            {leaderboard.slice(0, visibleLeaderboardCount).map((player) => {
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
                          {player.badgeIcon} Favorit
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
          {visibleLeaderboardCount < leaderboard.length && (
            <div className="pt-2 text-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>Muat lagi</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
