import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Clock, TrendingUp, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { WeeklyReportData, DailyProgressPoint } from '../../types/weeklyReport';

interface DailyDurationBarChartProps {
  report: WeeklyReportData;
  onOpenReport?: () => void;
  title?: string;
  subtitle?: string;
  showSummaryCards?: boolean;
  compact?: boolean;
}

// Custom Tooltip for Daily Duration Bar Chart
const DailyDurationTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DailyProgressPoint = payload[0].payload;
    const isTargetMet = data.menitBelajar >= 20;

    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#C9E1ED] text-xs space-y-1.5 z-50 min-w-[170px] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-[#164C68] font-heading">{data.dayName}</span>
            {data.isToday && (
              <span className="text-[9px] font-black bg-[#08B9EF] text-white px-1.5 py-0.2 rounded-full">
                Hari Ini
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#8C9BA7] font-semibold">{data.shortDate}</span>
        </div>

        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between gap-3 text-amber-800">
            <span className="font-semibold flex items-center gap-1">
              <Clock size={12} className="text-amber-500" />
              Durasi Hafalan:
            </span>
            <strong className="text-sm font-black text-amber-600 font-mono">
              {data.menitBelajar} Menit
            </strong>
          </div>

          <div className="flex items-center justify-between gap-3 text-slate-600 text-[11px]">
            <span>Ayat Disentuh:</span>
            <span className="font-bold text-[#164C68]">
              {data.totalAyat > 0 ? `${data.totalAyat} Ayat` : 'Istirahat'}
            </span>
          </div>

          {data.totalAyat > 0 && (
            <div className="flex items-center justify-between text-[10px] text-slate-500 pl-2 border-l-2 border-sky-200">
              <span>Ziadah: {data.ayatHafal}</span>
              <span>•</span>
              <span>Murojaah: {data.ayatMurojaah}</span>
            </div>
          )}

          <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Status Target (20m):</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                isTargetMet
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : 'text-amber-700 bg-amber-50 border border-amber-200'
              }`}
            >
              {isTargetMet ? 'Tercapai 🌟' : 'Perlu Tambah ⏱️'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DailyDurationBarChart: React.FC<DailyDurationBarChartProps> = ({
  report,
  onOpenReport,
  title = 'Tren Durasi Hafalan Sepekan',
  subtitle = 'Waktu interaksi tahfiz & murojaah anak setiap hari (Senin – Minggu)',
  showSummaryCards = true,
  compact = false,
}) => {
  // Compute analytics
  const dailyData = report.dailyData || [];
  const maxDay = [...dailyData].sort((a, b) => b.menitBelajar - a.menitBelajar)[0];
  const activeDaysCount = dailyData.filter((d) => d.menitBelajar > 0).length;
  const avgDailyMinutes = Math.round(report.totalMenitBelajar / Math.max(1, activeDaysCount));
  const targetMinutes = 20;

  return (
    <div className="bg-white border-2 border-[#C9E1ED] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-lg shrink-0 shadow-2xs">
            ⏱️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-black text-[#164C68] font-heading tracking-tight truncate">
                {title}
              </h4>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0 font-mono">
                {report.totalMenitBelajar} Menit Total
              </span>
            </div>
            <p className="text-[11px] text-[#8C9BA7] font-semibold truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="hidden sm:flex items-center gap-1 py-1.5 px-3 rounded-xl bg-[#EEF8FF] hover:bg-[#d9effc] text-[#164C68] text-xs font-bold border border-[#C9E1ED] shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
            title="Buka Rapor Mingguan Lengkap"
          >
            <span>Rapor Lengkap</span>
            <ChevronRight size={14} className="text-[#08B9EF]" />
          </button>
        )}
      </div>

      {/* Key Metric Summary Badges */}
      {showSummaryCards && (
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-2.5 rounded-2xl border border-amber-200/80 text-center">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">
              Total Waktu
            </span>
            <strong className="text-base sm:text-lg font-black text-amber-700 font-heading block mt-0.5">
              {report.totalMenitBelajar}m
            </strong>
            <span className="text-[9px] text-amber-600 font-semibold block">
              {report.hariAktif}/7 Hari Aktif
            </span>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-cyan-50/50 p-2.5 rounded-2xl border border-sky-200/80 text-center">
            <span className="text-[10px] font-bold text-sky-800 uppercase block">
              Rata-rata Harian
            </span>
            <strong className="text-base sm:text-lg font-black text-[#08B9EF] font-heading block mt-0.5">
              {avgDailyMinutes}m/hari
            </strong>
            <span className="text-[9px] text-sky-600 font-semibold block">
              Target: {targetMinutes}m/hari
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-2.5 rounded-2xl border border-emerald-200/80 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              Hari Puncak
            </span>
            <strong className="text-base sm:text-lg font-black text-emerald-700 font-heading block mt-0.5 truncate">
              {maxDay ? `${maxDay.dayName}` : '-'}
            </strong>
            <span className="text-[9px] text-emerald-600 font-semibold block">
              {maxDay ? `${maxDay.menitBelajar} Menit` : '0 Menit'}
            </span>
          </div>
        </div>
      )}

      {/* Recharts Bar Chart Canvas */}
      <div className={`w-full pt-1 ${compact ? 'h-48' : 'h-56 sm:h-64'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyData}
            margin={{ top: 14, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="dayName"
              tick={({ x, y, payload }) => {
                const dayItem = dailyData.find((d) => d.dayName === payload.value);
                const isToday = dayItem?.isToday;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={14}
                      textAnchor="middle"
                      fill={isToday ? '#08B9EF' : '#64748B'}
                      fontSize={11}
                      fontWeight={isToday ? 800 : 600}
                    >
                      {payload.value}
                    </text>
                    {isToday && (
                      <text
                        x={0}
                        y={0}
                        dy={26}
                        textAnchor="middle"
                        fill="#08B9EF"
                        fontSize={8}
                        fontWeight={800}
                      >
                        ● HARI INI
                      </text>
                    )}
                  </g>
                );
              }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              height={32}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit="m"
              allowDecimals={false}
            />
            <Tooltip content={<DailyDurationTooltip />} />

            {/* Target Line: 20 Menit */}
            <ReferenceLine
              y={targetMinutes}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Target: ${targetMinutes}m`,
                position: 'top',
                fill: '#D97706',
                fontSize: 10,
                fontWeight: 700,
              }}
            />

            <Bar
              dataKey="menitBelajar"
              name="Durasi Hafalan (Menit)"
              radius={[8, 8, 2, 2]}
              maxBarSize={32}
            >
              {dailyData.map((entry, index) => {
                // Color palette:
                // If today: Vibrant Sky-Blue '#08B9EF'
                // If exceeded target: Warm amber-orange '#F59E0B'
                // If active but below target: Soft sky-teal '#38BDF8'
                // If 0: slate '#E2E8F0'
                let barColor = '#38BDF8';
                if (entry.menitBelajar === 0) {
                  barColor = '#E2E8F0';
                } else if (entry.isToday) {
                  barColor = '#08B9EF';
                } else if (entry.menitBelajar >= targetMinutes) {
                  barColor = '#F59E0B';
                }

                return (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={barColor}
                    stroke={entry.isToday ? '#0284C7' : 'transparent'}
                    strokeWidth={entry.isToday ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend & Guidance */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <span className="w-3 h-3 rounded-md bg-[#F59E0B] inline-block" />
            <span>≥ {targetMinutes}m (Target Tercapai)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <span className="w-3 h-3 rounded-md bg-[#08B9EF] inline-block" />
            <span>Hari Ini</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
            <span>Garis Target</span>
          </span>
        </div>

        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="sm:hidden text-xs font-bold text-[#08B9EF] flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Laporan Orang Tua Lengkap</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
