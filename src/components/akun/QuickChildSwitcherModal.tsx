import React, { useState } from 'react';
import { User, X, Check, PlusCircle, Star, Sparkles } from 'lucide-react';
import { ChildProfile } from '../../types';
import { Button } from '../common/Button';

interface QuickChildSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  activeChildId: string;
  onSwitchChild: (childId: string) => void;
  onOpenCreateChild: () => void;
}

export const QuickChildSwitcherModal: React.FC<QuickChildSwitcherModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  activeChildId,
  onSwitchChild,
  onOpenCreateChild,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#EEF8FF] text-[#164C68] flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
            👨‍👧‍👦
          </div>
          <h3 className="text-base font-black text-[#164C68] font-heading">
            Pilih Profil Anak
          </h3>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Ganti santri untuk melanjutkan hafalan & catatan masing-masing
          </p>
        </div>

        {/* Children List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {childrenList.map((c) => {
            const isSelected = c.id === activeChildId;

            return (
              <button
                key={c.id}
                onClick={() => {
                  onSwitchChild(c.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                  isSelected
                    ? 'border-[#08B9EF] bg-cyan-50/50 shadow-xs'
                    : 'border-[#C9E1ED] hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.avatar}</span>
                  <div>
                    <h4 className="text-sm font-black text-[#164C68] font-heading">
                      {c.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#8C9BA7] font-semibold mt-0.5">
                      <span>Level {c.level}</span>
                      <span>•</span>
                      <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                        <Star size={11} className="fill-amber-400 text-amber-500" />
                        {c.totalStars}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-[#08B9EF] text-white flex items-center justify-center">
                    <Check size={16} strokeWidth={3} />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-[#08B9EF]">Pilih</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: Add New Child */}
        <div className="pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => {
              onClose();
              onOpenCreateChild();
            }}
            icon={<PlusCircle size={16} />}
          >
            Tambah Profil Anak Baru
          </Button>
        </div>
      </div>
    </div>
  );
};
