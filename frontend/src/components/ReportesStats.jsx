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
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Total Registros</span>
            <span className="stat-value">{formatearNumero(totalRegistros)}</span>
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon">🗂️</div>
          <div className="stat-content">
            <span className="stat-label">Colecciones</span>
            <span className="stat-value">{colecciones.length}</span>
          </div>
        </div>

        {colecciones.slice(0, 3).map((coleccion) => {
          const stats = getEstadisticaColeccion(coleccion);
          return (
            <div key={coleccion} className="stat-card collection">
              <div className="stat-icon">📋</div>
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