import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Award,
  ScrollText,
  Search,
} from 'lucide-react';
import { ASBAB_NUZUL_STORIES } from '../../data/asbabNuzulData';
import { AsbabNuzulIllustration } from './AsbabNuzulIllustration';
import { StorageService } from '../../services/storageService';
import { SoundEffects } from '../../services/soundEffects';
import { CompanionService } from '../../services/companionService';
import { AsbabNuzulStory } from '../../types';
import { Button } from '../common/Button';

interface AsbabNuzulModuleProps {
  childId: string;
  onBack: () => void;
}

export const AsbabNuzulModule: React.FC<AsbabNuzulModuleProps> = ({ childId, onBack }) => {
  const [selectedStory, setSelectedStory] = useState<AsbabNuzulStory | null>(null);
  const [completedStoryIds, setCompletedStoryIds] = useState<string[]>(() =>
    StorageService.getCompletedStories(childId)
  );
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'Sebab Turunnya Ayat' | 'Kisah di Balik Surah'>('all');

  const totalStories = ASBAB_NUZUL_STORIES.length; // 18 stories
  const completedCount = completedStoryIds.length;

  const handleMarkStoryCompleted = (storyId: string) => {
    SoundEffects.playCorrectSound();
    SoundEffects.playRewardSound();
    StorageService.markStoryRead(childId, storyId);
    setCompletedStoryIds(StorageService.getCompletedStories(childId));
    CompanionService.recordActivity(
      childId,
      'asbab_nuzul',
      25,
      5,
      `Membaca Asbabun Nuzul: ${selectedStory?.title || 'Kisah Qur\'an'}`
    );
  };

  const handleToggleNarration = (story: AsbabNuzulStory) => {
    if (isNarrating) {
      SoundEffects.stopSpeaking();
      setIsNarrating(false);
    } else {
      const fullText = `${story.title}. Surah ${story.surahName}. ${story.summary}. ${story.story}. Hikmah: ${story.moralLesson}. Rujukan: ${story.reference}.`;
      const started = SoundEffects.speakIndonesian(fullText, () => {
        setIsNarrating(false);
      });
      setIsNarrating(started);
    }
  };

  const filteredStories = ASBAB_NUZUL_STORIES.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || s.type === filterType;
    return matchSearch && matchType;
  });

  // --- Render 1: Story Detail Reader with Authentic Reference & Visual Scene ---
  if (selectedStory) {
    const isCompleted = completedStoryIds.includes(selectedStory.id);

    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              SoundEffects.stopSpeaking();
              setIsNarrating(false);
              setSelectedStory(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke 18 Kisah</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleNarration(selectedStory)}
              className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isNarrating
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isNarrating ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isNarrating ? 'Hentikan Suara' : 'Dengarkan Kisah 🔊'}</span>
            </button>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full">
              {selectedStory.type}
            </span>
          </div>
        </div>

        {/* Static Islamic Cartoon Illustration Banner */}
        <AsbabNuzulIllustration
          theme={selectedStory.illustrationTheme}
          className="shadow-sm border-2 border-teal-200"
        />

        {/* Story Title Card */}
        <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{selectedStory.icon}</span>
            <div>
              <span className="text-xs font-bold text-[#08B9AA] uppercase tracking-wider block">
                SURAH {selectedStory.surahName.toUpperCase()} ({selectedStory.relatedAyahRange})
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#164C68] font-heading mt-0.5">
                {selectedStory.title}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-semibold italic max-w-md mx-auto">
            "{selectedStory.summary}"
          </p>
        </div>

        {/* Authentic Scholarly Reference Card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200 rounded-3xl p-4.5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5 font-heading">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>Rujukan Shahih & Sanad Terpercaya</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-black text-[10px]">
              {selectedStory.authenticityGrade || 'Shahih'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white/90 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Kitab Rujukan Utama:</span>
              <strong className="text-slate-900 block font-mono text-[11px]">{selectedStory.reference}</strong>
            </div>
            <div className="p-2.5 bg-white/90 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Perawi / Sahabat Nabi:</span>
              <strong className="text-emerald-900 block font-mono text-[11px]">{selectedStory.narrator || 'Sahabat Nabi'}</strong>
            </div>
          </div>
        </div>

        {/* Story Body */}
        <div className="bg-white border border-[#C9E1ED] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block flex items-center gap-1.5">
            <ScrollText size={15} className="text-[#08B9AA]" />
            <span>KRONOLOGI & SEBAB TURUNNYA AYAT</span>
          </span>
          <p className="text-xs sm:text-sm text-[#164C68] font-medium leading-relaxed text-justify">
            {selectedStory.story}
          </p>

          {/* Moral Lesson */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
              🌱 HIKMAH & PELAJARAN AKHLAK SANTRI
            </span>
            <p className="text-xs text-teal-950 font-semibold leading-relaxed">
              {selectedStory.moralLesson}
            </p>
          </div>

          {/* Action Button */}
          <Button
            variant="green"
            size="lg"
            fullWidth
            onClick={() => handleMarkStoryCompleted(selectedStory.id)}
            icon={<CheckCircle2 size={18} />}
          >
            {isCompleted ? '✓ Telah Selesai Dibaca & Dipahami' : 'Tandai Selesai Dibaca (+25 XP & 5 ⭐)'}
          </Button>
        </div>
      </div>
    );
  }

  // --- Render 2: 18 Stories Library List with Search & Visual Cartoon Badges ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Materi Al-Qur'an Berdasar Riwayat Shahih
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-heading">
            Asbabun Nuzul Juz 30
          </h2>
          <p className="text-xs text-teal-100 font-medium mt-0.5">
            18 Kisah agung sebab turunnya wahyu & hikmah kehidupan
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
          📖
        </div>
      </div>

      {/* Progress Bar (0/18 kisah) */}
      <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7]">
          <span className="flex items-center gap-1.5">
            <Award size={15} className="text-[#08B9AA]" />
            <span>Kisah yang Telah Tuntas Dibaca</span>
          </span>
          <span className="text-[#08B9AA] font-black font-mono">
            {completedCount} / {totalStories} Kisah ({Math.round((completedCount / totalStories) * 100)}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-400 to-[#08B9AA] h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, (completedCount / totalStories) * 100)}%` }}
          />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kisah surah... (misal: Al-Fil, Gua Hira, Duha, Kautsar)"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#C9E1ED] rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#08B9AA] text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-all ${
              filterType === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua ({ASBAB_NUZUL_STORIES.length})
          </button>
          <button
            onClick={() => setFilterType('Sebab Turunnya Ayat')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-all ${
              filterType === 'Sebab Turunnya Ayat'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Sebab Turunnya Ayat (16)
          </button>
          <button
            onClick={() => setFilterType('Kisah di Balik Surah')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer shrink-0 transition-all ${
              filterType === 'Kisah di Balik Surah'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Kisah di Balik Surah (2)
          </button>
        </div>
      </div>

      {/* 18 Story Cards Grid with Static Visual Cartoon Scenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredStories.map((story) => {
          const isDone = completedStoryIds.includes(story.id);

          return (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="bg-white border-2 border-[#C9E1ED] hover:border-[#08B9AA] rounded-3xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer select-none group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Visual Islamic Cartoon Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-100">
                  <AsbabNuzulIllustration
                    theme={story.illustrationTheme}
                    compact
                    className="group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[9px] font-black uppercase text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                    {story.surahName} • {story.relatedAyahRange}
                  </span>
                  {isDone && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>Selesai</span>
                    </span>
                  )}
                </div>

                {/* Story Info */}
                <div>
                  <span className="text-[9px] font-black tracking-wider uppercase text-amber-700 block mb-0.5">
                    {story.type}
                  </span>
                  <h3 className="text-sm font-black text-[#164C68] font-heading line-clamp-1 group-hover:text-[#08B9AA] transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1">
                    {story.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer: Authentic Reference Tag */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold truncate max-w-[180px] flex items-center gap-1">
                  <ShieldCheck size={12} className="shrink-0" />
                  <span className="truncate">{story.reference}</span>
                </span>
                <span className="text-[#08B9AA] font-black flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>Baca</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
