import React, { useState } from 'react';
import {
  User,
  X,
  Check,
  PlusCircle,
  Star,
  Sparkles,
  Trash2,
  AlertTriangle,
  Crown,
  Lock,
} from 'lucide-react';
import { ChildProfile } from '../../types';
import { Button } from '../common/Button';

interface QuickChildSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: ChildProfile[];
  activeChildId: string;
  isPro?: boolean;
  onSwitchChild: (childId: string) => void;
  onOpenCreateChild: () => void;
  onDeleteChild?: (childId: string) => void;
  onOpenUpgradeModal?: () => void;
}

export const QuickChildSwitcherModal: React.FC<QuickChildSwitcherModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  activeChildId,
  isPro = false,
  onSwitchChild,
  onOpenCreateChild,
  onDeleteChild,
  onOpenUpgradeModal,
}) => {
  const [childToDelete, setChildToDelete] = useState<ChildProfile | null>(null);
  const [showProLimitAlert, setShowProLimitAlert] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAttemptAddChild = () => {
    // Free limit: 1 child maximum. 2 or more children require PRO!
    if (!isPro && childrenList.length >= 1) {
      setShowProLimitAlert(true);
      return;
    }
    onClose();
    onOpenCreateChild();
  };

  const confirmDelete = () => {
    if (!childToDelete || !onDeleteChild) return;
    onDeleteChild(childToDelete.id);
    setChildToDelete(null);
  };

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
            Pilih & Kelola Profil Anak
          </h3>
          <p className="text-xs text-[#8C9BA7] font-medium mt-0.5">
            Ganti santri untuk melanjutkan hafalan & catatan masing-masing
          </p>
          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPro
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isPro ? '👑 PRO: Multi-Anak Aktif' : 'Free: Maks. 1 Anak'}
            </span>
          </div>
        </div>

        {/* Children List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {childrenList.map((c) => {
            const isSelected = c.id === activeChildId;
            const canDelete = childrenList.length > 1;

            return (
              <div
                key={c.id}
                className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                  isSelected
                    ? 'border-[#08B9EF] bg-cyan-50/50 shadow-xs'
                    : 'border-[#C9E1ED] hover:border-slate-300 bg-white'
                }`}
              >
                {/* Clickable Profile Switch Area */}
                <div
                  onClick={() => {
                    onSwitchChild(c.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <span className="text-3xl shrink-0">{c.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-[#164C68] font-heading truncate">
                        {c.name}
                      </h4>
                      {isSelected && (
                        <span className="bg-[#08B9EF] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8C9BA7] font-semibold mt-0.5">
                      <span className="bg-[#EEF8FF] text-[#164C68] px-1.5 py-0.5 rounded-md font-bold">
                        {c.age
                          ? `${c.age} thn`
                          : c.birthYear
                          ? `${new Date().getFullYear() - c.birthYear} thn`
                          : 'Santri'}
                      </span>
                      <span>•</span>
                      <span className="text-amber-600 flex items-center gap-0.5 font-bold">
                        <Star size={11} className="fill-amber-400 text-amber-500" />
                        {c.totalStars}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{c.learningLevel || 'Pemula'}</span>
                    </div>

                    {c.targetSurahName && (
                      <div className="text-[10px] text-[#08B9EF] font-black mt-1 flex items-center gap-1">
                        <span>📖</span>
                        <span className="truncate">
                          Surah {c.targetSurahName} • Ayat {c.lastPracticedAyah || 1}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Icons: Select / Delete */}
                <div className="flex items-center gap-1 pl-2 shrink-0">
                  {/* Delete Child Button */}
                  {onDeleteChild && (
                    <button
                      type="button"
                      disabled={!canDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canDelete) return;
                        setChildToDelete(c);
                      }}
                      title={
                        canDelete
                          ? `Hapus profil ${c.name}`
                          : 'Minimal 1 profil anak harus tetap ada'
                      }
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        canDelete
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          : 'text-slate-200 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  {/* Switch Indicator */}
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-[#08B9EF] text-white flex items-center justify-center shadow-xs">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchChild(c.id);
                        onClose();
                      }}
                      className="px-2 py-1 text-xs font-bold text-[#08B9EF] hover:bg-cyan-50 rounded-lg cursor-pointer"
                    >
                      Pilih
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button: Add New Child */}
        <div className="pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleAttemptAddChild}
            icon={
              !isPro && childrenList.length >= 1 ? (
                <Crown size={16} className="text-amber-500" />
              ) : (
                <PlusCircle size={16} />
              )
            }
          >
            {!isPro && childrenList.length >= 1
              ? 'Tambah Anak Kedua (Fitur PRO 👑)'
              : 'Tambah Profil Anak Baru'}
          </Button>
        </div>

        {/* CONFIRM DELETE DIALOG */}
        {childToDelete && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl border-2 border-rose-200 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
                <AlertTriangle size={24} />
              </div>
              <h4 className="font-heading font-black text-slate-800 text-sm">
                Hapus Profil {childToDelete.name}?
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Seluruh rekaman suara, catatan setoran hafalan, dan bintang santri ini akan dihapus
                permanen dari memori perangkat.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setChildToDelete(null)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRO LIMIT 2ND CHILD MODAL */}
        {showProLimitAlert && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl border-2 border-amber-300 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                👑
              </div>
              <h4 className="font-heading font-black text-[#164C68] text-sm">
                Multi-Profil Santri (Fitur PRO)
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Paket Free dibatasi hanya <strong>1 anak</strong>. Pengelolaan 2 anak atau lebih
                dalam satu akun keluarga merupakan fitur khusus <strong>Cahaya Tahfiz PRO</strong>!
              </p>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProLimitAlert(false);
                    onClose();
                    onOpenUpgradeModal?.();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Crown size={14} />
                  <span>Upgrade ke PRO Sekarang 👑</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowProLimitAlert(false)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Nanti Dulu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
