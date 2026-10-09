import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Heart,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Compass,
  Star,
  BookOpen,
  Calendar,
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PusatIbadahDoaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DoaItem {
  id: string;
  category: 'hafalan' | 'harian' | 'masjid' | 'adab';
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  benefit: string;
}

const DOA_LIST: DoaItem[] = [
  {
    id: 'doa-belajar-quran',
    category: 'hafalan',
    title: 'Doa Sebelum Menghafal & Belajar Al-Qur\'an',
    arabic: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا وَاجْعَلْنِي مِنَ الصَّالِحِينَ',
    latin: "Rabbi zidnii 'ilman warzuqnii fahman waj'alnii minash-shaalihiin.",
    translation: 'Ya Tuhanku, tambahkanlah ilmuku, karuniakanlah pemahaman yang mendalam, dan jadikanlah aku termasuk golongan orang-orang yang sholeh.',
    benefit: 'Membuka kelapangan dada dan ketajaman daya ingat saat menghafal ayat-ayat baru.',
  },
  {
    id: 'doa-khatmil-quran',
    category: 'hafalan',
    title: 'Doa Senandung Kasih Al-Qur\'an (Khatmil Qur\'an)',
    arabic: 'اللَّهُمَّ ارْحَمْنَا بِالْقُرْآنِ وَاجْعَلْهُ لَنَا إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
    latin: "Allahummarhamnaa bil Qur'aan, waj'alhu lanaa imaaman wa nuuran wa hudan wa rahmah.",
    translation: 'Ya Allah, sayangilah kami dengan Al-Qur\'an, jadikanlah ia bagi kami sebagai pedoman, cahaya, petunjuk, dan rahmat.',
    benefit: 'Dianjurkan dibaca setelah sesi murojaah dan tilawah agar Al-Qur\'an menjadi syafaat.',
  },
  {
    id: 'doa-orang-tua',
    category: 'harian',
    title: 'Doa untuk Kedua Orang Tua',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin: "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.",
    translation: 'Ya Allah, ampunilah dosaku dan kedua orang tuaku, dan sayangilah mereka berdua sebagaimana mereka telah menyayangiku sewaktu kecil.',
    benefit: 'Kunci keberkahan ilmu santri dan pintu pembuka ridho Allah SWT.',
  },
  {
    id: 'doa-sebelum-tidur',
    category: 'harian',
    title: 'Doa Sebelum Tidur',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
    latin: 'Bismikallaahumma ahyaa wa amuut.',
    translation: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.',
    benefit: 'Perlindungan dari gangguan mimpi buruk dan menjaga hafalan tersimpan baik di memori tidur.',
  },
  {
    id: 'doa-bangun-tidur',
    category: 'harian',
    title: 'Doa Bangun Tidur',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: "Alhamdulillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur.",
    translation: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya lah tempat kembali.',
    benefit: 'Memulai hari santri dengan rasa syukur dan semangat menyambut fajar.',
  },
  {
    id: 'doa-masuk-masjid',
    category: 'masjid',
    title: 'Doa Masuk Masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: 'Allaahummaftah lii abwaaba rahmatik.',
    translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    benefit: 'Mendapat ketenangan bathin dan keberkahan setiap melangkah ke rumah Allah.',
  },
  {
    id: 'doa-keluar-masjid',
    category: 'masjid',
    title: 'Doa Keluar Masjid',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    latin: 'Allaahumma innii as-aluka min fadhlik.',
    translation: 'Ya Allah, sesungguhnya aku memohon karunia kemurahan-Mu.',
    benefit: 'Membawa berkah ibadah kembali ke dalam aktivitas santri sehari-hari.',
  },
  {
    id: 'doa-kebaikan-dunia-akhirat',
    category: 'adab',
    title: 'Doa Sapu Jagad (Kebaikan Dunia & Akhirat)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: 'Rabbanaa aatinaa fid-dunyaa hasanah wa fil-aakhirati hasanah wa qinaa adzaaban-naar.',
    translation: 'Ya Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari siksa api neraka.',
    benefit: 'Doa yang paling sering dibaca oleh Rasulullah SAW mencakup seluruh hajat.',
  },
];

export const PusatIbadahDoaModal: React.FC<PusatIbadahDoaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'doa' | 'tasbih'>('jadwal');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hafalan' | 'harian' | 'masjid' | 'adab'>('all');
  const [copiedDoaId, setCopiedDoaId] = useState<string | null>(null);
  const [playingDoaId, setPlayingDoaId] = useState<string | null>(null);

  // Digital Tasbih State
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [tasbihTarget, setTasbihTarget] = useState<number>(33);
  const [tasbihZikir, setTasbihZikir] = useState<string>('Subhanallah');

  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Static prayer schedules for Indonesia (WIB baseline)
  const prayerSchedule = [
    { name: 'Subuh', time: '04:36', icon: Sunrise, color: 'text-amber-500', isGoldenHafalan: true },
    { name: 'Terbit', time: '05:52', icon: Sun, color: 'text-orange-400', isGoldenHafalan: false },
    { name: 'Dzuhur', time: '11:58', icon: Sun, color: 'text-yellow-500', isGoldenHafalan: false },
    { name: 'Ashar', time: '15:14', icon: Sunset, color: 'text-orange-500', isGoldenHafalan: false },
    { name: 'Maghrib', time: '17:59', icon: Moon, color: 'text-indigo-400', isGoldenHafalan: true },
    { name: 'Isya', time: '19:08', icon: Moon, color: 'text-purple-500', isGoldenHafalan: false },
  ];

  const handleCopyDoa = (item: DoaItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\n${item.latin}\n\nArtinya: "${item.translation}"\n\n(Aplikasi Cahaya Tahfiz Santri)`;
    navigator.clipboard.writeText(text);
    setCopiedDoaId(item.id);
    setTimeout(() => setCopiedDoaId(null), 2500);
  };

  const handleSpeakDoa = (item: DoaItem) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPlayingDoaId(item.id);

      const utterance = new SpeechSynthesisUtterance(item.arabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingDoaId(null);
      utterance.onerror = () => setPlayingDoaId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTasbihClick = () => {
    const nextCount = tasbihCount + 1;
    setTasbihCount(nextCount);

    if (nextCount === tasbihTarget) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const filteredDoa =
    selectedCategory === 'all'
      ? DOA_LIST
      : DOA_LIST.filter((d) => d.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl border border-[#C9E1ED] shadow-2xl max-w-2xl w-full overflow-hidden my-4 relative font-sans text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* TOP HEADER */}
        <div className="pt-7 pb-5 px-6 bg-gradient-to-b from-sky-50 via-cyan-50/40 to-white border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#08B9EF] to-teal-400 text-white flex items-center justify-center text-2xl shadow-md ring-4 ring-cyan-100 shrink-0">
              🕌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-heading text-[#164C68] tracking-tight">
                  Pusat Ibadah, Sholat & Doa Santri
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                  HARIAN
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Jadwal sholat 5 waktu, waktu emas hafalan Al-Qur'an, doa anak sholeh, & tasbih digital interaktif.
              </p>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('jadwal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'jadwal'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock size={13} />
              <span>Jadwal Sholat & Waktu Emas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doa')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'doa'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={13} />
              <span>Koleksi Doa Santri ({DOA_LIST.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasbih')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tasbih'
                  ? 'bg-[#164C68] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Tasbih Digital Santri</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {/* TAB 1: JADWAL SHOLAT & WAKTU EMAS HAFALAN */}
          {activeTab === 'jadwal' && (
            <div className="space-y-4">
              {/* Golden Hours Alert Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-md space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h4 className="text-sm font-black font-heading tracking-tight">
                    Waktu Emas Menghafal Al-Qur'an (Golden Hours)
                  </h4>
                </div>
                <p className="text-xs text-amber-50 leading-relaxed font-medium">
                  Menurut ulama tahfiz, <strong>Ba'da Subuh</strong> (05:00 - 06:30) dan <strong>Ba'da Maghrib</strong> (18:15 - 19:00) adalah waktu konsentrasi otak santri paling tajam untuk menyerap hafalan baru (Ziadah) dan memperkuat Murojaah!
                </p>
              </div>

              {/* Live Clock & Schedule Grid */}
              <div className="p-4 bg-[#EEF8FF] border border-[#C9E1ED] rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs text-[#164C68]">
                  <span className="font-bold flex items-center gap-1.5">
                    <Clock size={14} className="text-[#08B9EF]" />
                    <span>Waktu Saat Ini:</span>
                  </span>
                  <span className="font-mono font-black text-sm text-[#08B9EF]">
                    {currentTime.toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {prayerSchedule.map((p) => {
                    const IconComp = p.icon;
                    return (
                      <div
                        key={p.name}
                        className={`p-3 rounded-2xl text-center border transition-all ${
                          p.isGoldenHafalan
                            ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <IconComp size={18} className={`mx-auto mb-1 ${p.color}`} />
                        <span className="text-[11px] font-bold text-slate-600 block">
                          {p.name}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#164C68] font-mono block">
                          {p.time}
                        </span>
                        {p.isGoldenHafalan && (
                          <span className="text-[8px] font-black uppercase text-amber-800 bg-amber-200/70 px-1 py-0.2 rounded-full inline-block mt-0.5">
                            Tahfiz
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sunnah Fasting & Reminders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                    <Calendar size={14} />
                    <span>Jadwal Puasa Sunnah Santri</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Setiap hari <strong>Senin & Kamis</strong> serta <strong>Ayyamul Bidh</strong> (13, 14, 15 Hijriyah) sangat dianjurkan untuk melatih kesabaran hafiz cilik.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl space-y-1 text-sky-950">
                  <div className="flex items-center gap-2 font-bold text-xs text-sky-800">
                    <Compass size={14} />
                    <span>Adab Sebelum Memulai Hafalan</span>
                  </div>
                  <p className="text-[11px] text-sky-900 leading-relaxed">
                    Berwudhu dengan sempurna, menghadap kiblat, dan membaca ta'awwudz serta doa sebelum menatap mushaf Al-Qur'an.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOLEKSI DOA SANTRI */}
          {activeTab === 'doa' && (
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'Semua Doa' },
                  { id: 'hafalan', label: '📖 Hafalan & Qur\'an' },
                  { id: 'harian', label: '☀️ Doa Harian' },
                  { id: 'masjid', label: '🕌 Masjid' },
                  { id: 'adab', label: '🌟 Adab Santri' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-[#164C68] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Doa Cards List */}
              <div className="space-y-3">
                {filteredDoa.map((doa) => (
                  <div
                    key={doa.id}
                    className="p-4 bg-white border border-[#C9E1ED] hover:border-[#08B9EF] rounded-3xl shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#164C68] font-heading">
                        {doa.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSpeakDoa(doa)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            playingDoaId === doa.id
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Putar Lafal Suara"
                        >
                          <Volume2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyDoa(doa)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Salin Doa"
                        >
                          {copiedDoaId === doa.id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-amber-100 text-right">
                      <p className="text-lg sm:text-xl font-arabic leading-loose text-slate-900 font-bold">
                        {doa.arabic}
                      </p>
                    </div>

                    <p className="text-xs font-medium text-slate-600 italic">
                      "{doa.latin}"
                    </p>

                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                      Artinya: {doa.translation}
                    </p>

                    <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10px] text-emerald-900 font-medium flex items-center gap-1.5">
                      <Sparkles size={12} className="text-emerald-600 shrink-0" />
                      <span>{doa.benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TASBIH DIGITAL SANTRI */}
          {activeTab === 'tasbih' && (
            <div className="space-y-4 text-center">
              {/* Preset Selector */}
              <div className="flex justify-center gap-2 flex-wrap">
                {[
                  { name: 'Subhanallah', target: 33 },
                  { name: 'Alhamdulillah', target: 33 },
                  { name: 'Allahu Akbar', target: 33 },
                  { name: 'Astaghfirullah', target: 100 },
                  { name: 'Shalawat Nabi', target: 100 },
                ].map((z) => (
                  <button
                    key={z.name}
                    type="button"
                    onClick={() => {
                      setTasbihZikir(z.name);
                      setTasbihTarget(z.target);
                      setTasbihCount(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tasbihZikir === z.name
                        ? 'bg-[#164C68] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {z.name} ({z.target}x)
                  </button>
                ))}
              </div>

              {/* Big Interactive Counter Card */}
              <div className="p-6 bg-gradient-to-b from-[#164C68] to-[#0d3143] text-white rounded-3xl shadow-xl space-y-4 max-w-sm mx-auto">
                <span className="text-xs font-bold text-cyan-200 tracking-wider uppercase block">
                  Lafadz Zikir Santri
                </span>
                <h3 className="text-2xl font-black font-heading text-amber-300">
                  {tasbihZikir}
                </h3>

                {/* Big Button Ring */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleTasbihClick}
                    className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-[#08B9EF] to-teal-400 hover:from-[#07a6d7] hover:to-teal-300 text-white shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all ring-8 ring-cyan-500/30"
                  >
                    <span className="text-4xl font-black font-mono tracking-tight">
                      {tasbihCount}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-100 mt-1">
                      Target: {tasbihTarget}x
                    </span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-200"
                      style={{ width: `${Math.min(100, (tasbihCount / tasbihTarget) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-cyan-200 font-bold">
                    <span>Progres: {Math.round((tasbihCount / tasbihTarget) * 100)}%</span>
                    <span>Sisa: {Math.max(0, tasbihTarget - tasbihCount)}x</span>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => setTasbihCount(0)}
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Hitungan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
