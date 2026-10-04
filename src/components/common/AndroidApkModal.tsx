import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'install' | 'export'>('install');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback alert with instructions
      alert(
        'Untuk memasang di Android:\n1. Buka menu browser Chrome (titik tiga ⋮ di kanan atas)\n2. Pilih "Tambahkan ke Layar Utama" atau "Instal Aplikasi"\n3. Aplikasi akan langsung terpasang di HP seperti aplikasi APK native!'
      );
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(window.location.origin);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#C9E1ED] space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-500/25">
              🤖
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Aplikasi Android
              </span>
              <h3 className="text-base font-black text-[#164C68] font-heading">
                Pasang & Export APK Android
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#EEF8FF] p-1 rounded-2xl border border-[#C9E1ED] text-xs font-bold">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'install'
                ? 'bg-[#08B9EF] text-white shadow-xs'
                : 'text-[#8C9BA7] hover:text-[#164C68]'
            }`}
          >
            📲 Pasang Langsung
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#08B9EF] text-white shadow-xs'
                : 'text-[#8C9BA7] hover:text-[#164C68]'
            }`}
          >
            📦 Build & Export APK
          </button>
        </div>

        {/* TAB 1: Direct Android Install (PWA / WebAPK) */}
        {activeTab === 'install' && (
          <div className="space-y-3.5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-[#164C68] space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Format Standar Android (WebAPK / PWA)</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Aplikasi ini mendukung instalasi resmi Android tanpa iklan. Tampilan layar penuh
                (fullscreen standalone), bekerja lancar, hemat kuota, dan hemat penyimpanan HP anak.
              </p>
            </div>

            {isInstalled ? (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-center space-y-1">
                <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                <p className="text-xs font-black text-emerald-900">Aplikasi Sudah Terpasang!</p>
                <p className="text-[11px] text-emerald-700">
                  Kamu bisa membukanya langsung dari layar utama HP Android kapan saja.
                </p>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <Smartphone size={18} />
                <span>Pasang Sekarang di Layar Utama HP</span>
              </button>
            )}

            {/* Quick 3-Step Manual Instruction if prompt isn't supported */}
            <div className="bg-white border border-[#C9E1ED] rounded-2xl p-3.5 space-y-2 text-xs">
              <h4 className="font-black text-[#164C68]">Cara Pasang Manual di Google Chrome Android:</h4>
              <ol className="space-y-1.5 text-[11px] text-[#8C9BA7] font-medium list-decimal list-inside">
                <li>Buka aplikasi ini di browser Chrome HP Android Anda.</li>
                <li>
                  Ketuk ikon titik tiga <strong className="text-[#164C68]">⋮ (Menu)</strong> di sudut kanan atas Chrome.
                </li>
                <li>
                  Pilih <strong className="text-[#164C68]">"Tambahkan ke Layar Utama"</strong> atau{' '}
                  <strong className="text-[#164C68]">"Instal Aplikasi"</strong>.
                </li>
                <li>Ikon Cahaya Tahfiz Anak akan otomatis muncul di menu aplikasi HP!</li>
              </ol>
            </div>

            <button
              onClick={handleCopyUrl}
              className="w-full py-2.5 rounded-xl border border-[#C9E1ED] bg-slate-50 text-[#164C68] font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Share2 size={15} />
              <span>{isCopied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan untuk Dibuka di HP'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: Export Standalone APK Guidelines */}
        {activeTab === 'export' && (
          <div className="space-y-3.5 text-xs text-[#164C68]">
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#08B9EF] font-black">
                <Sparkles size={16} />
                <span>Panduan Export Standalone .APK</span>
              </div>
              <p className="text-[11px] text-[#164C68] leading-relaxed">
                Aplikasi telah dilengkapi file <code className="bg-white px-1.5 py-0.5 rounded border border-cyan-200 text-cyan-800">manifest.json</code>, service worker offline, dan icon beresolusi tinggi. Anda dapat mengemasnya menjadi file installer <code className="bg-white px-1.5 py-0.5 rounded border border-cyan-200 text-cyan-800">.apk</code> dalam hitungan detik:
              </p>
            </div>

            {/* Real-time Dynamic Sync Guarantee Card */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>100% Dinamis & Terhubung Langsung dengan Website</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                <strong>Ya, APK ini otomatis dinamis!</strong> Karena menggunakan standar resmi Google TWA (Trusted Web Activity), semua progres hafalan anak, audio murottal baru, dan perbaikan di website akan <strong>langsung terupdate otomatis di aplikasi HP</strong> tanpa anak atau orang tua harus men-download ulang APK.
              </p>
            </div>

            {/* Method 1: PWABuilder with direct 1-click launch */}
            <div className="space-y-2.5 border-2 border-[#08B9EF]/40 bg-[#EEF8FF]/50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#164C68] text-xs">
                  Metode 1: PWABuilder (1-Klik Siap Jadi APK)
                </h4>
                <span className="bg-[#08B9EF] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Rekomendasi
                </span>
              </div>
              <p className="text-[11px] text-[#8C9BA7] leading-relaxed">
                PWABuilder adalah alat resmi inisiasi Microsoft & Google untuk mengemas aplikasi web menjadi file installer Android (<code className="text-[#08B9EF] font-bold">.apk</code>) siap pasang.
              </p>

              <a
                href={`https://www.pwabuilder.com/reportcard?url=${encodeURIComponent(
                  window.location.origin
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#08B9EF] to-[#07a6d7] text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-cyan-500/20 active:scale-95 transition-all text-center block"
              >
                <span>Buka di PWABuilder (Generate APK Sekarang)</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Method 2: Google Bubblewrap CLI */}
            <div className="space-y-2 border border-[#C9E1ED] rounded-2xl p-3.5 bg-white">
              <h4 className="font-black text-[#164C68]">Metode 2: Google Bubblewrap (Command Line)</h4>
              <p className="text-[11px] text-[#8C9BA7] leading-relaxed">
                Jika Anda ingin build APK sendiri di terminal komputer:
              </p>
              <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto select-all">
                npm i -g @bubblewrap/cli<br />
                bubblewrap init --manifest={window.location.origin}/manifest.json<br />
                bubblewrap build
              </div>
            </div>

            <button
              onClick={() => {
                const jsonStr = JSON.stringify(
                  {
                    name: "Cahaya Tahfiz Anak",
                    package: "id.cahaya.tahfiz",
                    version: "1.0.0",
                    orientation: "portrait",
                    manifestUrl: `${window.location.origin}/manifest.json`,
                  },
                  null,
                  2
                );
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'android-app-config.json';
                a.click();
              }}
              className="w-full py-2.5 rounded-xl border border-[#C9E1ED] bg-white text-[#164C68] font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            >
              <Download size={15} />
              <span>Unduh Konfigurasi Build Android (JSON)</span>
            </button>
          </div>
        )}

        <div className="text-center pt-1">
          <button
            onClick={onClose}
            className="text-xs text-[#8C9BA7] hover:text-[#164C68] font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
