import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string;
  category?: string;
  badge?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: SharePayload | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  payload,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !payload) return null;

  const currentUrl = payload.url || (typeof window !== 'undefined' ? window.location.href : 'https://cahaya-tahfiz.app');
  const shareText = `${payload.title}\n\n${payload.text}\n\nYuk belajar dan menghafal Al-Qur'an bersama di Cahaya Tahfiz: ${currentUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.071.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824zm-3.423-10.416c-4.401 0-7.98 3.58-7.98 7.98 0 1.41.369 2.733 1.011 3.882l-1.074 3.923 4.025-1.056c1.109.605 2.378.948 3.731.948 4.402 0 7.98-3.579 7.98-7.979 0-4.401-3.578-7.98-7.98-7.98zm0 14.364c-1.203 0-2.332-.336-3.303-.923l-.236-.142-2.457.644.655-2.395-.156-.248c-.649-1.034-.993-2.234-.993-3.48 0-3.518 2.862-6.38 6.38-6.38 3.519 0 6.381 2.862 6.381 6.38 0 3.519-2.862 6.38-6.381 6.38z"/>
        </svg>
      ),
      bg: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: 'Telegram',
      icon: <Send size={20} />,
      bg: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(payload.title + ' - ' + payload.text)}`,
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bg: 'bg-black hover:bg-neutral-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bg: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      bg: 'bg-[#0077b5] hover:bg-[#006097] text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-md w-full overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/80 to-cyan-50/80">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#08B9EF] text-white flex items-center justify-center shadow-xs">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="font-heading font-black text-[#164C68] text-sm sm:text-base leading-tight">
                  Bagikan Capaian & Gambar
                </h3>
                <p className="text-[10px] text-[#8C9BA7] font-medium">
                  Syiar kebaikan & ajak keluarga belajar bersama
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#8C9BA7] hover:text-[#164C68] flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Card Preview Previewing the image or content */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="bg-gradient-to-br from-[#F5FAFC] to-[#E8F5FB] border border-[#C9E1ED] rounded-2xl p-3.5 relative overflow-hidden">
              {payload.imageUrl && (
                <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-3 bg-slate-100 relative border border-slate-200/60">
                  <img
                    src={payload.imageUrl}
                    alt={payload.title}
                    className="w-full h-full object-cover"
                  />
                  {payload.badge && (
                    <span className="absolute top-2 left-2 bg-[#08B9EF] text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                      {payload.badge}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  {payload.category && (
                    <span className="text-[9px] font-black text-[#08B9EF] uppercase tracking-wider block">
                      {payload.category}
                    </span>
                  )}
                  <h4 className="font-heading font-black text-[#164C68] text-sm leading-snug">
                    {payload.title}
                  </h4>
                  <p className="text-[11px] text-[#557385] mt-1 leading-relaxed font-medium line-clamp-3">
                    {payload.text}
                  </p>
                </div>
              </div>

              {/* Watermark / Logo badge */}
              <div className="mt-3 pt-2 border-t border-[#C9E1ED]/60 flex items-center justify-between text-[10px] text-[#8C9BA7] font-bold">
                <span className="flex items-center gap-1 text-[#08B9EF]">
                  <Sparkles size={12} />
                  <span>Cahaya Tahfiz AI</span>
                </span>
                <span>cahaya-tahfiz.app</span>
              </div>
            </div>

            {/* Quick Share Channels (WhatsApp, Telegram, X, Facebook, LinkedIn) */}
            <div>
              <label className="text-[11px] font-bold text-[#8C9BA7] uppercase tracking-wider block mb-2">
                Pilih Media Sosial
              </label>
              <div className="grid grid-cols-5 gap-2">
                {socialChannels.map((c) => (
                  <a
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all shadow-xs hover:scale-105 active:scale-95 ${c.bg}`}
                    title={`Bagikan ke ${c.name}`}
                  >
                    <span className="mb-1">{c.icon}</span>
                    <span className="text-[9px] font-black tracking-tight">{c.name.split(' ')[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Native Mobile Share Button (if available) */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#08B9EF] to-[#0598C7] hover:from-[#0598C7] hover:to-[#0482AB] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Share2 size={16} />
                <span>Buka Menu Berbagi Bawaan HP</span>
              </button>
            )}

            {/* Copy Link Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pl-3">
              <span className="text-xs text-slate-500 font-medium truncate flex-1 select-all">
                {currentUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#164C68] hover:bg-[#08B9EF] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
