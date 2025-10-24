import React, { useMemo } from 'react';

/**
 * Simple responsive SVG Horizontal Bar Chart
 * props:
 *  - data: Array<{ desarrollador: string, count: number }>
 *  - color?: fill color for bars
 */
export default function HorizontalBarChart({ data = [], color = '#8b5cf6' }) {
  const { bars, maxCount } = useMemo(() => {
    const sorted = [...data]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 8); // Top 8 desarrolladores
    
    const maxCount = Math.max(1, ...sorted.map(d => d.count || 0));
    
    return { 
      bars: sorted.map((d, i) => ({ 
        ...d, 
        index: i, 
        width: ((d.count || 0) / maxCount) * 100 
      })), 
      maxCount 
    };
  }, [data]);

  const width = 600;
  const height = 320;
  const padding = { top: 20, right: 80, bottom: 20, left: 140 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const barHeight = bars.length > 0 ? Math.max(25, chartH / bars.length - 8) : 25;
  const barSpacing = bars.length > 0 ? chartH / bars.length : 35;

  const x = (widthPercent) => padding.left + (chartW * widthPercent / 100);
  const y = (i) => padding.top + (i * barSpacing) + (barSpacing - barHeight) / 2;
  const barW = (widthPercent) => (chartW * widthPercent / 100);

  // X axis ticks
  const xTicks = 5;
  const xTickValues = Array.from({ length: xTicks + 1 }, (_, k) => 
    Math.round((k * maxCount) / xTicks)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="320">
      {/* Background grid lines */}
      {xTickValues.map((v, i) => (
        <line 
          key={i}
          x1={x((v / maxCount) * 100)} 
          x2={x((v / maxCount) * 100)} 
          y1={padding.top} 
          y2={padding.top + chartH}
          stroke="#f3f4f6" 
          strokeWidth="1"
        />
      ))}

      {/* X axis */}
      <line 
        x1={padding.left} 
        y1={padding.top + chartH} 
        x2={padding.left + chartW} 
        y2={padding.top + chartH} 
        stroke="#e5e7eb" 
        strokeWidth="2"
      />

      {/* Y axis */}
      <line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={padding.top + chartH} 
        stroke="#e5e7eb" 
        strokeWidth="2"
      />

      {/* X axis labels */}
      {xTickValues.map((v, i) => (
        <text 
          key={i}
          x={x((v / maxCount) * 100)} 
          y={padding.top + chartH + 15} 
          textAnchor="middle" 
          fontSize="11" 
          fill="#6b7280"
        >
          {v}
        </text>
      ))}

      {/* Bars */}
      {bars.map((bar, i) => (
        <g key={`${bar.desarrollador}-${i}`}>
          {/* Developer name (left side) */}
          <text
            x={padding.left - 8}
            y={y(i) + barHeight / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="11"
            fill="#374151"
            fontWeight="500"
          >
            {bar.desarrollador.length > 18 ? `${bar.desarrollador.substring(0, 18)}...` : bar.desarrollador}
          </text>

          {/* Bar */}
          <rect
            x={padding.left}
            y={y(i)}
            width={barW(bar.width)}
            height={barHeight}
            fill={color}
            rx="3"
            className="bar"
            style={{ cursor: 'pointer' }}
          />
          
          {/* Value label (right side of bar) */}
          <text
            x={x(bar.width) + 6}
            y={y(i) + barHeight / 2}
            textAnchor="start"
            dominantBaseline="middle"
            fontSize="11"
            fill="#374151"
            fontWeight="600"
          >
            {bar.count}
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
        Top Desarrolladores por Cantidad de Juegos
      </text>
    </svg>
  );
}