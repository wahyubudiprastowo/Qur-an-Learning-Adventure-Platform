import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { SharePayload } from './ShareModal';

interface FloatingSocialShareDockProps {
  onOpenShareModal: (payload?: SharePayload) => void;
  defaultPayload?: SharePayload;
}

export const FloatingSocialShareDock: React.FC<FloatingSocialShareDockProps> = ({
  onOpenShareModal,
  defaultPayload,
}) => {
  // Collapsed by default on small mobile screens to keep view clean, expanded on desktop
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cahaya-tahfiz.app';
  const title = defaultPayload?.title || "Cahaya Tahfiz - Belajar & Hafalan Al-Qur'an Anak Berbasis AI";
  const desc = defaultPayload?.text || "Temani anak menghafal Al-Qur'an dengan sahabat 3D interaktif, bimbingan AI tartil, dan game edukasi Islami!";

  const shareText = `${title}\n\n${desc}\n\n${currentUrl}`;
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
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const channels = [
    {
      name: 'Facebook',
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      bg: 'bg-black hover:bg-neutral-800',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      bg: 'bg-[#0A66C2] hover:bg-[#095196]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
    },
    {
      name: 'Telegram',
      bg: 'bg-[#2AABEE] hover:bg-[#229ed9]',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title + ' - ' + desc)}`,
      icon: <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white -rotate-12 translate-x-0.5" />,
    },
    {
      name: 'WhatsApp',
      bg: 'bg-[#25D366] hover:bg-[#20ba5a]',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
      icon: (
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.071.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824zm-3.423-10.416c-4.401 0-7.98 3.58-7.98 7.98 0 1.41.369 2.733 1.011 3.882l-1.074 3.923 4.025-1.056c1.109.605 2.378.948 3.731.948 4.402 0 7.98-3.579 7.98-7.979 0-4.401-3.578-7.98-7.98-7.98zm0 14.364c-1.203 0-2.332-.336-3.303-.923l-.236-.142-2.457.644.655-2.395-.156-.248c-.649-1.034-.993-2.234-.993-3.48 0-3.518 2.862-6.38 6.38-6.38 3.519 0 6.381 2.862 6.381 6.38 0 3.519-2.862 6.38-6.381 6.38z"/>
        </svg>
      ),
    },
    {
      name: 'LINE',
      bg: 'bg-[#00C300] hover:bg-[#00ab00]',
      url: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      icon: (
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.49.254l2.462 3.33V8.108c0-.345.282-.63.625-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      className="fixed right-2 sm:right-4 bottom-20 sm:bottom-24 z-30 flex items-center select-none pointer-events-auto"
    >
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.div
            key="expanded-dock"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex flex-col items-center bg-white/95 backdrop-blur-md border border-[#C9E1ED] shadow-xl rounded-full py-1.5 px-1 sm:py-2 sm:px-1.5 gap-1.5 sm:gap-2"
          >
            {/* 1. Main Share Button */}
            <button
              onClick={() => onOpenShareModal(defaultPayload)}
              title="Buka Menu Berbagi Lengkap"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#08B9EF] to-[#0496C3] text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              <Share2 size={16} />
            </button>

            {/* 2. Social Media Icon Channels */}
            {channels.map((ch) => (
              <a
                key={ch.name}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Bagikan ke ${ch.name}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${ch.bg} flex items-center justify-center shadow-2xs hover:scale-110 active:scale-95 transition-transform cursor-pointer`}
              >
                {ch.icon}
              </a>
            ))}

            {/* 3. Quick Copy Link */}
            <button
              onClick={handleCopyLink}
              title={copied ? 'Tautan Tersalin!' : 'Salin Tautan'}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-110'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>

            {/* 4. Collapse Toggle Button (chevron right > exactly like Parroto screenshot) */}
            <button
              onClick={() => setIsCollapsed(true)}
              title="Sembunyikan Menu Share"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer mt-0.5"
            >
              <ChevronRight size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed-pill"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsCollapsed(false)}
            title="Tampilkan Menu Share"
            className="flex items-center gap-1 bg-white/95 hover:bg-white backdrop-blur-md text-[#164C68] hover:text-[#08B9EF] border border-[#C9E1ED] shadow-lg py-2 px-1.5 sm:px-2 rounded-l-2xl cursor-pointer hover:shadow-xl transition-all group"
          >
            <ChevronLeft size={16} className="text-[#08B9EF] group-hover:-translate-x-0.5 transition-transform" />
            <Share2 size={15} className="text-[#08B9EF]" />
            <span className="hidden sm:inline text-[11px] font-black tracking-tight text-[#164C68]">
              Share
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
