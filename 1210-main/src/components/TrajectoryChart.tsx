import React, { useState } from 'react';
import { ForecastPoint } from '../types';
import { Calendar, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TrajectoryChartProps {
  data: ForecastPoint[];
  height?: number;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ data, height = 270 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  // Helper to get formatted date & clock time details dynamically from point
  const getDateInfo = (point: ForecastPoint) => {
    const base = new Date();
    const target = new Date(base.getTime() + (point.hoursAhead || 0) * 3600000);
    const clockTime = target.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (point.dateStr && point.dayName) {
      return {
        clockTime,
        dateStr: point.dateStr,
        dayName: point.dayName,
        fullLabel: point.fullDateLabel || `${point.dayName}, ${point.dateStr} 2026`,
      };
    }
    const dayName = target.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = target.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = target.getDate();
    return {
      clockTime,
      dateStr: `${dayNum} ${monthName}`,
      dayName,
      fullLabel: `${dayName}, ${dayNum} ${monthName} 2026`,
    };
  };

  const paddingLeft = 44;
  const paddingRight = 32;
  const paddingTop = 32; // Extra room for date badge headers at top
  const paddingBottom = 54; // Fits both Time/Hour label and Date/Clock
  const chartWidth = 720;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const minRisk = 0;
  const maxRisk = 100;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / maxRisk) * innerHeight;
  };

  // Build SVG path for the risk curve
  const points = data.map((d, i) => `${getX(i)},${getY(d.riskScore)}`).join(' L ');
  const pathD = `M ${points}`;

  // Build SVG path for confidence band
  const upperPoints = data.map((d, i) => `${getX(i)},${getY(d.confidenceUpper)}`).join(' L ');
  const lowerPoints = [...data]
    .reverse()
    .map((d, i) => {
      const originalIndex = data.length - 1 - i;
      return `${getX(originalIndex)},${getY(d.confidenceLower)}`;
    })
    .join(' L ');
  const confidenceAreaD = `M ${upperPoints} L ${lowerPoints} Z`;

  // Area under curve
  const areaUnderCurve = `M ${getX(0)},${getY(0)} L ${points} L ${getX(data.length - 1)},${getY(0)} Z`;

  // Danger threshold Y
  const dangerY = getY(80);

  // CRITICAL FIX: Default to point 0 ("Now" / present time) when not hovering, NEVER point (data.length - 1)
  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : data[0];
  const activeDateInfo = getDateInfo(activePoint);
  const activeX = hoveredIndex !== null ? getX(hoveredIndex) : getX(0);
  const activeY = getY(activePoint.riskScore);

  // Group forecast by unique dates for date horizon pills and boundaries
  const dateGroups: { dateStr: string; dayName: string; startIndex: number; endIndex: number; points: ForecastPoint[] }[] = [];
  data.forEach((p, idx) => {
    const info = getDateInfo(p);
    const existing = dateGroups.find((g) => g.dateStr === info.dateStr);
    if (!existing) {
      dateGroups.push({
        dateStr: info.dateStr,
        dayName: info.dayName,
        startIndex: idx,
        endIndex: idx,
        points: [p],
      });
    } else {
      existing.endIndex = idx;
      existing.points.push(p);
    }
  });

  return (
    <div className="w-full flex flex-col">
      {/* Top Header with Active Date, Accurate Clock Time & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 mb-2.5 px-1 gap-2">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300 font-medium">Trajectory</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-cyan-500/20 border border-cyan-500/40"></span>
            <span>90% Ensemble Spread</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-rose-500 border-dashed"></span>
            <span className="text-rose-400 font-medium">Danger Mark (80)</span>
          </span>
        </div>

        {activePoint && (
          <div className="flex items-center gap-2 text-[11px] font-mono-telemetry text-slate-300 bg-slate-900/95 px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm self-start sm:self-auto flex-wrap">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>{activeDateInfo.fullLabel}</span>
              <span className="text-slate-400 font-normal">
                ({activePoint.hourLabel} • {activeDateInfo.clockTime})
              </span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span>
              Risk:{' '}
              <b
                className={
                  activePoint.riskScore >= 80
                    ? 'text-rose-400'
                    : activePoint.riskScore >= 60
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {activePoint.riskScore}/100
              </b>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span>
              River Stage: <b className="text-white">{activePoint.waterLevelM}m</b>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span>
              Rain: <b className="text-blue-300">{activePoint.rainfallForecastMm}mm</b>
            </span>
          </div>
        )}
      </div>

      {/* SVG Trajectory Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Date Boundary Vertical Lines and Header Banners */}
          {dateGroups.map((group, gIdx) => {
            const startX = getX(group.startIndex);
            const endX = getX(group.endIndex);
            const midX = (startX + endX) / 2;

            return (
              <g key={group.dateStr}>
                {/* Vertical separator line between consecutive days */}
                {gIdx > 0 && (
                  <g>
                    <line
                      x1={(getX(group.startIndex - 1) + startX) / 2}
                      y1={paddingTop - 12}
                      x2={(getX(group.startIndex - 1) + startX) / 2}
                      y2={chartHeight - paddingBottom}
                      stroke="rgba(148, 163, 184, 0.25)"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* Date header label pill along top */}
                <rect
                  x={midX - 42}
                  y={4}
                  width="84"
                  height="18"
                  rx="9"
                  fill="#0b1324"
                  stroke={gIdx === 0 ? '#06b6d4' : gIdx === 1 ? '#f59e0b' : '#10b981'}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={midX}
                  y={16}
                  textAnchor="middle"
                  fill={gIdx === 0 ? '#38bdf8' : gIdx === 1 ? '#fbbf24' : '#34d399'}
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  📅 {group.dateStr}
                </text>
              </g>
            );
          })}

          {/* Grid lines (Risk 0 - 100) */}
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={
                    tick === 80
                      ? 'rgba(244, 63, 94, 0.45)'
                      : tick === 60
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(30, 41, 59, 0.8)'
                  }
                  strokeDasharray={tick === 80 || tick === 60 ? '3 3' : undefined}
                  strokeWidth={tick === 80 ? 1.5 : 1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill={tick === 80 ? '#f43f5e' : '#64748b'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Danger zone label */}
          <text
            x={chartWidth - paddingRight}
            y={dangerY - 5}
            textAnchor="end"
            fill="#f43f5e"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="0.05em"
          >
            CRITICAL THRESHOLD (80)
          </text>

          {/* Confidence Band Area */}
          <path d={confidenceAreaD} fill="url(#confidenceGrad)" />

          {/* Gradient area under main curve */}
          <path d={areaUnderCurve} fill="url(#riskAreaGrad)" />

          {/* Risk Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X axis labels (Time + Date + Clock) & data points */}
          {data.map((point, i) => {
            const x = getX(i);
            const y = getY(point.riskScore);
            const isHovered = hoveredIndex === i;
            const dateInfo = getDateInfo(point);

            return (
              <g
                key={`${point.hourLabel}-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              >
                {/* Vertical helper line on hover or point 0 indicator */}
                {(isHovered || (hoveredIndex === null && i === 0)) && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={chartHeight - paddingBottom}
                    stroke="#38bdf8"
                    strokeDasharray="2 2"
                    strokeWidth={isHovered ? 1.5 : 1}
                    strokeOpacity={isHovered ? 1 : 0.4}
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : i === 0 ? 5 : 4}
                  fill={point.riskScore >= 80 ? '#f43f5e' : '#080d19'}
                  stroke={point.riskScore >= 80 ? '#f43f5e' : i === 0 ? '#38bdf8' : '#22d3ee'}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all"
                />

                {/* Line 1: Offset / Hour Label */}
                <text
                  x={x}
                  y={chartHeight - 26}
                  textAnchor="middle"
                  fill={isHovered ? '#38bdf8' : i === 0 ? '#38bdf8' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight={isHovered || i === 0 ? 'bold' : '600'}
                >
                  {point.hourLabel}
                </text>

                {/* Line 2: Calendar Date & Estimated Time */}
                <text
                  x={x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fill={isHovered ? '#67e8f9' : '#64748b'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {dateInfo.dateStr}
                </text>
              </g>
            );
          })}

          {/* Tooltip on hover */}
          {hoveredIndex !== null && (
            <g
              transform={`translate(${Math.min(
                chartWidth - 155,
                Math.max(paddingLeft, activeX - 75)
              )}, ${Math.max(paddingTop + 14, activeY - 60)})`}
              className="pointer-events-none"
            >
              <rect
                width="150"
                height="50"
                rx="8"
                fill="#090f1e"
                stroke="#38bdf8"
                strokeWidth="1.2"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
              />
              <text x="75" y="15" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold">
                📅 {activeDateInfo.dayName}, {activeDateInfo.dateStr} ({activeDateInfo.clockTime})
              </text>
              <text x="75" y="29" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="600">
                Risk: {activePoint.riskScore}/100 ({activePoint.hourLabel})
              </text>
              <text x="75" y="42" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
                Stage: {activePoint.waterLevelM}m • Rain: {activePoint.rainfallForecastMm}mm
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Date Horizon Multi-Day Breakdown Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-800/80 text-xs">
        {dateGroups.map((group, idx) => {
          const maxGroupRisk = Math.max(...group.points.map((p) => p.riskScore));
          const isHigh = maxGroupRisk >= 80;
          const isWarn = maxGroupRisk >= 60;
          const firstHour = group.points[0]?.hourLabel;
          const lastHour = group.points[group.points.length - 1]?.hourLabel;

          return (
            <div
              key={group.dateStr}
              onClick={() => setHoveredIndex(group.startIndex)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0a1120] hover:bg-slate-900/90 border border-slate-800/90 cursor-pointer transition-colors"
            >
              <div
                className={`p-2 rounded-lg ${
                  idx === 0
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : idx === 1
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">
                    {group.dayName}, {group.dateStr}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isHigh ? 'Critical' : isWarn ? 'Elevated' : 'Safe'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>
                    {firstHour === lastHour ? firstHour : `${firstHour} → ${lastHour}`}
                  </span>
                  <span className="font-mono text-slate-300">
                    Max: <b>{maxGroupRisk}/100</b>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
