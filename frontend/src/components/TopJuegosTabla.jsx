import { useState, useEffect } from 'react';
import './TopJuegosTabla.css';

function TopJuegosTabla({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  if (!data || data.length === 0) {
    return (
      <div className="top-juegos-empty">
        <p>No hay datos de juegos disponibles</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const formatearGeneros = (generos) => {
    if (!generos) return '—';
    if (Array.isArray(generos)) {
      return generos.slice(0, 2).join(', ') + (generos.length > 2 ? '...' : '');
    }
    return String(generos).slice(0, 30) + (String(generos).length > 30 ? '...' : '');
  };

  const formatearDesarrolladores = (desarrolladores) => {
    if (!desarrolladores) return '—';
    if (Array.isArray(desarrolladores)) {
      return desarrolladores[0] || '—';
    }
    return String(desarrolladores).slice(0, 25) + (String(desarrolladores).length > 25 ? '...' : '');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    
    // Si es una fecha ISO
    if (fecha.includes('T')) {
      return new Date(fecha).getFullYear();
    }
    
    // Si es un string de fecha en formato diferente
    const year = fecha.match(/\d{4}/);
    return year ? year[0] : '—';
  };

  return (
    <div className="top-juegos-tabla-container">
      <div className="tabla-wrapper">
        <table className="top-juegos-tabla">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th 
                className="sortable"
                onClick={() => requestSort('nombre')}
              >
                Juego{getSortIcon('nombre')}
              </th>
              <th 
                className="sortable rating-col"
                onClick={() => requestSort('rating')}
              >
                Rating{getSortIcon('rating')}
              </th>
              <th 
                className="sortable score-col"
                onClick={() => requestSort('popularidad_score')}
              >
                Score{getSortIcon('popularidad_score')}
              </th>
              <th className="generos-col">Géneros</th>
              <th className="dev-col">Desarrollador</th>
              <th 
                className="sortable fecha-col"
                onClick={() => requestSort('fecha_lanzamiento')}
              >
                Año{getSortIcon('fecha_lanzamiento')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((juego, index) => (
              <tr key={index} className="juego-row">
                <td className="rank-cell">
                  <span className={`rank-badge ${index < 3 ? 'top-3' : ''}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="nombre-cell" title={juego.nombre}>
                  <div className="nombre-truncado">
                    {juego.nombre}
                  </div>
                </td>
                <td className="rating-cell">
                  <span className={`rating-badge ${juego.rating >= 8 ? 'high' : juego.rating >= 6 ? 'medium' : 'low'}`}>
                    {juego.rating ? juego.rating.toFixed(1) : '—'}
                  </span>
                </td>
                <td className="score-cell">
                  <span className="score-value">
                    {juego.popularidad_score || '—'}
                  </span>
                </td>
                <td className="generos-cell" title={Array.isArray(juego.generos) ? juego.generos.join(', ') : juego.generos}>
                  {formatearGeneros(juego.generos)}
                </td>
                <td className="dev-cell" title={Array.isArray(juego.desarrolladores) ? juego.desarrolladores.join(', ') : juego.desarrolladores}>
                  {formatearDesarrolladores(juego.desarrolladores)}
                </td>
                <td className="fecha-cell">
                  {formatearFecha(juego.fecha_lanzamiento)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopJuegosTabla;