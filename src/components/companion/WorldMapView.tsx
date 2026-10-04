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
} from 'lucide-react';
import { ChildProfile } from '../../types';
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

interface WorldMapViewProps {
  child: ChildProfile;
  companion: CompanionData;
  initialTab?: 'map' | 'games' | 'room' | 'collection';
  onNavigateToLand: (tab: 'tahfiz' | 'alquran', subView?: string) => void;
  onRefreshCompanion: () => void;
  // Mini-game launcher
  onLaunchMiniGame: (gameId: string) => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  child,
  companion,
  initialTab = 'map',
  onNavigateToLand,
  onRefreshCompanion,
  onLaunchMiniGame,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'map' | 'games' | 'room' | 'collection'>(initialTab);
  const [selectedLand, setSelectedLand] = useState<WorldLand | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'tahfiz' | 'alquran'>('all');
  const [mapViewMode, setMapViewMode] = useState<'trail' | 'cards'>('trail');
  const [collectionSubTab, setCollectionSubTab] = useState<'stages' | 'cards' | 'badges' | 'plants'>('stages');
  const [roomActionNotice, setRoomActionNotice] = useState<string | null>(null);

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
      {/* 4-Tab Main Navigation Header */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-1.5 shadow-xs grid grid-cols-4 gap-1 text-center">
        <button
          onClick={() => setActiveMainTab('map')}
          className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeMainTab === 'map'
              ? 'bg-[#08B9EF] text-white shadow-sm'
              : 'text-[#8C9BA7] hover:text-[#164C68]'
          }`}
        >
          <Compass size={18} />
          <span className="text-[11px] font-heading">Peta Dunia</span>
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
          <span className="text-[11px] font-heading">Arena Game</span>
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
          <span className="text-[11px] font-heading">Kamar Lumi</span>
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
          <span className="text-[11px] font-heading">Koleksi</span>
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
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-orange-100 font-bold uppercase tracking-wider">
                Taman Bermain Anak
              </span>
              <h2 className="text-xl font-black font-heading tracking-tight mt-0.5">
                8 Arena Mini-Game Al-Qur'an
              </h2>
              <p className="text-xs text-orange-100 font-medium mt-1">
                Kuis ceria tanpa tekanan dengan materi Al-Qur'an terverifikasi!
              </p>
            </div>
            <div className="text-4xl p-2 bg-white/20 rounded-2xl backdrop-blur-xs">
              🎮
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'continue_ayah', title: 'Sambung Ayat', desc: 'Tebak lanjutan potongan ayat berikutnya', icon: '🔗', color: 'from-cyan-400 to-blue-500' },
              { id: 'arrange_ayah', title: 'Susun Ayat', desc: 'Urutkan kata menjadi ayat yang tepat', icon: '🧩', color: 'from-emerald-400 to-teal-500' },
              { id: 'missing_word', title: 'Kata yang Hilang', desc: 'Isi bagian ayat yang tersembunyi', icon: '🔍', color: 'from-orange-400 to-amber-500' },
              { id: 'arabic_matching', title: 'Cocokkan Kata & Arti', desc: 'Pasangkan kata Arab dengan maknanya', icon: '🎯', color: 'from-purple-400 to-indigo-500' },
              { id: 'hijaiyah_sound', title: 'Tebak Suara Huruf', desc: 'Dengar bunyi huruf hijaiyah lalu tebak', icon: '🎧', color: 'from-yellow-400 to-amber-500' },
              { id: 'tajwid_class', title: 'Klasifikasi Tajwid', desc: 'Kenali hukum nun sukun & makhraj', icon: '🏷️', color: 'from-teal-400 to-cyan-600' },
              { id: 'guess_surah', title: 'Tebak Nama Surah', desc: 'Cari tahu surah dari ciri dan kisahnya', icon: '💡', color: 'from-blue-400 to-indigo-500' },
              { id: 'audio_to_ayah', title: 'Dengar & Pilih Ayat', desc: 'Dengar lantunan qari lalu tentukan ayatnya', icon: '🎵', color: 'from-rose-400 to-pink-500' },
            ].map((game) => (
              <div
                key={game.id}
                onClick={() => onLaunchMiniGame(game.id)}
                className="bg-white border-2 border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group select-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                >
                  {game.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-[#164C68] font-heading group-hover:text-[#08B9EF] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-[#8C9BA7] font-medium line-clamp-1">
                    {game.desc}
                  </p>
                </div>
                <ChevronRight size={18} className="text-[#8C9BA7] group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
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
                    className="p-2.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-white shadow-xs text-3xl animate-in zoom-in-50"
                    title={dec.name}
                  >
                    {dec.icon}
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
              <div className="text-7xl group-hover:scale-110 active:scale-95 transition-transform filter drop-shadow-lg">
                {stageConfig.avatarIcon}
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
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full text-xs font-black">
                <Star size={14} className="fill-amber-400 text-amber-500" />
                <span>{child.totalStars} ⭐</span>
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
                      <span className="text-2xl">{dec.icon}</span>
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
                    className={`bg-white border-2 rounded-3xl p-4 shadow-xs transition-all flex items-center gap-3.5 ${
                      isCurrent
                        ? 'border-[#08B9EF] ring-2 ring-cyan-200 bg-cyan-50/20'
                        : isUnlocked
                        ? 'border-[#C9E1ED]'
                        : 'border-slate-200 opacity-50 bg-slate-50'
                    }`}
                  >
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
                      className={`bg-white border-2 rounded-3xl p-4 shadow-xs space-y-2 transition-all ${
                        isUnlocked ? 'border-[#C9E1ED]' : 'border-slate-200 opacity-60'
                      }`}
                    >
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
    </div>
  );
};
