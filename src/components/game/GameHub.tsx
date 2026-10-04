import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Volume2,
  Trophy,
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { getAyahAudioUrl } from '../../data/recitersData';
import { Button } from '../common/Button';
import { RewardModal } from '../common/RewardModal';
import { WorldMapView } from '../companion/WorldMapView';

export type GameType =
  | 'continue_ayah'
  | 'arrange_ayah'
  | 'missing_word'
  | 'arabic_matching'
  | 'hijaiyah_sound'
  | 'tajwid_class'
  | 'guess_surah'
  | 'audio_to_ayah'
  | null;

interface GameHubProps {
  childId: string;
  onNavigateToLand?: (tab: 'tahfiz' | 'alquran', subView?: string) => void;
}

interface QuizItem {
  question: string;
  arabicPrompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audioInfo?: { surah: number; ayah: number };
}

export const GameHub: React.FC<GameHubProps> = ({ childId, onNavigateToLand }) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [companionStateVersion, setCompanionStateVersion] = useState<number>(0);

  const activeChild = StorageService.getActiveChild();
  const companion = CompanionService.getCompanionData(childId);

  // 8 Games catalog with child-friendly questions and verified Quran content
  const gamesList = [
    {
      id: 'continue_ayah' as GameType,
      title: 'Sambung Ayat',
      subtitle: 'Tebak lanjutan potongan ayat berikutnya',
      icon: '🔗',
      badge: 'Populer',
      color: 'bg-[#08B9EF]',
    },
    {
      id: 'arrange_ayah' as GameType,
      title: 'Susun Ayat',
      subtitle: 'Urutkan potongan kata menjadi ayat yang tepat',
      icon: '🧩',
      badge: 'Asyik',
      color: 'bg-[#81E850]',
    },
    {
      id: 'missing_word' as GameType,
      title: 'Kata yang Hilang',
      subtitle: 'Isi bagian ayat yang tersembunyi',
      icon: '🔍',
      badge: 'Fokus',
      color: 'bg-[#FF946F]',
    },
    {
      id: 'arabic_matching' as GameType,
      title: 'Cocokkan Kata & Arti',
      subtitle: 'Pasangkan kata Arab dengan artinya',
      icon: '🎯',
      badge: 'Kosakata',
      color: 'bg-[#B797F6]',
    },
    {
      id: 'hijaiyah_sound' as GameType,
      title: 'Tebak Suara Huruf',
      subtitle: 'Dengar bunyi huruf hijaiyah lalu tebak',
      icon: '🎧',
      badge: 'Iqra',
      color: 'bg-[#FFD83E]',
    },
    {
      id: 'tajwid_class' as GameType,
      title: 'Klasifikasi Tajwid',
      subtitle: 'Kelompokkan hukum nun sukun & tanwin',
      icon: '🏷️',
      badge: 'Tajwid',
      color: 'bg-[#08B9AA]',
    },
    {
      id: 'guess_surah' as GameType,
      title: 'Tebak Nama Surah',
      subtitle: 'Cari tahu nama surah dari ciri & artinya',
      icon: '💡',
      badge: 'Cerdas',
      color: 'bg-[#48CAE4]',
    },
    {
      id: 'audio_to_ayah' as GameType,
      title: 'Dengar & Pilih Ayat',
      subtitle: 'Dengar lantunan qari lalu tentukan ayatnya',
      icon: '🎵',
      badge: 'Tartil',
      color: 'bg-[#FF7A50]',
    },
  ];

  // Specific, 100% verified question catalogs per game
  const gameQuizzes: Record<string, QuizItem[]> = {
    continue_ayah: [
      {
        question: 'Lanjutkan potongan ayat Surah Al-Ikhlas berikut:',
        arabicPrompt: 'قُلْ هُوَ اللّٰهُ ...',
        options: ['اَحَدٌ', 'الصَّمَدُ', 'الْفَلَقِ', 'الرَّحِيْمِ'],
        correctIndex: 0,
        explanation: 'Surah Al-Ikhlas ayat 1: "Qul huwallāhu aḥad".',
      },
      {
        question: 'Manakah lanjutan dari ayat surah Al-Fatihah ini?',
        arabicPrompt: 'اِيَّاكَ نَعْبُدُ وَاِيَّاكَ ...',
        options: ['نَسْتَعِيْنُ', 'الْمُسْتَقِيْمَ', 'الرَّحِيْمِ', 'الدِّيْنِ'],
        correctIndex: 0,
        explanation: 'Surah Al-Fatihah ayat 5: "Iyyāka na\'budu wa iyyāka nasta\'īn".',
      },
      {
        question: 'Lengkapi ayat surah An-Nas berikut:',
        arabicPrompt: 'مِنْ شَرِّ الْوَسْوَاسِ ...',
        options: ['الْخَنَّاسِ', 'النَّاسِ', 'الْفَلَقِ', 'الْمَسَدِ'],
        correctIndex: 0,
        explanation: 'Surah An-Nas ayat 4: "Min syarril-waswāsil-khannās".',
      },
      {
        question: 'Lanjutkan ayat surah Al-Kausar berikut:',
        arabicPrompt: 'اِنَّآ اَعْطَيْنٰكَ ...',
        options: ['الْكَوْثَرَ', 'الْاَبْتَرَ', 'الْفَلَقَ', 'الصَّمَدَ'],
        correctIndex: 0,
        explanation: 'Surah Al-Kausar ayat 1: "Innā a\'ṭainākal-kauṡar".',
      },
    ],
    arrange_ayah: [
      {
        question: 'Kata apakah yang mengawali surah Al-Fatihah ayat 2?',
        arabicPrompt: '... لِلّٰهِ رَبِّ الْعٰلَمِيْنَ',
        options: ['اَلْحَمْدُ', 'بِسْمِ', 'الرَّحْمٰنِ', 'مٰلِكِ'],
        correctIndex: 0,
        explanation: 'Ayat diawali dengan "Alhamdu lillāhi rabbil-\'ālamīn".',
      },
      {
        question: 'Pilihlah kata penutup untuk ayat surah Al-Falaq ini:',
        arabicPrompt: 'قُلْ اَعُوْذُ بِرَبِّ ...',
        options: ['الْفَلَقِ', 'النَّاسِ', 'الْعَصْرِ', 'الْفِيْلِ'],
        correctIndex: 0,
        explanation: 'Surah Al-Falaq ayat 1 berbunyi "Qul a\'ūżu birabbil-falaq".',
      },
      {
        question: 'Manakah kata yang tepat untuk melengkapi surah Al-Asr?',
        arabicPrompt: 'وَالْعَصْرِ ۙ اِنَّ الْاِنْسَانَ لَفِيْ ...',
        options: ['خُسْرٍ', 'يُسْرٍ', 'نَعِيْمٍ', 'سَقَرٍ'],
        correctIndex: 0,
        explanation: 'Surah Al-\'Asr ayat 2: "Innal-insāna lafī khusr".',
      },
    ],
    missing_word: [
      {
        question: 'Isi kata yang hilang pada ayat berikut:',
        arabicPrompt: 'اَللّٰهُ [...]',
        options: ['الصَّمَدُ', 'الْاَحَدُ', 'الرَّحْمٰنُ', 'الْعَلِيْمُ'],
        correctIndex: 0,
        explanation: 'Surah Al-Ikhlas ayat 2: "Allāhuṣ-ṣamad".',
      },
      {
        question: 'Kata apakah yang hilang dalam ayat surah Al-Quraisy ini?',
        arabicPrompt: 'فَلْيَعْبُدُوْا رَبَّ هٰذَا [...]',
        options: ['الْبَيْتِ', 'الْبَلَدِ', 'الْقَوْمِ', 'النَّاسِ'],
        correctIndex: 0,
        explanation: 'Surah Quraisy ayat 3: "Falya\'budū rabba hāżal-baīt".',
      },
      {
        question: 'Isi kata yang hilang pada surah An-Nasr:',
        arabicPrompt: 'اِذَا جَاۤءَ نَصْرُ اللّٰهِ [...]',
        options: ['وَالْفَتْحُ', 'وَالصَّبْرُ', 'وَالنُّوْرُ', 'وَالْحَقُّ'],
        correctIndex: 0,
        explanation: 'Surah An-Nasr ayat 1: "Iżā jā\'a naṣrullāhi wal-fatḥ".',
      },
    ],
    arabic_matching: [
      {
        question: 'Apa arti dari kata Arab "رَبِّ" (Rabbi)?',
        arabicPrompt: 'رَبِّ',
        options: ['Tuhan Pemelihara', 'Maha Raja', 'Cahaya Terang', 'Malaikat'],
        correctIndex: 0,
        explanation: '"Rabbi" artinya Tuhan Yang Maha Memelihara dan Mengatur seluruh alam.',
      },
      {
        question: 'Apa arti dari kata "الصِّرَاطَ" (Ash-Shirāth)?',
        arabicPrompt: 'الصِّرَاطَ',
        options: ['Jalan yang Lurus', 'Pahala Besar', 'Gunung Tinggi', 'Surga'],
        correctIndex: 0,
        explanation: '"Ash-Shirāth" artinya jalan yang terang dan lurus.',
      },
      {
        question: 'Apa arti dari nama surah "الْفَلَقِ" (Al-Falaq)?',
        arabicPrompt: 'الْفَلَقِ',
        options: ['Waktu Fajar / Subuh', 'Malam Gelap', 'Manusia', 'Gugusan Bintang'],
        correctIndex: 0,
        explanation: '"Al-Falaq" artinya fajar atau waktu subuh yang membelah kegelapan.',
      },
    ],
    hijaiyah_sound: [
      {
        question: 'Huruf apakah yang memiliki titik satu di bawah?',
        arabicPrompt: 'ب',
        options: ['Ba (ب)', 'Ta (ت)', 'Tsa (ث)', 'Nun (ن)'],
        correctIndex: 0,
        explanation: 'Huruf Ba (ب) memiliki satu titik di bagian bawah perahunya.',
      },
      {
        question: 'Huruf apakah yang berbunyi desis halus dengan tiga titik di atas?',
        arabicPrompt: 'ث',
        options: ['Tsa (ث)', 'Shin (ش)', 'Ta (ت)', 'Ya (ي)'],
        correctIndex: 0,
        explanation: 'Huruf Tsa (ث) memiliki tiga titik di atas dan berbunyi lembut di ujung lidah.',
      },
      {
        question: 'Manakah huruf Jim yang bertanda fathah?',
        arabicPrompt: 'جَ',
        options: ['Ja (جَ)', 'Ji (جِ)', 'Ju (جُ)', 'Jan (جًا)'],
        correctIndex: 0,
        explanation: 'Huruf Jim berharakat fathah dibaca "Ja".',
      },
    ],
    tajwid_class: [
      {
        question: 'Hukum tajwid apakah pada kata "مِنْ شَرِّ" (Nun sukun bertemu Syin)?',
        arabicPrompt: 'مِنْ شَرِّ',
        options: ['Ikhfa Haqiqi (Samar)', 'Izhar Halqi (Jelas)', 'Iqlab', 'Idgham'],
        correctIndex: 0,
        explanation: 'Nun sukun bertemu huruf Syin dibaca samar dengan dengung (Ikhfa Haqiqi).',
      },
      {
        question: 'Hukum tajwid apakah pada "مَنْ يَّعْمَلْ" (Nun sukun bertemu Ya)?',
        arabicPrompt: 'مَنْ يَّعْمَلْ',
        options: ['Idgham Bighunnah', 'Idgham Bilaghunnah', 'Izhar', 'Ikhfa'],
        correctIndex: 0,
        explanation: 'Nun sukun bertemu Ya masuk dan melebur dengan dengung (Idgham Bighunnah).',
      },
      {
        question: 'Hukum tajwid apakah pada kata "مِنْ بَعْدِ" (Nun sukun bertemu Ba)?',
        arabicPrompt: 'مِنْ بَعْدِ',
        options: ['Iqlab (Berubah jadi Mim)', 'Izhar Halqi', 'Qalqalah', 'Mad Thabi\'i'],
        correctIndex: 0,
        explanation: 'Nun sukun bertemu huruf Ba dibaca Iqlab (berubah menjadi suara Mim samar).',
      },
    ],
    guess_surah: [
      {
        question: 'Surah apakah yang menceritakan hancurnya pasukan gajah oleh burung Ababil?',
        arabicPrompt: 'اَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِاَصْحٰبِ الْفِيْلِ',
        options: ['Al-Fil (Gajah)', 'Quraisy', 'Al-Kausar', 'Al-Maun'],
        correctIndex: 0,
        explanation: 'Surah Al-Fil menceritakan kekalahan Raja Abrahah dan pasukan gajahnya.',
      },
      {
        question: 'Surah apakah yang sering disebut "Induk Al-Qur\'an" (Ummul Kitab)?',
        arabicPrompt: 'اُمُّ الْكِتَابِ',
        options: ['Al-Fatihah', 'Al-Baqarah', 'Yasin', 'Al-Ikhlas'],
        correctIndex: 0,
        explanation: 'Surah Al-Fatihah adalah pembuka dan induk Al-Qur\'an.',
      },
      {
        question: 'Surah apakah yang menegaskan keesaan Allah tanpa sekutu?',
        arabicPrompt: 'قُلْ هُوَ اللّٰهُ اَحَدٌ',
        options: ['Al-Ikhlas', 'An-Nas', 'Al-Falaq', 'Al-Kafirun'],
        correctIndex: 0,
        explanation: 'Surah Al-Ikhlas adalah surah kemurnian tauhid mengesakan Allah Swt.',
      },
    ],
    audio_to_ayah: [
      {
        question: 'Dengarkan potongan lantunan qari ini, manakah ayat yang sedang dibacakan?',
        arabicPrompt: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِ',
        options: [
          'An-Nas Ayat 1 (قُلْ اَعُوْذُ بِرَبِّ النَّاسِ)',
          'Al-Falaq Ayat 1 (قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِ)',
          'Al-Ikhlas Ayat 1 (قُلْ هُوَ اللّٰهُ اَحَدٌ)',
          'Al-Fatihah Ayat 1 (بِسْمِ اللّٰهِ)',
        ],
        correctIndex: 0,
        explanation: 'Lantunan tersebut adalah Surah An-Nas ayat ke-1.',
        audioInfo: { surah: 114, ayah: 1 },
      },
      {
        question: 'Manakah tulisan ayat yang sesuai dengan lantunan ini?',
        arabicPrompt: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ',
        options: [
          'Al-Kausar Ayat 1 (اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَ)',
          'Al-Kafirun Ayat 1 (قُلْ يٰٓاَيُّهَا الْكٰفِرُوْنَ)',
          'An-Nasr Ayat 1 (اِذَا جَاۤءَ نَصْرُ اللّٰهِ)',
          'Al-Masad Ayat 1 (تَبَّتْ يَدَآ اَبِيْ لَهَبٍ)',
        ],
        correctIndex: 0,
        explanation: 'Lantunan tersebut adalah Surah Al-Kausar ayat ke-1.',
        audioInfo: { surah: 108, ayah: 1 },
      },
    ],
  };

  const activeQuestions = activeGame ? gameQuizzes[activeGame] || gameQuizzes.continue_ayah : [];
  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  const handleStartGame = (gameId: GameType) => {
    setActiveGame(gameId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 10);
    }
  };

  const handlePlayQuizAudio = () => {
    if (!currentQ.audioInfo) return;
    const url = getAyahAudioUrl('alafasy', currentQ.audioInfo.surah, currentQ.audioInfo.ayah);
    const audio = new Audio(url);
    audio.play().catch(() => {});
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed game - Diminishing XP logic (10 XP first 3, 5 XP next 3, 0 afterwards to prevent farming)
      const earnedXp = CompanionService.getGameXpReward(childId);
      const earnedStars = 5;

      StorageService.recordPoints(
        childId,
        'GAME',
        earnedXp,
        earnedStars,
        `Bermain game Qur'an: ${activeGame}`,
        'game',
        activeGame || 'game'
      );

      // Record activity in Companion service to boost Explorer trait & check daily quests
      CompanionService.recordActivity(childId, 'game', earnedXp, earnedStars);
      setCompanionStateVersion((v) => v + 1);

      setShowCelebration(true);
    }
  };

  // --- Render 1: Interactive Play Screen for Selected Game ---
  if (activeGame && currentQ) {
    const currentGame = gamesList.find((g) => g.id === activeGame) || gamesList[0];

    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#164C68] hover:text-[#08B9EF] cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Pilih Game Lain / Kembali</span>
          </button>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-amber-700 font-black text-xs">
            <Star size={14} className="fill-yellow-400 text-yellow-500" />
            <span>Skor: {score}</span>
          </div>
        </div>

        {/* Game Question Card */}
        <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-6 shadow-sm space-y-4 text-center">
          <div className="flex items-center justify-between text-xs text-[#8C9BA7] font-semibold">
            <span className="font-heading font-bold text-[#164C68]">
              {currentGame.title}
            </span>
            <span>
              Soal {currentQuestionIndex + 1} dari {activeQuestions.length}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#164C68] font-heading">
            {currentQ.question}
          </h3>

          {/* Audio helper if audio_to_ayah */}
          {currentQ.audioInfo && (
            <div className="flex justify-center">
              <button
                onClick={handlePlayQuizAudio}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#08B9EF] text-white font-bold text-xs shadow-sm hover:bg-[#07a6d7] active:scale-95 transition-all cursor-pointer"
              >
                <Volume2 size={16} />
                <span>Putar Suara Qari</span>
              </button>
            </div>
          )}

          {/* Large Authentic Arabic Question Prompt */}
          <div className="my-4 py-4 bg-[#EEF8FF] rounded-2xl border border-[#C9E1ED] px-4">
            <p dir="rtl" className="font-quran text-2xl sm:text-3xl text-[#164C68] font-bold leading-relaxed">
              {currentQ.arabicPrompt}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED] hover:bg-[#d8eefc]';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500 text-white border-rose-600 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`min-h-[58px] p-3 rounded-2xl border-2 font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                >
                  <span dir="auto" className="font-sans leading-tight">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {isAnswered && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed animate-in fade-in ${
                selectedOption === currentQ.correctIndex
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {selectedOption === currentQ.correctIndex ? 'Masya Allah, Benar!' : 'Belum tepat.'}{' '}
              {currentQ.explanation}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <Button
              variant="green"
              size="lg"
              fullWidth
              onClick={handleNextQuestion}
              icon={<CheckCircle2 size={18} />}
            >
              {currentQuestionIndex < activeQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Game'}
            </Button>
          )}
        </div>

        {/* Celebration Modal */}
        <RewardModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setActiveGame(null);
          }}
          title="Permainan Selesai!"
          message={`Skor akhir kamu: ${score}. Terus asah hafalanmu dengan game-game seru lainnya!`}
          starsEarned={5}
          xpEarned={15}
          nextLabel="Kembali ke Dunia & Game"
          onNext={() => {
            setShowCelebration(false);
            setActiveGame(null);
          }}
        />
      </div>
    );
  }

  // --- Render 2: Signature World Map & Adventure Hub ---
  return (
    <WorldMapView
      child={activeChild}
      companion={companion}
      onNavigateToLand={(tab, subView) => {
        onNavigateToLand?.(tab, subView);
      }}
      onRefreshCompanion={() => setCompanionStateVersion((v) => v + 1)}
      onLaunchMiniGame={(gameId) => handleStartGame(gameId as GameType)}
    />
  );
};
