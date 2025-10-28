import React, { useMemo } from 'react';

/**
 * Simple responsive SVG Line Chart
 * props:
 *  - data: Array<{ year: number|string, count: number }>
 *  - color?: stroke color
 */
export default function LineChart({ data = [], color = '#16394F' }) {
  const { points, minY, maxY, years } = useMemo(() => {
    const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
    const years = sorted.map(d => d.year);
    const counts = sorted.map(d => d.count ?? d.conteo ?? 0);
    const minY = 0;
    const maxY = Math.max(1, ...counts);
    return { points: sorted.map((d, i) => ({ i, y: d.count ?? d.conteo ?? 0 })), minY, maxY, years };
  }, [data]);

  const width = 600; // virtual width
  const height = 260; // virtual height - aumentado para dar espacio al texto rotado
  const padding = { top: 16, right: 16, bottom: 50, left: 44 }; // bottom aumentado
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
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="260">
      {/* Gradient definition */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#16394F', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#38707e', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#16394F', stopOpacity: 0.3}} />
          <stop offset="100%" style={{stopColor: '#16394F', stopOpacity: 0.05}} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTickValues.map((v, i) => (
        <line 
          key={i}
          x1={padding.left} 
          x2={padding.left + chartW} 
          y1={y(v)} 
          y2={y(v)} 
          stroke="rgba(22, 57, 79, 0.1)" 
          strokeWidth="1"
        />
      ))}

      {/* axes */}
      <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="rgba(22, 57, 79, 0.3)" strokeWidth="2" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="rgba(22, 57, 79, 0.3)" strokeWidth="2" />

      {/* y ticks */}
      {yTickValues.map((v, i) => (
        <g key={i}>
          <line x1={padding.left - 4} x2={padding.left} y1={y(v)} y2={y(v)} stroke="rgba(22, 57, 79, 0.4)" />
          <text x={padding.left - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#7f8c8d" fontWeight="500">
            {v.toLocaleString()}
          </text>
        </g>
      ))}

      {/* x ticks */}
      {years.map((yr, i) => {
        // Mostrar etiquetas cada ciertos años para evitar empalme
        const showLabel = years.length <= 10 || i % Math.ceil(years.length / 8) === 0 || i === years.length - 1;
        return (
          <g key={yr}>
            <line x1={x(i)} x2={x(i)} y1={padding.top + chartH} y2={padding.top + chartH + 4} stroke="rgba(22, 57, 79, 0.4)" />
            {showLabel && (
              <text 
                x={x(i)} 
                y={padding.top + chartH + 12} 
                textAnchor="start" 
                fontSize="10" 
                fill="#7f8c8d" 
                fontWeight="500"
                transform={`rotate(45, ${x(i)}, ${padding.top + chartH + 12})`}
              >
                {yr}
              </text>
            )}
          </g>
        );
      })}

      {/* Area under line */}
      <path 
        d={`${pathD} L ${x(points.length - 1)} ${padding.top + chartH} L ${x(0)} ${padding.top + chartH} Z`} 
        fill="url(#areaGradient)" 
      />

      {/* line path */}
      <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3" style={{filter: 'drop-shadow(0 2px 4px rgba(22, 57, 79, 0.2))'}} />

      {/* circles */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.i)} cy={y(p.y)} r="5" fill="#ffffff" stroke="#16394F" strokeWidth="2" style={{filter: 'drop-shadow(0 1px 2px rgba(22, 57, 79, 0.3))'}} />
          <circle cx={x(p.i)} cy={y(p.y)} r="2" fill="#16394F" />
        </g>
      ))}
    </svg>
  );
}
