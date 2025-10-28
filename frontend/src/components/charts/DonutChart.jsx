import React, { useMemo } from 'react';

/**
 * Simple responsive SVG Donut Chart
 * props:
 *  - data: Array<{ rango: string, count: number, color?: string }>
 */
export default function DonutChart({ data = [] }) {
  const { segments, total, center, radius } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
    const center = 120; // Centro del SVG
    const outerRadius = 80;
    const innerRadius = 45;
    
    // Colores consistentes con el tema del sitio
    const colors = [
      '#16394F', // Azul oscuro principal
      '#38707e', // Azul medio
      '#2c3e50', // Azul gris oscuro
      '#7f8c8d', // Gris medio
      '#bdc3c7', // Gris claro
      '#34495e', // Azul gris
    ];
    
    let currentAngle = -90; // Empezar desde arriba
    
    const segments = data.map((item, index) => {
      const percentage = total > 0 ? (item.count / total) * 100 : 0;
      const angle = (item.count / total) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Convertir ángulos a radianes para coordenadas
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      // Coordenadas del arco externo
      const x1 = center + outerRadius * Math.cos(startRad);
      const y1 = center + outerRadius * Math.sin(startRad);
      const x2 = center + outerRadius * Math.cos(endRad);
      const y2 = center + outerRadius * Math.sin(endRad);
      
      // Coordenadas del arco interno
      const x3 = center + innerRadius * Math.cos(endRad);
      const y3 = center + innerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(startRad);
      const y4 = center + innerRadius * Math.sin(startRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');
      
      // Posición para el label (en el medio del segmento)
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const labelRadius = (outerRadius + innerRadius) / 2;
      const labelX = center + labelRadius * Math.cos(midRad);
      const labelY = center + labelRadius * Math.sin(midRad);
      
      currentAngle = endAngle;
      
      return {
        ...item,
        pathData,
        percentage: percentage.toFixed(1),
        color: colors[index % colors.length], // Siempre usar colores del tema
        labelX,
        labelY,
        midAngle
      };
    });
    
    return { segments, total, center, radius: outerRadius };
  }, [data]);

  const width = 240;
  const height = 240;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-500">
        Sin datos de rating
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="240">
        {/* Segmentos del donut */}
        {segments.map((segment, index) => (
          <g key={`${segment.rango}-${index}`}>
            <path
              d={segment.pathData}
              fill={segment.color}
              stroke="#ffffff"
              strokeWidth="2"
              className="donut-segment"
              style={{ 
                cursor: 'pointer',
                filter: 'drop-shadow(0 2px 4px rgba(22, 57, 79, 0.2))',
                transition: 'all 0.3s ease'
              }}
            />
            
            {/* Label de porcentaje si es lo suficientemente grande */}
            {parseFloat(segment.percentage) > 8 && (
              <text
                x={segment.labelX}
                y={segment.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="white"
                fontWeight="600"
                style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
              >
                {segment.percentage}%
              </text>
            )}
          </g>
        ))}
        
        {/* Centro con total */}
        <circle
          cx={center}
          cy={center}
          r={35}
          fill="#ffffff"
          stroke="rgba(22, 57, 79, 0.2)"
          strokeWidth="2"
          style={{filter: 'drop-shadow(0 2px 4px rgba(22, 57, 79, 0.1))'}}
        />
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          fontSize="11"
          fill="#7f8c8d"
          fontWeight="500"
        >
          Total
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          fontSize="16"
          fill="#16394F"
          fontWeight="700"
        >
          {total.toLocaleString()}
        </text>
      </svg>
      
      {/* Leyenda */}
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        {segments.map((segment, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-700">
              {segment.rango}: {segment.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}