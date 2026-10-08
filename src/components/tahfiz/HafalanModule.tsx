import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Eye,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  ArrowRight,
  X,
  Award,
  MessageSquare,
  Clock,
  Check,
} from 'lucide-react';
import { SURAHS_METADATA } from '../../data/surahsMetadata';
import { getSurahAyahs } from '../../data/quranData';
import { getAyahAudioUrl } from '../../data/recitersData';
import { AudioRecordingService, RecordingState } from '../../services/recordingService';
import { analyzeAyahRecitation, ScoreAnalysisResult } from '../../services/scoringEngine';
import { StorageService } from '../../services/storageService';
import { AudioDatabaseService } from '../../services/audioDatabaseService';
import { AyahData, SurahMetadata, AyahRecording } from '../../types';
import { ArabicText } from '../common/ArabicText';
import { Button } from '../common/Button';
import { SetoranResultModal, RecordedAyahItem } from './SetoranResultModal';
import { RiwayatEvaluasiModal } from './RiwayatEvaluasiModal';
import { GlobalAudioManager } from '../../services/audioService';
import { CompanionService } from '../../services/companionService';
import { SubtleCompanionReaction } from '../companion/SubtleCompanionReaction';

interface HafalanModuleProps {
  childId: string;
  initialSurahNumber?: number;
  onFinishHafalan: () => void;
  onBack: () => void;
}

export const HafalanModule: React.FC<HafalanModuleProps> = ({
  childId,
  initialSurahNumber = 1,
  onFinishHafalan,
  onBack,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);

  // Recorded audio results mapping: ayahNumber -> RecordedAyahItem
  const [recordedAyahs, setRecordedAyahs] = useState<Map<number, RecordedAyahItem>>(new Map());

  // Assistance tracked per ayah
  const [assistanceUsedMap, setAssistanceUsedMap] = useState<Map<number, string[]>>(new Map());

  // Modal assistance displays
  const [peekAyahVisible, setPeekAyahVisible] = useState<boolean>(false);
  const [peekAwalanVisible, setPeekAwalanVisible] = useState<boolean>(false);

  // Voice recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  // Rekam Suara Database & Evaluation states
  const [studentNote, setStudentNote] = useState<string>('');
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [isPlayingSavedAudio, setIsPlayingSavedAudio] = useState<boolean>(false);
  const savedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Result modal state
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [companionPulseTrigger, setCompanionPulseTrigger] = useState<number>(0);
  const companion = CompanionService.getCompanionData(childId);

  const recorderRef = useRef<AudioRecordingService | null>(null);
  const timerRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const audioAssistRef = useRef<HTMLAudioElement | null>(null);

  const surahMeta = SURAHS_METADATA.find((s) => s.number === selectedSurahNumber) || SURAHS_METADATA[0];
  const currentAyah = ayahs[currentAyahIndex];

  // Existing saved recording from database for active ayah
  const existingSavedRecording = currentAyah
    ? StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber)
    : undefined;

  const totalSavedCount = StorageService.getRecordings(childId).filter(
    (r) => r.surahNumber === selectedSurahNumber
  ).length;

  useEffect(() => {
    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
    }
    setIsPlayingSavedAudio(false);
    setIsSavedToDb(false);
    setSaveToast(null);
    const existing = currentAyah
      ? StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber)
      : undefined;
    setStudentNote(existing?.studentNote || '');
  }, [currentAyahIndex, selectedSurahNumber]);

  // Initialize Recorder & Audio Stop Listeners
  useEffect(() => {
    const recorder = new AudioRecordingService();
    recorderRef.current = recorder;

    recorder.onStateChange = (state) => setRecordingState(state);
    recorder.onVolumeChange = (vol) => setAudioVolume(vol);

    const unsubStop = GlobalAudioManager.addStopListener((source) => {
      if (source && audioAssistRef.current && source === audioAssistRef.current) {
        return;
      }
      if (audioAssistRef.current) {
        audioAssistRef.current.onended = null;
        audioAssistRef.current.onerror = null;
        GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
        try {
          audioAssistRef.current.pause();
          audioAssistRef.current.currentTime = 0;
        } catch (e) {}
        audioAssistRef.current = null;
      }
    });

    return () => {
      unsubStop();
      recorder.cleanup();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioAssistRef.current) {
        audioAssistRef.current.onended = null;
        audioAssistRef.current.onerror = null;
        GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
        try {
          audioAssistRef.current.pause();
          audioAssistRef.current.src = '';
        } catch (e) {}
        audioAssistRef.current = null;
      }
    };
  }, []);

  // Load Surah Ayahs
  useEffect(() => {
    let isMounted = true;
    getSurahAyahs(selectedSurahNumber).then((data) => {
      if (!isMounted) return;
      setAyahs(data);
      setCurrentAyahIndex(0);
      setRecordedAyahs(new Map());
      setAssistanceUsedMap(new Map());
      setPreviewBlobUrl(null);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Record assistance used
  const addAssistance = (type: string) => {
    if (!currentAyah) return;
    setAssistanceUsedMap((prev) => {
      const next = new Map(prev);
      const list = next.get(currentAyah.ayahNumber) || [];
      if (!list.includes(type)) {
        list.push(type);
      }
      next.set(currentAyah.ayahNumber, list);
      return next;
    });
  };

  // --- Voice Recording Handlers ---
  const handleStartRecording = async () => {
    if (!recorderRef.current) return;
    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
      setIsPlayingSavedAudio(false);
    }
    setPreviewBlobUrl(null);
    setRecordingDuration(0);
    setIsSavedToDb(false);
    setSaveToast(null);

    await recorderRef.current.startRecording();
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await recorderRef.current.stopRecording();
      setPreviewBlobUrl(res.blobUrl);

      // Analyze recitation
      const assistance = assistanceUsedMap.get(currentAyah.ayahNumber) || [];
      const score = analyzeAyahRecitation(res.durationSeconds, currentAyah, assistance);

      const recId = `rec-${Date.now()}-${currentAyah.ayahNumber}`;

      // Save audio to permanent database (IndexedDB + DataURL fallback)
      const { objectUrl, dataUrl } = await AudioDatabaseService.saveAudioBlob(recId, res.blob);

      const recordedItem: RecordedAyahItem = {
        ayahNumber: currentAyah.ayahNumber,
        audioBlobUrl: objectUrl || res.blobUrl,
        durationSeconds: res.durationSeconds,
        scoreResult: score,
      };

      // Save to map
      setRecordedAyahs((prev) => {
        const next = new Map(prev);
        next.set(currentAyah.ayahNumber, recordedItem);
        return next;
      });

      // Save to StorageService
      StorageService.saveRecording({
        id: recId,
        childId,
        surahNumber: selectedSurahNumber,
        surahName: surahMeta.nameLatin,
        ayahNumber: currentAyah.ayahNumber,
        audioBlobUrl: objectUrl || res.blobUrl,
        audioDataUrl: dataUrl,
        durationSeconds: res.durationSeconds,
        referenceDurationSeconds: score.referenceDurationSeconds,
        score: score.overallScore,
        timingScore: score.timingScore,
        wordCoverageScore: score.wordCoverageScore,
        fluencyScore: score.fluencyScore,
        missingWords: score.missingWords,
        extraWords: score.extraWords,
        assistanceUsed: assistance as any,
        createdAt: new Date().toISOString(),
        needsReview: score.needsReview,
        studentNote: studentNote.trim() || undefined,
        evaluation: {
          status: 'pending',
          evaluatorRole: 'parent',
          evaluatorName: 'Orang Tua / Guru',
          notes: '',
          evaluatedAt: '',
        },
      });

      StorageService.saveAyahScore(
        childId,
        selectedSurahNumber,
        currentAyah.ayahNumber,
        score.overallScore,
        !score.needsReview
      );

      setIsSavedToDb(true);
      setSaveToast(`Alhamdulillah! Rekaman Suara Ayat ${currentAyah.ayahNumber} berhasil disimpan ke Database!`);
      setTimeout(() => setSaveToast(null), 4000);

      // Record activity in Companion service
      CompanionService.recordActivity(childId, 'hafalan', 35, 5);
      CompanionService.onSurahCompleted(childId, surahMeta.nameLatin);
      setCompanionPulseTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  const handleCancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.cancelRecording();
    setPreviewBlobUrl(null);
    setRecordingDuration(0);
    setIsSavedToDb(false);
  };

  const handlePlaySavedAudio = async (recording: AyahRecording) => {
    if (savedAudioRef.current) {
      savedAudioRef.current.pause();
    }
    if (isPlayingSavedAudio) {
      setIsPlayingSavedAudio(false);
      return;
    }

    const audioUrl = await AudioDatabaseService.getAudioUrl(
      recording.id,
      recording.audioDataUrl || recording.audioBlobUrl
    );
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    savedAudioRef.current = audio;
    setIsPlayingSavedAudio(true);
    audio.play().catch(() => {});
    audio.onended = () => setIsPlayingSavedAudio(false);
    audio.onerror = () => setIsPlayingSavedAudio(false);
  };

  const handleUpdateStudentNote = (newNote: string) => {
    setStudentNote(newNote);
    if (!currentAyah) return;
    const existing = StorageService.getRecordingByAyah(childId, selectedSurahNumber, currentAyah.ayahNumber);
    if (existing) {
      existing.studentNote = newNote.trim();
      StorageService.saveRecording(existing);
      setSaveToast('Catatan santri berhasil disimpan ke database!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  // Assistance handlers
  const handlePlayAyah = () => {
    addAssistance('play_ayah');
    if (audioAssistRef.current) {
      GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
      audioAssistRef.current.pause();
    }
    const audioUrl = getAyahAudioUrl('alafasy', selectedSurahNumber, currentAyah.ayahNumber);
    const audio = new Audio(audioUrl);
    audioAssistRef.current = audio;
    GlobalAudioManager.registerRawAudio(audio);
    GlobalAudioManager.notifyPlayStarted(audio);
    audio.play().catch(() => {});
    audio.onended = () => {
      GlobalAudioManager.unregisterRawAudio(audio);
    };
  };

  const handlePlayAwalan = () => {
    addAssistance('play_awalan');
    if (audioAssistRef.current) {
      GlobalAudioManager.unregisterRawAudio(audioAssistRef.current);
      audioAssistRef.current.pause();
    }
    const audioUrl = getAyahAudioUrl('alafasy', selectedSurahNumber, currentAyah.ayahNumber);
    const audio = new Audio(audioUrl);
    audioAssistRef.current = audio;
    GlobalAudioManager.registerRawAudio(audio);
    GlobalAudioManager.notifyPlayStarted(audio);
    audio.play().catch(() => {});
    setTimeout(() => {
      audio.pause();
      GlobalAudioManager.unregisterRawAudio(audio);
    }, 1800);
  };

  const handleLihatAyah = () => {
    addAssistance('lihat_ayah');
    setPeekAyahVisible(true);
  };

  const handleLihatAwalan = () => {
    addAssistance('lihat_awalan');
    setPeekAwalanVisible(true);
  };

  const handleNextAyah = () => {
    setPreviewBlobUrl(null);
    setPeekAyahVisible(false);
    setPeekAwalanVisible(false);

    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
    } else {
      // Completed all ayahs!
      handleCompleteSetoran();
    }
  };

  const handleCompleteSetoran = () => {
    // Record Setoran completion in ledger
    StorageService.recordPoints(
      childId,
      'HAFALAN_TEST',
      30,
      10,
      `Setoran Hafalan Surah ${surahMeta.nameLatin}`,
      'surah',
      String(selectedSurahNumber)
    );
    setShowResultModal(true);
  };

  const recordedCount = recordedAyahs.size;
  const totalCount = ayahs.length;
  const isCurrentRecorded = currentAyah && recordedAyahs.has(currentAyah.ayahNumber);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#164C68] font-heading">
              {surahMeta.nameLatin}
            </h2>
            <span className="font-quran text-lg text-[#08B9EF]">
              {surahMeta.nameArabic}
            </span>
          </div>
          <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
            Hafalan • rekam per ayat, tanpa teks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF8FF] hover:bg-[#d8eefc] border border-[#C9E1ED] text-[#164C68] rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Lihat riwayat rekaman dan evaluasi ustadz/orang tua"
          >
            <Award size={15} className="text-amber-500" />
            <span>Evaluasi Guru ({totalSavedCount})</span>
          </button>
          <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-bold text-[#08B9EF]">
            {totalCount} ayat
          </span>
        </div>
      </div>

      {/* Guide Notification Card */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
        <span className="text-emerald-600 font-bold shrink-0 mt-0.5">🎙️</span>
        <p className="leading-relaxed">
          <strong className="font-bold">Fitur Rekam Suara:</strong> Lafalkan dari ingatan dan rekam per ayat. Rekaman tersimpan permanen di database untuk dievaluasi oleh Ustadz atau Orang Tua.
        </p>
      </div>

      {/* NOMOR AYAT Grid Selector (Matches Screenshot!) */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#8C9BA7] uppercase tracking-wider">NOMOR AYAT</span>
          <span className="text-[#08B9EF]">
            {recordedCount}/{totalCount} direkam
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#8C9BA7] font-semibold pb-1">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Belum
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Sekarang
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Sudah direkam
          </span>
        </div>

        {/* Ayah Number Buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 pt-1">
          {ayahs.map((a, idx) => {
            const isRecorded = recordedAyahs.has(a.ayahNumber);
            const isCurrent = idx === currentAyahIndex;

            return (
              <button
                key={a.ayahNumber}
                onClick={() => {
                  if (recordingState === 'RECORDING') return;
                  setCurrentAyahIndex(idx);
                  setPreviewBlobUrl(recordedAyahs.get(a.ayahNumber)?.audioBlobUrl || null);
                }}
                className={`h-12 rounded-2xl font-black text-sm transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'border-2 border-amber-400 bg-amber-50 text-amber-900 shadow-sm scale-105'
                    : isRecorded
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-[#EEF8FF] text-[#164C68] hover:bg-[#d8eefc]'
                }`}
              >
                {a.ayahNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Peek Ayah / Awalan Assistance Popup (Matches Screenshot!) */}
      {peekAyahVisible && currentAyah && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 shadow-sm relative animate-in fade-in duration-150">
          <button
            onClick={() => setPeekAyahVisible(false)}
            className="absolute top-3 right-3 text-amber-700 hover:text-amber-950 p-1"
          >
            <X size={18} />
          </button>
          <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
            TEKS AYAT {currentAyah.ayahNumber}
          </span>
          <div className="my-2">
            <ArabicText arabicText={currentAyah.arabicText} fontSize="normal" />
          </div>
          <p className="text-xs text-amber-800 font-medium">
            "{currentAyah.translationId}"
          </p>
        </div>
      )}

      {peekAwalanVisible && currentAyah && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-4 shadow-sm relative animate-in fade-in duration-150">
          <button
            onClick={() => setPeekAwalanVisible(false)}
            className="absolute top-3 right-3 text-blue-700 hover:text-blue-950 p-1"
          >
            <X size={18} />
          </button>
          <span className="text-[11px] font-bold text-blue-800 uppercase block mb-1">
            AWALAN AYAT {currentAyah.ayahNumber}
          </span>
          <p dir="rtl" className="text-2xl font-quran text-[#164C68] my-2 text-right">
            {currentAyah.arabicText.split(' ').slice(0, 2).join(' ')} ...
          </p>
        </div>
      )}

      {/* 4 Hierarchical Assistance Buttons (Matches Screenshot!) */}
      <div className="bg-white border border-[#C9E1ED] rounded-3xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#8C9BA7] uppercase tracking-wider">
            BANTUAN (AYAT {currentAyah?.ayahNumber})
          </span>
          <span className="text-[11px] text-[#8C9BA7]">
            Gunakan jika sedikit lupa
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePlayAyah}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs border border-[#C9E1ED] active:scale-98 transition-all cursor-pointer"
          >
            <Play size={16} className="text-[#08B9EF] fill-current" />
            <span>Play ayat</span>
          </button>

          <button
            onClick={handleLihatAyah}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#08B9EF] hover:bg-[#07a6d7] text-white font-bold text-xs active:scale-98 transition-all cursor-pointer shadow-xs"
          >
            <Eye size={16} />
            <span>Lihat ayat</span>
          </button>

          <button
            onClick={handlePlayAwalan}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs border border-[#C9E1ED] active:scale-98 transition-all cursor-pointer"
          >
            <Volume2 size={16} className="text-amber-500" />
            <span>Play awalan</span>
          </button>

          <button
            onClick={handleLihatAwalan}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#EEF8FF] hover:bg-[#d8eefc] text-[#164C68] font-bold text-xs border border-[#C9E1ED] active:scale-98 transition-all cursor-pointer"
          >
            <Eye size={16} className="text-purple-500" />
            <span>Lihat awalan</span>
          </button>
        </div>
      </div>

      {/* Existing Saved Recording Card from Database */}
      {existingSavedRecording && !previewBlobUrl && recordingState !== 'RECORDING' && (
        <div className="bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border border-emerald-200 rounded-3xl p-4 space-y-3 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="text-emerald-600" size={16} />
              Rekaman Ayat {currentAyah?.ayahNumber} Tersimpan di Database
            </span>

            {existingSavedRecording.evaluation?.status === 'evaluated' ? (
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                {existingSavedRecording.evaluation.grade === 'mumtaz'
                  ? '🌟 Mumtaz'
                  : existingSavedRecording.evaluation.grade === 'jayyid'
                  ? '👍 Jayyid'
                  : '⚠️ Perlu Latihan'}
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                <Clock size={12} />
                Menunggu Evaluasi Guru / Ortu
              </span>
            )}
          </div>

          {existingSavedRecording.evaluation?.status === 'evaluated' && existingSavedRecording.evaluation.notes && (
            <div className="p-2.5 bg-white/90 rounded-2xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700">
                <span>Catatan {existingSavedRecording.evaluation.evaluatorRole === 'teacher' ? 'Ustadz / Guru' : 'Orang Tua'}:</span>
                <span>{existingSavedRecording.evaluation.evaluatorName}</span>
              </div>
              <p className="text-xs text-emerald-900 italic">
                "{existingSavedRecording.evaluation.notes}"
              </p>
            </div>
          )}

          {existingSavedRecording.studentNote && (
            <p className="text-[11px] text-[#164C68] bg-white/70 px-2.5 py-1.5 rounded-xl border border-teal-100">
              <strong>Catatan Santri:</strong> "{existingSavedRecording.studentNote}"
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handlePlaySavedAudio(existingSavedRecording)}
              className="flex-1 py-2 px-3 rounded-2xl bg-white border border-[#C9E1ED] hover:bg-slate-50 text-xs font-bold text-[#164C68] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isPlayingSavedAudio ? <Pause size={14} /> : <Play size={14} className="fill-current text-[#08B9EF]" />}
              <span>{isPlayingSavedAudio ? 'Jeda Audio' : `Putar Suara Tersimpan (${existingSavedRecording.durationSeconds}s)`}</span>
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#08B9EF] hover:bg-[#07a6d7] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Award size={14} />
              <span>Detail Evaluasi</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Recording Control Area */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-sm text-center space-y-4">
        {/* State Display: Idle vs Recording vs Recorded */}
        {recordingState === 'RECORDING' ? (
          <div className="space-y-3 py-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-center gap-2 text-rose-600 font-extrabold text-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping inline-block" />
              <span>Merekam Ayat {currentAyah?.ayahNumber}...</span>
            </div>

            {/* Timer */}
            <div className="text-3xl font-black font-mono text-[#164C68]">
              00:{recordingDuration.toString().padStart(2, '0')}
            </div>

            {/* Live Audio Visualizer Bar */}
            <div className="w-48 mx-auto bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-75"
                style={{ width: `${Math.max(10, audioVolume)}%` }}
              />
            </div>

            {/* Stop Recording Button */}
            <Button
              variant="coral"
              size="lg"
              fullWidth
              onClick={handleStopRecording}
              icon={<Square size={20} className="fill-white" />}
            >
              Hentikan & Simpan Rekaman
            </Button>
          </div>
        ) : previewBlobUrl ? (
          /* Child preview & actions */
          <div className="space-y-3 py-2 animate-in fade-in duration-150 text-left">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm text-center">
              <CheckCircle size={18} />
              <span>Ayat {currentAyah?.ayahNumber} Berhasil Direkam & Tersimpan di Database!</span>
            </div>

            {/* Audio Playback of Child's Voice */}
            <audio controls src={previewBlobUrl} className="w-full h-10 mt-2" />

            {/* Persistence & Evaluation Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-xs text-emerald-900 flex items-center gap-2">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Tersimpan permanen di database • Siap dievaluasi oleh Ustadz atau Orang Tua</span>
            </div>

            {/* Optional Student Note */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-[#8C9BA7] flex items-center gap-1">
                <MessageSquare size={13} />
                <span>Pesan / Catatan untuk Guru atau Orang Tua (Opsional):</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Misal: Sudah lancar tanpa melihat teks, mohon koreksi..."
                  className="flex-1 bg-[#EEF8FF] border border-[#C9E1ED] rounded-xl px-3 py-2 text-xs font-semibold text-[#164C68] focus:outline-none focus:border-[#08B9EF]"
                />
                <button
                  onClick={() => handleUpdateStudentNote(studentNote)}
                  className="px-3 py-2 bg-[#164C68] hover:bg-[#113d54] text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            {saveToast && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
                {saveToast}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleStartRecording}
                icon={<RotateCcw size={16} />}
              >
                Rekam Ulang
              </Button>

              <Button
                variant="green"
                size="md"
                fullWidth
                onClick={handleNextAyah}
                icon={<ArrowRight size={18} />}
              >
                {currentAyahIndex < ayahs.length - 1 ? 'Ayat Berikutnya' : 'Lihat Hasil'}
              </Button>
            </div>
          </div>
        ) : (
          /* Ready to Record State */
          <div className="space-y-3 py-1">
            <div>
              <h4 className="font-heading font-black text-sm text-[#164C68] flex items-center justify-center gap-1.5">
                <Mic size={18} className="text-[#08B9EF]" />
                <span>Fitur Rekam Suara Hafalan</span>
              </h4>
              <p className="text-xs text-[#8C9BA7] font-semibold mt-0.5">
                Mulai dari <strong className="text-[#164C68]">Ayat {currentAyah?.ayahNumber}</strong> • rekaman tersimpan di database untuk evaluasi Guru & Orang Tua
              </p>
            </div>

            <Button
              variant="green"
              size="lg"
              fullWidth
              onClick={handleStartRecording}
              icon={<Mic size={22} />}
            >
              Mulai Rekam Suara
            </Button>
          </div>
        )}
      </div>

      {/* Setoran Results Modal */}
      <SetoranResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          onFinishHafalan();
        }}
        surahNumber={selectedSurahNumber}
        surahName={surahMeta.nameLatin}
        reciterId="alafasy"
        results={Array.from(recordedAyahs.values())}
        onRetry={() => {
          setShowResultModal(false);
          setRecordedAyahs(new Map());
          setCurrentAyahIndex(0);
          setPreviewBlobUrl(null);
        }}
        onMurojaahWeakAyahs={(weakNums) => {
          setShowResultModal(false);
          onFinishHafalan();
        }}
      />

      {/* Riwayat Rekaman & Evaluasi Guru/Orang Tua Modal */}
      <RiwayatEvaluasiModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        childId={childId}
        surahNumber={selectedSurahNumber}
        surahName={surahMeta.nameLatin}
      />

      {/* Subtle Companion Reaction in corner */}
      <SubtleCompanionReaction
        companion={companion}
        pulseTrigger={companionPulseTrigger}
        message="Lumi terpukau! Suaramu merdu ✨"
      />
    </div>
  );
};
