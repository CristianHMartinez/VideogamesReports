import './ReportesStats.css';

function ReportesStats({ colecciones, estadisticas, totalRegistros }) {
  
  const getEstadisticaColeccion = (nombre) => {
    return estadisticas[nombre] || { total_documentos: 0 };
  };

  const formatearNumero = (numero) => {
    return numero.toLocaleString();
  };

  return (
    <div className="reportes-stats">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chart-histogram"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M20 18v3" /><path d="M16 16v5" /><path d="M12 13v8" /><path d="M8 16v5" /><path d="M3 11c6 0 5 -5 9 -5s3 5 9 5" /></svg></div>
          <div className="stat-content">
            <span className="stat-label">Total Registros</span>
            <span className="stat-value">{formatearNumero(totalRegistros)}</span>
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-folder"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z" /></svg></div>
          <div className="stat-content">
            <span className="stat-label">Colecciones</span>
            <span className="stat-value">{colecciones.length}</span>
          </div>
        </div>

        {colecciones.slice(0, 3).map((coleccion) => {
          const stats = getEstadisticaColeccion(coleccion);
          return (
            <div key={coleccion} className="stat-card collection">
              <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-gamepad-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4z" /><path d="M14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232" /><path d="M8 9v2" /><path d="M7 10h2" /><path d="M14 10h2" /></svg></div>
              <div className="stat-content">
                <span className="stat-label">{coleccion}</span>
                <span className="stat-value">{formatearNumero(stats.total_documentos)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Colecciones adicionales si hay más de 3 */}
      {colecciones.length > 3 && (
        <div className="collections-overflow">
          <div className="overflow-header">
            <h4>📁 Otras Colecciones</h4>
          </div>
          <div className="collections-list">
            {colecciones.slice(3).map((coleccion) => {
              const stats = getEstadisticaColeccion(coleccion);
              return (
                <div key={coleccion} className="collection-item">
                  <span className="collection-name">{coleccion}</span>
                  <span className="collection-count">{formatearNumero(stats.total_documentos)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportesStats;