import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  X,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Bell,
  Play,
  Volume2,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { BroadcastAnnouncement } from '../../types';
import { StorageService } from '../../services/storageService';

interface BroadcastNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast?: BroadcastAnnouncement | null;
  onActionClick?: (target?: string) => void;
}

export const BroadcastNoticeModal: React.FC<BroadcastNoticeModalProps> = ({
  isOpen,
  onClose,
  broadcast,
  onActionClick,
}) => {
  if (!isOpen || !broadcast) return null;

  const handleAction = () => {
    StorageService.recordBroadcastClick(broadcast.id);
    onActionClick?.(broadcast.actionTarget);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* MEDIA HEADER (IMAGE OR VIDEO) */}
          {broadcast.mediaType === 'image' && broadcast.mediaUrl && (
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
              <img
                src={broadcast.mediaUrl}
                alt={broadcast.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-amber-300 text-xs font-black border border-amber-400/30">
                  {broadcast.badge || 'Pengumuman Syiar'}
                </span>
              </div>
            </div>
          )}

          {broadcast.mediaType === 'video' && broadcast.mediaUrl && (
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
              <iframe
                src={broadcast.mediaUrl}
                title={broadcast.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <X size={16} />
          </button>

          {/* BODY */}
          <div className="p-6 overflow-y-auto space-y-4">
            {broadcast.mediaType === 'none' && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-100 text-[#164C68] text-xs font-black">
                  {broadcast.badge || 'Kabar Terbaru'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(broadcast.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {broadcast.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {broadcast.content}
              </p>
            </div>

            {broadcast.mediaCaption && (
              <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                ℹ️ {broadcast.mediaCaption}
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/70 text-xs font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>

            {broadcast.actionLabel && (
              <button
                type="button"
                onClick={handleAction}
                className="px-5 py-2.5 rounded-2xl bg-[#164C68] hover:bg-[#1E5D7B] text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>{broadcast.actionLabel}</span>
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
