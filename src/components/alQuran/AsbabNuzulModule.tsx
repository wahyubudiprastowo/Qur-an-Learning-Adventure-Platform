import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, BookOpen, Star, Sparkles } from 'lucide-react';
import { ASBAB_NUZUL_STORIES } from '../../data/asbabNuzulData';
import { StorageService } from '../../services/storageService';
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

  const totalStories = 18; // 18 stories target as shown on screenshot
  const completedCount = completedStoryIds.length;

  const handleMarkStoryCompleted = (storyId: string) => {
    StorageService.markStoryRead(childId, storyId);
    setCompletedStoryIds(StorageService.getCompletedStories(childId));
  };

  // --- Render 1: Story Detail Reader ---
  if (selectedStory) {
    const isCompleted = completedStoryIds.includes(selectedStory.id);

    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedStory(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF]"
          >
            <ArrowLeft size={16} />
            <span>Semua Kisah</span>
          </button>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full">
            {selectedStory.type}
          </span>
        </div>

        {/* Story Banner */}
        <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-xs text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center text-4xl mx-auto shadow-xs">
            {selectedStory.icon}
          </div>

          <div>
            <span className="text-xs font-bold text-[#08B9AA] uppercase tracking-wider block">
              SURAH {selectedStory.surahName} ({selectedStory.relatedAyahRange})
            </span>
            <h2 className="text-xl font-black text-[#164C68] font-heading mt-0.5">
              {selectedStory.title}
            </h2>
          </div>

          <p className="text-xs text-[#8C9BA7] font-semibold italic max-w-xs mx-auto">
            "{selectedStory.summary}"
          </p>
        </div>

        {/* Story Body */}
        <div className="bg-white border border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-4">
          <span className="text-xs font-black text-[#8C9BA7] uppercase tracking-wider block">
            JALAN CERITA
          </span>
          <p className="text-xs sm:text-sm text-[#164C68] font-medium leading-relaxed">
            {selectedStory.story}
          </p>

          {/* Moral Lesson */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
              🌱 HIKMAH PELAJARAN
            </span>
            <p className="text-xs text-teal-950 font-semibold leading-relaxed">
              {selectedStory.moralLesson}
            </p>
          </div>

          {/* Reference Citation */}
          <div className="text-[11px] text-[#8C9BA7] font-medium pt-2 border-t border-slate-100">
            Sumber Rujukan: {selectedStory.reference}
          </div>

          {/* Action Button */}
          <Button
            variant="green"
            size="lg"
            fullWidth
            onClick={() => handleMarkStoryCompleted(selectedStory.id)}
            icon={<CheckCircle2 size={18} />}
          >
            {isCompleted ? 'Sudah Dibaca ✓ (+10 XP)' : 'Tandai Selesai Membaca (+10 XP)'}
          </Button>
        </div>
      </div>
    );
  }

  // --- Render 2: Stories Library List (Matches Screenshot 4) ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-3xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#164C68] font-heading">
            Asbab Nuzul
          </h2>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Kisah di balik surah • Juz 30
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#08B9AA] text-white flex items-center justify-center font-bold">
          <Clock size={20} />
        </div>
      </div>

      {/* Progress Bar (Matches Screenshot: 0/18 kisah) */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7]">
          <span>Kisah Selesai</span>
          <span className="text-[#08B9AA]">
            {completedCount}/{totalStories} kisah
          </span>
        </div>
        <div className="w-full bg-[#C9E1ED]/60 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#08B9AA] h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, (completedCount / totalStories) * 100)}%` }}
          />
        </div>
      </div>

      {/* Story Cards List (Matches Screenshot 4 layout) */}
      <div className="space-y-3">
        {ASBAB_NUZUL_STORIES.map((story) => {
          const isDone = completedStoryIds.includes(story.id);

          return (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="bg-white border border-[#C9E1ED] hover:border-[#08B9AA] rounded-3xl p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 cursor-pointer select-none group"
            >
              {/* Illustration Thumbnail Box */}
              <div className="w-16 h-16 rounded-2xl bg-[#EEF8FF] border border-[#C9E1ED] flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                {story.icon}
              </div>

              {/* Story Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black tracking-wider uppercase text-amber-700 block mb-0.5">
                  {story.type}
                </span>
                <h3 className="text-sm font-black text-[#164C68] font-heading truncate group-hover:text-[#08B9AA] transition-colors">
                  {story.title}
                </h3>
                <span className="text-xs text-[#08B9AA] font-bold block mt-0.5">
                  {story.surahName}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {isDone && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                <ChevronRight size={18} className="text-[#8C9BA7] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
