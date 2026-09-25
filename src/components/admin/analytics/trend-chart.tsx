'use client';

import { useId, useState } from 'react';
import type { DailyPoint } from '@/modules/analytics/date-range';

const WIDTH = 640;
const HEIGHT = 180;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function TrendChart({ title, data, color = '#171310' }: { title: string; data: DailyPoint[]; color?: string }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.value));
  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PAD_LEFT + i * stepX,
    y: PAD_TOP + innerHeight - (d.value / max) * innerHeight,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points.at(-1)?.x.toFixed(1)},${PAD_TOP + innerHeight} L${points[0]?.x.toFixed(1)},${PAD_TOP + innerHeight} Z`;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const isEmpty = total === 0;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">{total.toLocaleString()} total</span>
      </div>
      {isEmpty ? (
        <p className="flex h-[140px] items-center justify-center text-sm text-slate-400">No data in this range yet</p>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`${title}: ${total} total over ${data.length} days, ranging from ${Math.min(...data.map((d) => d.value))} to ${max} per day`}
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.14} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Recessive baseline only — no full gridlines, keeps the chart uncluttered. */}
            <line
              x1={PAD_LEFT}
              y1={PAD_TOP + innerHeight}
              x2={WIDTH - PAD_RIGHT}
              y2={PAD_TOP + innerHeight}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {hovered ? (
              <>
                <line x1={hovered.x} y1={PAD_TOP} x2={hovered.x} y2={PAD_TOP + innerHeight} stroke="#cbd5e1" strokeWidth={1} />
                <circle cx={hovered.x} cy={hovered.y} r={4} fill={color} stroke="white" strokeWidth={1.5} />
              </>
            ) : null}
            <text x={PAD_LEFT} y={HEIGHT - 6} className="fill-slate-400" fontSize={10}>
              {formatDate(data[0]!.date)}
            </text>
            <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 6} textAnchor="end" className="fill-slate-400" fontSize={10}>
              {formatDate(data.at(-1)!.date)}
            </text>
          </svg>
          {hovered ? (
            <div
              className="pointer-events-none absolute rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-md"
              style={{
                left: `${(hovered.x / WIDTH) * 100}%`,
                top: 0,
                transform: `translateX(${hovered.x > WIDTH * 0.7 ? '-100%' : '0%'})`,
              }}
            >
              <p className="font-semibold text-slate-900">{hovered.value.toLocaleString()}</p>
              <p className="text-slate-500">{formatDate(hovered.date)}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
