import React, { useState } from 'react';
import { Sparkles, CheckCircle2, HelpCircle, BookOpen, Star, Volume2 } from 'lucide-react';
import { TAJWID_CURRICULUM } from '../../data/tajwidData';
import { StorageService } from '../../services/storageService';
import { CompanionService } from '../../services/companionService';
import { TajwidTopic } from '../../types';
import { Button } from '../common/Button';

interface TajwidModuleProps {
  childId: string;
  onBack: () => void;
}

export const TajwidModule: React.FC<TajwidModuleProps> = ({ childId, onBack }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TAJWID_CURRICULUM[0].id);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() =>
    StorageService.getCompletedTajwid(childId)
  );

  // Mini quiz state per topic
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const activeTopic = TAJWID_CURRICULUM.find((t) => t.id === selectedTopicId) || TAJWID_CURRICULUM[0];

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleAnswerQuiz = (index: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(index);
    setQuizSubmitted(true);

    if (index === activeTopic.quiz.correctIndex) {
      StorageService.markTajwidCompleted(childId, activeTopic.id);
      setCompletedTopicIds(StorageService.getCompletedTajwid(childId));
      CompanionService.recordActivity(
        childId,
        'tajwid',
        20,
        3,
        `Latihan Tajwid: ${activeTopic.name}`
      );
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Category Pills Header */}
      <div className="flex gap-1.5 p-1 bg-white border border-[#C9E1ED] rounded-2xl shadow-xs overflow-x-auto">
        {TAJWID_CURRICULUM.map((topic) => {
          const isDone = completedTopicIds.includes(topic.id);
          const isSelected = selectedTopicId === topic.id;

          return (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                isSelected
                  ? 'bg-[#FF946F] text-white shadow-xs'
                  : 'text-[#8C9BA7] hover:text-[#164C68]'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{topic.name}</span>
                {isDone && <span className="text-[10px] text-emerald-300">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Topic Card */}
      <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-[#FF946F] uppercase tracking-wider block">
              {activeTopic.category}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-xl font-black text-[#164C68] font-heading">
                {activeTopic.name}
              </h2>
              <span className="font-quran text-lg text-[#FF946F]">
                {activeTopic.arabicName}
              </span>
            </div>
            <p className="text-xs text-[#8C9BA7] font-semibold">
              Arti: {activeTopic.meaning}
            </p>
          </div>

          {completedTopicIds.includes(activeTopic.id) && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 size={14} /> Dikuasai
            </span>
          )}
        </div>

        {/* Explanation */}
        <p className="text-xs text-[#164C68] font-medium leading-relaxed bg-[#EEF8FF] p-3.5 rounded-2xl border border-[#C9E1ED]">
          {activeTopic.explanation}
        </p>

        {/* Huruf / Letters Tags */}
        <div>
          <span className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block mb-2">
            HURUF-HURUFNYA ({activeTopic.letters.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {activeTopic.letters.map((letter, idx) => (
              <span
                key={idx}
                dir="rtl"
                className="w-10 h-10 rounded-2xl bg-white border-2 border-orange-200 text-[#164C68] font-quran text-xl font-bold flex items-center justify-center shadow-xs"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Examples in Juz 30 */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-[#8C9BA7] uppercase tracking-wider block">
            CONTOH DALAM AL-QUR'AN:
          </span>

          {activeTopic.examples.map((ex, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#FFF9F5] border border-orange-200/80 space-y-1"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#8C9BA7]">
                <span>
                  Surah {ex.surahName} : Ayat {ex.ayahNumber}
                </span>
                <span className="text-orange-600 font-quran font-bold">
                  {ex.highlight}
                </span>
              </div>
              <p dir="rtl" className="font-quran text-2xl text-[#164C68] text-right py-1">
                {ex.arabicText}
              </p>
              <p className="text-[11px] text-[#8C9BA7] font-medium">
                {ex.explanation}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Mini Quiz */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#164C68] font-heading flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" /> Kuis Cepat Tajwid
            </span>
            <span className="text-amber-600 font-bold">+15 XP • +3 ⭐</span>
          </div>

          <p className="text-xs font-bold text-[#164C68]">
            {activeTopic.quiz.question}
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {activeTopic.quiz.options.map((opt, oIdx) => {
              const isSelected = selectedQuizOption === oIdx;
              const isCorrect = oIdx === activeTopic.quiz.correctIndex;

              let btnStyle = 'bg-[#EEF8FF] text-[#164C68] border-[#C9E1ED] hover:bg-[#d8eefc]';
              if (quizSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500 text-white border-rose-600 font-bold';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleAnswerQuiz(oIdx)}
                  disabled={quizSubmitted}
                  className={`w-full text-left py-2.5 px-3.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {quizSubmitted && isCorrect && <CheckCircle2 size={16} />}
                  </div>
                </button>
              );
            })}
          </div>

          {quizSubmitted && (
            <div
              className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                selectedQuizOption === activeTopic.quiz.correctIndex
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {selectedQuizOption === activeTopic.quiz.correctIndex
                ? 'Benar sekali! ' + activeTopic.quiz.explanation
                : 'Belum tepat. ' + activeTopic.quiz.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
