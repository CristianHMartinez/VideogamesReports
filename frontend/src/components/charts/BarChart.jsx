import React, { useMemo } from 'react';

/**
 * Simple responsive SVG Bar Chart
 * props:
 *  - data: Array<{ genero: string, count: number }>
 *  - color?: fill color for bars
 */
export default function BarChart({ data = [], color = '#10b981' }) {
  const { bars, maxCount } = useMemo(() => {
    const sorted = [...data]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10); // Top 10 géneros
    
    const maxCount = Math.max(1, ...sorted.map(d => d.count || 0));
    
    return { 
      bars: sorted.map((d, i) => ({ 
        ...d, 
        index: i, 
        height: ((d.count || 0) / maxCount) * 100 
      })), 
      maxCount 
    };
  }, [data]);

  const width = 600;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 80, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const barWidth = bars.length > 0 ? Math.max(30, chartW / bars.length - 8) : 30;
  const barSpacing = bars.length > 0 ? chartW / bars.length : 40;

  const x = (i) => padding.left + (i * barSpacing) + (barSpacing - barWidth) / 2;
  const y = (heightPercent) => padding.top + chartH - (chartH * heightPercent / 100);
  const barH = (heightPercent) => (chartH * heightPercent / 100);

  // Y axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, k) => 
    Math.round((k * maxCount) / yTicks)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="280">
      {/* Background grid lines */}
      {yTickValues.map((v, i) => (
        <line 
          key={i}
          x1={padding.left} 
          x2={padding.left + chartW} 
          y1={y((v / maxCount) * 100)} 
          y2={y((v / maxCount) * 100)}
          stroke="#f3f4f6" 
          strokeWidth="1"
        />
      ))}

      {/* Y axis */}
      <line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={padding.top + chartH} 
        stroke="#e5e7eb" 
        strokeWidth="2"
      />

      {/* X axis */}
      <line 
        x1={padding.left} 
        y1={padding.top + chartH} 
        x2={padding.left + chartW} 
        y2={padding.top + chartH} 
        stroke="#e5e7eb" 
        strokeWidth="2"
      />

      {/* Y axis labels */}
      {yTickValues.map((v, i) => (
        <text 
          key={i}
          x={padding.left - 8} 
          y={y((v / maxCount) * 100)} 
          textAnchor="end" 
          dominantBaseline="middle" 
          fontSize="11" 
          fill="#6b7280"
        >
          {v}
        </text>
      ))}

      {/* Bars */}
      {bars.map((bar, i) => (
        <g key={`${bar.genero}-${i}`}>
          <rect
            x={x(i)}
            y={y(bar.height)}
            width={barWidth}
            height={barH(bar.height)}
            fill={color}
            rx="2"
            className="bar"
            style={{ cursor: 'pointer' }}
          />
          
          {/* Value label on top of bar */}
          <text
            x={x(i) + barWidth / 2}
            y={y(bar.height) - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#374151"
            fontWeight="600"
          >
            {bar.count}
          </text>

          {/* Genre label (rotated) */}
          <text
            x={x(i) + barWidth / 2}
            y={padding.top + chartH + 15}
            textAnchor="start"
            fontSize="10"
            fill="#6b7280"
            transform={`rotate(45, ${x(i) + barWidth / 2}, ${padding.top + chartH + 15})`}
          >
            {bar.genero.length > 12 ? `${bar.genero.substring(0, 12)}...` : bar.genero}
          </text>
        </g>
      ))}

      {/* Chart title */}
      <text
        x={width / 2}
        y={15}
        textAnchor="middle"
        fontSize="12"
        fill="#374151"
        fontWeight="600"
      >
        Top 10 Géneros más Populares
      </text>
    </svg>
  );
}