import React, { useState } from 'react';
import { Volume2, CheckCircle2, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { IQRA_CURRICULUM } from '../../data/iqraData';
import { StorageService } from '../../services/storageService';
import { IqraItem } from '../../types';
import { Button } from '../common/Button';

interface IqraModuleProps {
  childId: string;
  onBack: () => void;
}

export const IqraModule: React.FC<IqraModuleProps> = ({ childId, onBack }) => {
  const [activeJilid, setActiveJilid] = useState<'A' | '1' | '2' | '3' | '4'>('A');
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    StorageService.getCompletedIqra(childId)
  );

  const jilidItems = IQRA_CURRICULUM.filter((item) => item.jilid === activeJilid);
  const masteredInJilid = jilidItems.filter((i) => completedIds.includes(i.id)).length;
  const totalInJilid = jilidItems.length;

  const handleToggleMastery = (itemId: string) => {
    StorageService.toggleIqraMastery(childId, itemId);
    setCompletedIds(StorageService.getCompletedIqra(childId));
  };

  const handlePlaySound = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Jilid Tabs */}
      <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
        {(['A', '1', '2', '3', '4'] as const).map((jilid) => (
          <button
            key={jilid}
            onClick={() => setActiveJilid(jilid)}
            className={`flex-1 min-w-[60px] py-2 rounded-xl text-xs font-bold transition-all text-center ${
              activeJilid === jilid
                ? 'bg-[#08B9EF] text-white shadow-xs'
                : 'text-[#8C9BA7] hover:text-[#164C68]'
            }`}
          >
            Jilid {jilid}
          </button>
        ))}
      </div>

      {/* Jilid Progress Summary */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-[#164C68] font-heading">
            Iqra' Jilid {activeJilid}
          </h3>
          <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
            {masteredInJilid} dari {totalInJilid} materi dikuasai
          </p>
        </div>

        <div className="w-24 bg-[#EEF8FF] h-2.5 rounded-full overflow-hidden border border-[#C9E1ED]">
          <div
            className="bg-[#81E850] h-full rounded-full transition-all duration-300"
            style={{ width: `${totalInJilid > 0 ? (masteredInJilid / totalInJilid) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Curriculum Items */}
      <div className="space-y-3">
        {jilidItems.map((item) => {
          const isMastered = completedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all ${
                isMastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#C9E1ED]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#08B9EF] uppercase tracking-wider block">
                    {item.harakat}
                  </span>
                  <h4 className="text-base font-black text-[#164C68] font-heading mt-0.5">
                    {item.title}
                  </h4>
                </div>

                <button
                  onClick={() => handlePlaySound(item.soundExample)}
                  className="w-10 h-10 rounded-2xl bg-[#EEF8FF] text-[#08B9EF] hover:bg-[#d8eefc] flex items-center justify-center transition-colors active:scale-95 cursor-pointer border border-[#C9E1ED]"
                  title="Dengarkan Pelafalan"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Large Arabic Item Display */}
              <div className="my-4 py-3 bg-[#EEF8FF]/60 rounded-2xl text-center border border-[#C9E1ED]/60">
                <span dir="rtl" className="font-quran text-4xl text-[#164C68] font-bold">
                  {item.arabic}
                </span>
                <p className="text-xs text-[#8C9BA7] font-bold mt-1">
                  Pelafalan: {item.latin}
                </p>
              </div>

              <p className="text-xs text-[#8C9BA7] font-medium leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Mastery Action Button */}
              <button
                onClick={() => handleToggleMastery(item.id)}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isMastered
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-[#EEF8FF] hover:bg-[#d9effc] text-[#164C68] border border-[#C9E1ED]'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{isMastered ? 'Sudah Bisa ✓ (+10 XP)' : 'Tandai Sudah Bisa'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
