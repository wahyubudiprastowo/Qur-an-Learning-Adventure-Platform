import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Swords,
  Trophy,
  Shield,
  Zap,
  Flame,
  Clock,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  Users,
  Award,
  Heart,
  Volume2,
  Copy,
  Check,
  Share2,
  Smile,
  Send,
  MessageCircle,
  Crown,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Star,
} from 'lucide-react';
import { SoundEffects } from '../../services/soundEffects';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { globalDuelSocket, DuelPlayer } from '../../services/duelWebSocketService';
import { DUEL_QUESTIONS_CATALOG, DuelQuestion } from '../../data/duelQuestionsData';
import { Button } from '../common/Button';

interface SantriDuelArenaProps {
  childId: string;
  onBack: () => void;
  onFinish?: (score: number) => void;
}

interface LeaderboardItem {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  schoolName: string;
  score: number;
  isBot: boolean;
  isCurrentPlayer: boolean;
  streak: number;
  tierBadge: string;
}

const CHAT_EMOTES = [
  'Assalamu\'alaikum! 👋',
  'Bismillah, siap! ⚔️',
  'MasyaAllah! 🌟',
  'Semangat ya! 💪',
  'Takbir! ☝️',
  'Alhamdulillah! 🤲',
];

export const SantriDuelArena: React.FC<SantriDuelArenaProps> = ({
  childId,
  onBack,
  onFinish,
}) => {
  const activeChild = StorageService.getActiveChild();
  const [screen, setScreen] = useState<'lobby_select' | 'room_lobby' | 'playing' | 'gameover'>('lobby_select');
  const [lobbySubTab, setLobbySubTab] = useState<'quick' | 'create' | 'join' | 'leaderboard'>('quick');

  // Room State
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [isSearchingPeer, setIsSearchingPeer] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Players
  const [hostPlayer, setHostPlayer] = useState<DuelPlayer | null>(null);
  const [guestPlayer, setGuestPlayer] = useState<DuelPlayer | null>(null);
  const [chatEmotesReceived, setChatEmotesReceived] = useState<{ sender: string; avatar: string; emote: string }[]>([]);

  // Match State
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [currentQuestion, setCurrentQuestion] = useState<DuelQuestion>(DUEL_QUESTIONS_CATALOG[0]);
  const [questionsList, setQuestionsList] = useState<DuelQuestion[]>(DUEL_QUESTIONS_CATALOG.slice(0, 5));
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [roundFeedback, setRoundFeedback] = useState<'hit' | 'miss' | null>(null);
  const [attackAnimation, setAttackAnimation] = useState<'player_attack' | 'enemy_attack' | null>(null);
  const [gameOverResult, setGameOverResult] = useState<{ winner: any; isDraw: boolean } | null>(null);

  // Weekly Leaderboard State (dynamically calibrated)
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);
  const [playerRank, setPlayerRank] = useState<number>(4);

  const roundTimerRef = useRef<any>(null);

  // Initialize and subscribe to WebSocket events
  useEffect(() => {
    globalDuelSocket.connect();

    const unsubscribe = globalDuelSocket.subscribe((event, data) => {
      if (event === 'ROOM_CREATED' || event === 'ROOM_UPDATED') {
        setRoomCode(data.roomCode);
        setHostPlayer(data.host);
        setGuestPlayer(data.guest || null);
        setIsSearchingPeer(false);
        setScreen('room_lobby');
        if (data.questions && data.questions.length > 0) {
          setQuestionsList(data.questions);
        }
      } else if (event === 'COUNTDOWN_START') {
        setCountdownSeconds(data.seconds || 3);
        SoundEffects.playRewardSound();
      } else if (event === 'MATCH_STARTED') {
        setCountdownSeconds(null);
        setScreen('playing');
        setCurrentRound(data.currentRound || 0);
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
        }
        setHostPlayer(data.host);
        setGuestPlayer(data.guest || null);
        setSelectedOption(null);
        setRoundFeedback(null);
        setAttackAnimation(null);
        startTimer();
      } else if (event === 'ROUND_RESULT') {
        if (data.room) {
          setHostPlayer(data.room.host);
          setGuestPlayer(data.room.guest || null);
        }
        setRoundFeedback(data.feedback);
        if (data.isCorrect) {
          SoundEffects.playCorrectSound();
          setAttackAnimation(data.attackerName === (activeChild?.name || 'Santri') ? 'player_attack' : 'enemy_attack');
        } else {
          SoundEffects.playWrongSound();
        }
      } else if (event === 'NEXT_ROUND') {
        setCurrentRound(data.currentRound);
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
        }
        setSelectedOption(null);
        setRoundFeedback(null);
        setAttackAnimation(null);
        startTimer();
      } else if (event === 'GAME_OVER') {
        clearInterval(roundTimerRef.current);
        setGameOverResult(data);
        setScreen('gameover');
        SoundEffects.playFanfareSound();
        try {
          confetti({
            particleCount: 80,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#08B9EF', '#FFD83E', '#81E850', '#FF7A50'],
          });
        } catch (e) {}

        // Award points and record duel match
        const isWinner = data.winner && data.winner.name === (activeChild?.name || 'Santri');
        const opponent = hostPlayer?.name === (activeChild?.name || 'Santri') ? guestPlayer : hostPlayer;
        const opponentName = opponent?.name || 'Santri Sahabat';
        const opponentAvatar = opponent?.avatar || '👦';
        const opponentSchool = opponent?.schoolName || 'Kuttab Al-Fatih';
        const gainedPoints = isWinner ? 50 : 15;

        StorageService.recordDuelMatch(childId, {
          won: isWinner,
          pointsGained: gainedPoints,
          opponentName,
          opponentAvatar,
          opponentSchool,
          category: currentQuestion?.category || 'Sambung Ayat',
          finalScoreSelf: isWinner ? 90 : 60,
          finalScoreOpponent: isWinner ? 60 : 90,
        });

        if (isWinner) {
          StorageService.recordPoints(
            childId,
            'COMPLETE_SESSION',
            50,
            10,
            'Menang Duel Kuis Santri Real-Time 🏆'
          );
          CompanionService.recordActivity(childId, 'game', 40, 6);
        } else {
          StorageService.recordPoints(
            childId,
            'GAME',
            15,
            3,
            'Partisipasi Duel Kuis Santri ⚔️'
          );
          CompanionService.recordActivity(childId, 'game', 15, 2);
        }

        fetchLeaderboard();
      } else if (event === 'EMOTE_RECEIVED') {
        SoundEffects.playRewardSound();
        setChatEmotesReceived((prev) => [
          ...prev.slice(-3),
          { sender: data.senderName, avatar: data.senderAvatar, emote: data.emote },
        ]);
      } else if (event === 'JOIN_ERROR') {
        setStatusMessage(data.message || 'Gagal bergabung ke ruangan');
        setIsSearchingPeer(false);
      }
    });

    // Fetch Weekly Leaderboard
    fetchLeaderboard();

    return () => {
      unsubscribe();
      clearInterval(roundTimerRef.current);
    };
  }, [childId, activeChild?.name]);

  // Handle countdown animation
  useEffect(() => {
    if (countdownSeconds === null) return;
    if (countdownSeconds > 1) {
      const t = setTimeout(() => setCountdownSeconds(countdownSeconds - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdownSeconds]);

  const startTimer = () => {
    clearInterval(roundTimerRef.current);
    setTimeLeft(10);
    roundTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(roundTimerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (selectedOption === null) {
      // Auto submit timeout
      globalDuelSocket.submitAnswer(roomCode, currentRound, -1, 10);
    }
  };

  // Fetch dynamically calibrated leaderboard from backend
  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const childPoints = activeChild?.totalXp || 320;
      const childName = activeChild?.name || 'Santri Bintang';
      const childAvatar = activeChild?.avatar || '👦';

      const res = await fetch(
        `/api/duel/leaderboard?playerName=${encodeURIComponent(childName)}&playerAvatar=${encodeURIComponent(
          childAvatar
        )}&score=${childPoints}`
      );
      if (res.ok) {
        const data = await res.json();
        setLeaderboardList(data.leaderboard || []);
        setPlayerRank(data.playerRank || 4);
      }
    } catch (e) {
      console.warn('[Leaderboard Fetch Error]', e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // --- LOBBY ACTIONS ---
  const handleQuickMatch = () => {
    setIsSearchingPeer(true);
    setStatusMessage('Mencari lawan santri secara langsung...');
    globalDuelSocket.quickMatch({
      id: childId,
      name: activeChild?.name || 'Santri Pintar',
      avatar: activeChild?.avatar || '👦',
      schoolName: 'Rumah Tahfiz Al-Qur\'an',
    });
  };

  const handleCreateRoom = () => {
    setStatusMessage('Membuat ruangan tanding baru...');
    globalDuelSocket.createRoom(
      {
        id: childId,
        name: activeChild?.name || 'Santri Host',
        avatar: activeChild?.avatar || '👦',
        schoolName: 'Rumah Tahfiz Al-Qur\'an',
      },
      'mix'
    );
  };

  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) {
      setStatusMessage('Silakan masukkan 6 digit kode ruangan.');
      return;
    }
    setStatusMessage(`Menghubungi ruangan ${joinCodeInput}...`);
    globalDuelSocket.joinRoom(joinCodeInput, {
      id: childId,
      name: activeChild?.name || 'Santri Tamu',
      avatar: activeChild?.avatar || '🧕',
      schoolName: 'TPQ Al-Ikhlas',
    });
  };

  const handleToggleReady = () => {
    const nextState = !isReady;
    setIsReady(nextState);
    globalDuelSocket.toggleReady(roomCode, nextState);
  };

  const handleSendEmote = (emote: string) => {
    globalDuelSocket.sendEmote(roomCode, emote);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(idx);
    clearInterval(roundTimerRef.current);
    const timeSpent = 10 - timeLeft;
    globalDuelSocket.submitAnswer(roomCode, currentRound, idx, timeSpent);
  };

  const copyRoomCode = () => {
    if (!roomCode) return;
    try {
      navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {}
  };

  // Determine current player vs opponent
  const isHost = hostPlayer?.id === childId;
  const me = isHost ? hostPlayer : guestPlayer;
  const opponent = isHost ? guestPlayer : hostPlayer;

  // --- RENDER 1: LOBBY SELECTOR (Quick, Create, Join, Leaderboard) ---
  if (screen === 'lobby_select') {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-cyan-600 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Game Hub</span>
          </button>
          <div className="flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Trophy size={14} className="text-amber-500" />
            <span>Liga Santri Mingguan</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-700 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
              Multiplayer Real-Time Arena
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading flex items-center gap-2">
              <Swords size={24} />
              <span>Duel Kuis Santri</span>
            </h2>
            <p className="text-xs text-cyan-100 font-medium max-w-sm">
              Tantang teman secara live atau bertanding dengan santri online se-Indonesia!
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none">
            ⚔️
          </div>
        </div>

        {/* Tabs: Tanding Kilat, Buat Ruang, Gabung Ruang, Papan Peringkat */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setLobbySubTab('quick')}
            className={`py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              lobbySubTab === 'quick' ? 'bg-white text-cyan-700 shadow-xs font-black' : 'hover:bg-white/60'
            }`}
          >
            ⚡ Tanding
          </button>
          <button
            onClick={() => setLobbySubTab('create')}
            className={`py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              lobbySubTab === 'create' ? 'bg-white text-cyan-700 shadow-xs font-black' : 'hover:bg-white/60'
            }`}
          >
            ➕ Buat Ruang
          </button>
          <button
            onClick={() => setLobbySubTab('join')}
            className={`py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              lobbySubTab === 'join' ? 'bg-white text-cyan-700 shadow-xs font-black' : 'hover:bg-white/60'
            }`}
          >
            🔑 Gabung
          </button>
          <button
            onClick={() => setLobbySubTab('leaderboard')}
            className={`py-2 px-1 rounded-xl text-center cursor-pointer transition-all ${
              lobbySubTab === 'leaderboard' ? 'bg-white text-amber-700 shadow-xs font-black' : 'hover:bg-white/60'
            }`}
          >
            🏆 Peringkat
          </button>
        </div>

        {/* Tab 1: Quick Match */}
        {lobbySubTab === 'quick' && (
          <div className="bg-white border-2 border-cyan-200 rounded-3xl p-5 shadow-xs space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-cyan-100 border border-cyan-300 text-cyan-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                Cari Lawan Otomatis (Quick Match)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Sistem akan mencocokkanmu secara instan dengan kawan santri yang sedang online.
              </p>
            </div>

            {statusMessage && (
              <p className="text-xs font-bold text-cyan-700 bg-cyan-50 py-1.5 px-3 rounded-xl inline-block">
                {statusMessage}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleQuickMatch}
              disabled={isSearchingPeer}
              icon={<Swords size={18} />}
            >
              {isSearchingPeer ? 'Sedang Mencari Lawan...' : 'Mulai Tanding Kilat!'}
            </Button>
          </div>
        )}

        {/* Tab 2: Create Room */}
        {lobbySubTab === 'create' && (
          <div className="bg-white border-2 border-cyan-200 rounded-3xl p-5 shadow-xs space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
              🏰
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                Buat Ruangan Tanding Pribadi
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Dapatkan kode 6 digit untuk dibagikan ke teman atau saudara agar bisa duel satu lawan satu.
              </p>
            </div>

            <Button
              variant="green"
              size="lg"
              fullWidth
              onClick={handleCreateRoom}
              icon={<Users size={18} />}
            >
              Buat Kode Ruangan Baru
            </Button>
          </div>
        )}

        {/* Tab 3: Join Room */}
        {lobbySubTab === 'join' && (
          <div className="bg-white border-2 border-cyan-200 rounded-3xl p-5 shadow-xs space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 border border-purple-300 text-purple-600 flex items-center justify-center text-3xl mx-auto shadow-xs">
              🔑
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                Gabung ke Ruangan Teman
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Masukkan kode ruangan yang diberikan oleh temanmu.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="CONTOH: SANTRI-882"
                className="w-full py-2.5 px-4 bg-slate-50 border-2 border-slate-300 focus:border-cyan-500 rounded-2xl text-center font-mono font-black text-base uppercase text-slate-900 tracking-wider focus:outline-none"
              />
            </div>

            {statusMessage && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 py-1.5 px-3 rounded-xl inline-block">
                {statusMessage}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleJoinRoom}
              icon={<ArrowRight size={18} />}
            >
              Masuk ke Arena Duel
            </Button>
          </div>
        )}

        {/* Tab 4: Weekly Leaderboard (with calibrated bots rule) */}
        {lobbySubTab === 'leaderboard' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <strong className="text-slate-900 font-black block font-heading">
                    Peringkat Liga Santri Pekan Ini
                  </strong>
                  <span className="text-[10px] text-amber-800 font-medium">
                    Reset dalam 3 hari, 8 jam • Hadiah +100 Bintang
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-[11px] shadow-xs">
                Posisi: #{playerRank}
              </span>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              {leaderboardList.map((item) => {
                const isMe = item.isCurrentPlayer;
                const isTop3 = item.rank <= 3;

                return (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center justify-between text-xs transition-colors ${
                      isMe
                        ? 'bg-cyan-50/80 font-bold border-l-4 border-l-cyan-500'
                        : isTop3
                        ? 'bg-amber-50/30'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number / Medal */}
                      <span className="w-6 text-center font-black font-mono">
                        {item.rank === 1
                          ? '🥇'
                          : item.rank === 2
                          ? '🥈'
                          : item.rank === 3
                          ? '🥉'
                          : `#${item.rank}`}
                      </span>

                      {/* Avatar */}
                      <span className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        {item.avatar}
                      </span>

                      {/* Name & School */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 font-black truncate max-w-[140px] sm:max-w-none">
                            {item.name}
                          </strong>
                          {isMe && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-cyan-600 text-white rounded-md">
                              Kamu
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {item.schoolName}
                        </span>
                      </div>
                    </div>

                    {/* Points & Badge */}
                    <div className="text-right">
                      <span className="font-mono font-black text-cyan-700 text-sm block">
                        {item.score} Poin
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">
                        {item.tierBadge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER 2: ROOM LOBBY (Waiting for friend / countdown) ---
  if (screen === 'room_lobby') {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Room Header & Code Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              globalDuelSocket.leaveRoom(roomCode);
              setScreen('lobby_select');
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Keluar Ruangan</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 font-mono font-black text-xs border border-cyan-300">
            {roomCode}
          </span>
        </div>

        {/* Room Code Share Card */}
        <div className="p-4 bg-white border-2 border-cyan-300 rounded-3xl shadow-xs space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Bagikan Kode Ini ke Temanmu:
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#164C68] tracking-widest bg-cyan-50 px-4 py-1.5 rounded-2xl border border-cyan-200">
              {roomCode}
            </span>
            <button
              onClick={copyRoomCode}
              className="p-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer shadow-xs transition-colors"
              title="Salin Kode"
            >
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Temanmu bisa membuka menu <strong className="text-slate-700">Gabung Ruang</strong> dan memasukkan kode di atas.
          </p>
        </div>

        {/* Countdown Overlay if triggered */}
        {countdownSeconds !== null && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-3xl text-center shadow-lg space-y-1 animate-pulse"
          >
            <span className="text-3xl font-black font-mono">{countdownSeconds}</span>
            <p className="text-xs font-black uppercase tracking-wider">Bersiap... Tanding Dimulai!</p>
          </motion.div>
        )}

        {/* Both Players Ready Card (Host VS Guest) */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Host Card */}
          <div className="p-4 bg-white border-2 border-slate-200 rounded-3xl text-center space-y-2 shadow-xs">
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block">
              Tuan Rumah (Host)
            </span>
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-3xl mx-auto shadow-xs">
              {hostPlayer?.avatar || '👦'}
            </div>
            <strong className="text-xs font-black text-slate-900 block truncate font-heading">
              {hostPlayer?.name || 'Menunggu...'}
            </strong>
            <span className="text-[10px] text-slate-500 block truncate">
              {hostPlayer?.schoolName || 'Rumah Tahfiz'}
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                hostPlayer?.isReady ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {hostPlayer?.isReady ? '✓ Siap!' : 'Belum Siap'}
            </span>
          </div>

          {/* Guest Card */}
          <div className="p-4 bg-white border-2 border-slate-200 rounded-3xl text-center space-y-2 shadow-xs">
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block">
              Penantang (Tamu)
            </span>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-3xl mx-auto shadow-xs">
              {guestPlayer?.avatar || '⌛'}
            </div>
            <strong className="text-xs font-black text-slate-900 block truncate font-heading">
              {guestPlayer?.name || 'Menunggu Teman...'}
            </strong>
            <span className="text-[10px] text-slate-500 block truncate">
              {guestPlayer?.schoolName || 'Menunggu Masuk'}
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                guestPlayer?.isReady ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {guestPlayer?.isReady ? '✓ Siap!' : 'Belum Siap'}
            </span>
          </div>
        </div>

        {/* Quick Islamic Emote Bar */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Kirim Salam & Emote:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {CHAT_EMOTES.map((em, idx) => (
              <button
                key={idx}
                onClick={() => handleSendEmote(em)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-300 text-slate-700 whitespace-nowrap cursor-pointer transition-colors shadow-2xs font-semibold"
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Emote Bubble Display */}
        {chatEmotesReceived.length > 0 && (
          <div className="space-y-1">
            {chatEmotesReceived.map((item, idx) => (
              <div
                key={idx}
                className="p-2 bg-cyan-50 border border-cyan-200 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in"
              >
                <span>{item.avatar}</span>
                <span className="font-bold text-slate-800">{item.sender}:</span>
                <span className="text-cyan-900 font-semibold">{item.emote}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ready Action Button */}
        <Button
          variant={isReady ? 'coral' : 'green'}
          size="lg"
          fullWidth
          onClick={handleToggleReady}
          icon={isReady ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
        >
          {isReady ? 'Batal Siap' : 'Saya Siap Bertanding!'}
        </Button>
      </div>
    );
  }

  // --- RENDER 3: LIVE PLAYING ARENA ---
  if (screen === 'playing') {
    return (
      <div className="space-y-4 pb-24 animate-in fade-in duration-200">
        {/* Top Match Bar: Exit & Timer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              clearInterval(roundTimerRef.current);
              globalDuelSocket.leaveRoom(roomCode);
              setScreen('lobby_select');
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Menyerah</span>
          </button>

          {/* Countdown Timer */}
          <div
            className={`px-4 py-1.5 rounded-full border flex items-center gap-1.5 font-mono font-black text-sm shadow-xs ${
              timeLeft <= 3 ? 'bg-rose-500 text-white border-rose-600 animate-ping' : 'bg-white text-slate-800 border-slate-300'
            }`}
          >
            <Clock size={15} className={timeLeft <= 3 ? 'text-white' : 'text-amber-500'} />
            <span>{timeLeft}s</span>
          </div>

          <span className="text-xs font-bold text-slate-600">
            Ronde {currentRound + 1} / {totalRounds}
          </span>
        </div>

        {/* VS Battle HUD (Dual HP Bars) */}
        <div className="bg-white border-2 border-cyan-200 rounded-3xl p-4 shadow-sm space-y-3 relative overflow-hidden">
          {/* Attack Animation Flash */}
          {attackAnimation === 'player_attack' && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 100, opacity: [0, 1, 0] }}
              className="absolute inset-y-0 left-1/3 w-32 bg-gradient-to-r from-cyan-400 to-amber-300 blur-md pointer-events-none"
            />
          )}
          {attackAnimation === 'enemy_attack' && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: -100, opacity: [0, 1, 0] }}
              className="absolute inset-y-0 right-1/3 w-32 bg-gradient-to-l from-rose-500 to-red-400 blur-md pointer-events-none"
            />
          )}

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Player Side (Left) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  {me?.avatar || '👦'}
                </span>
                <div className="min-w-0">
                  <strong className="text-xs font-black text-slate-900 block truncate font-heading">
                    {me?.name || 'Santri'}
                  </strong>
                  <span className="text-[10px] text-cyan-700 font-bold">
                    {me?.score || 0} Poin {(me?.comboStreak || 0) > 1 && `🔥 x${me?.comboStreak}`}
                  </span>
                </div>
              </div>

              {/* Player HP Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-black text-slate-600">
                  <span>HP: {me?.hp || 0}%</span>
                  <Heart size={11} className="text-rose-500 fill-rose-500" />
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    animate={{ width: `${me?.hp || 0}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      (me?.hp || 0) > 50 ? 'bg-emerald-500' : (me?.hp || 0) > 25 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Enemy Opponent Side (Right) */}
            <div className="space-y-1.5 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="min-w-0">
                  <strong className="text-xs font-black text-slate-900 block truncate font-heading">
                    {opponent?.name || 'Lawan'}
                  </strong>
                  <span className="text-[10px] text-rose-700 font-bold">
                    {opponent?.score || 0} Poin {(opponent?.comboStreak || 0) > 1 && `🔥 x${opponent?.comboStreak}`}
                  </span>
                </div>
                <span className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  {opponent?.avatar || '🧕'}
                </span>
              </div>

              {/* Enemy HP Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-black text-slate-600">
                  <Heart size={11} className="text-rose-500 fill-rose-500" />
                  <span>HP: {opponent?.hp || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <motion.div
                    animate={{ width: `${opponent?.hp || 0}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      (opponent?.hp || 0) > 50 ? 'bg-emerald-500' : (opponent?.hp || 0) > 25 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Question Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase tracking-wider text-[10px]">
              {currentQuestion.category}
            </span>
            <span>Nilai: 25 Poin</span>
          </div>

          <h3 className="text-sm font-black text-slate-900 font-heading leading-snug">
            {currentQuestion.question}
          </h3>

          {currentQuestion.arabicPrompt && (
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 text-center">
              <p className="font-arabic text-2xl text-slate-900 dir-rtl select-none leading-loose">
                {currentQuestion.arabicPrompt}
              </p>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQuestion.correctIndex;

              let btnStyle = 'bg-slate-50 hover:bg-cyan-50/80 border-slate-200 text-slate-800';
              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-sm';
                } else {
                  btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer select-none ${btnStyle}`}
                >
                  <span className="font-arabic text-sm">{opt}</span>
                  {selectedOption !== null && isCorrectAnswer && <CheckCircle2 size={16} />}
                  {selectedOption !== null && isSelected && !isCorrectAnswer && <XCircle size={16} />}
                </button>
              );
            })}
          </div>

          {/* Emote in battle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400 font-medium">Kirim Reaksi:</span>
            <div className="flex gap-1">
              {['⚔️', '🌟', '🤲', '💪'].map((emoji, eIdx) => (
                <button
                  key={eIdx}
                  onClick={() => handleSendEmote(emoji)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 4: GAME OVER MODAL / SCREEN ---
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-xl text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl mx-auto shadow-md border-2 border-white animate-bounce">
          🏆
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-block">
            Pertandingan Usai
          </span>
          <h2 className="text-2xl font-black text-slate-900 font-heading mt-1">
            {gameOverResult?.isDraw
              ? 'Hasil Seri! 🤝'
              : gameOverResult?.winner?.name === (activeChild?.name || 'Santri')
              ? 'Selamat, Kamu Menang! 🎉'
              : 'Belum Menang, Tetap Semangat! 💪'}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Duel Kuis Santri selesai. Poin dan bintang telah ditambahkan ke profilmu!
          </p>
        </div>

        {/* Score comparison */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{me?.name || 'Kamu'}</span>
            <span className="text-xl font-black text-cyan-700 block font-mono">{me?.score || 0}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{opponent?.name || 'Lawan'}</span>
            <span className="text-xl font-black text-rose-700 block font-mono">{opponent?.score || 0}</span>
          </div>
        </div>

        {/* Rewards earned */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-around text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <Star size={16} className="text-amber-500 fill-amber-400" />
            <span>+10 Bintang</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-cyan-800">
            <Sparkles size={16} className="text-cyan-500" />
            <span>+50 XP</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setScreen('lobby_select');
              setLobbySubTab('quick');
            }}
            icon={<RotateCcw size={18} />}
          >
            Tanding Lagi
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onBack}
          >
            Kembali ke Game Hub
          </Button>
        </div>
      </div>
    </div>
  );
};
