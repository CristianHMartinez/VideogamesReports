import React, { useMemo } from 'react';

/**
 * Simple responsive SVG Line Chart
 * props:
 *  - data: Array<{ year: number|string, count: number }>
 *  - color?: stroke color
 */
export default function LineChart({ data = [], color = '#2563eb' }) {
  const { points, minY, maxY, years } = useMemo(() => {
    const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
    const years = sorted.map(d => d.year);
    const counts = sorted.map(d => d.count ?? d.conteo ?? 0);
    const minY = 0;
    const maxY = Math.max(1, ...counts);
    return { points: sorted.map((d, i) => ({ i, y: d.count ?? d.conteo ?? 0 })), minY, maxY, years };
  }, [data]);

  const width = 600; // virtual width
  const height = 240; // virtual height
  const padding = { top: 16, right: 16, bottom: 36, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const x = i => (points.length <= 1 ? 0 : (i / (points.length - 1)) * chartW) + padding.left;
  const y = v => padding.top + chartH - (chartH * (v - minY)) / (maxY - minY);

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.i).toFixed(2)} ${y(p.y).toFixed(2)}`)
    .join(' ');

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, k) => Math.round((k * maxY) / yTicks));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="240">
      {/* axes */}
      <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="#e5e7eb" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="#e5e7eb" />

      {/* y ticks */}
      {yTickValues.map((v, i) => (
        <g key={i}>
          <line x1={padding.left - 4} x2={padding.left} y1={y(v)} y2={y(v)} stroke="#9ca3af" />
          <text x={padding.left - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#6b7280">
            {v.toLocaleString()}
          </text>
        </g>
      ))}

      {/* x ticks */}
      {years.map((yr, i) => (
        <g key={yr}>
          <line x1={x(i)} x2={x(i)} y1={padding.top + chartH} y2={padding.top + chartH + 4} stroke="#9ca3af" />
          <text x={x(i)} y={padding.top + chartH + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
            {yr}
          </text>
        </g>
      ))}

      {/* line path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />

      {/* circles */}
      {points.map((p, i) => (
        <circle key={i} cx={x(p.i)} cy={y(p.y)} r={3} fill={color} />
      ))}
    </svg>
  );
}
