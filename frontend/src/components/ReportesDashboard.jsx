import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import ReporteForm from './ReporteForm';
import TablaReporte from './TablaReporte';
import ReportesStats from './ReportesStats';
import './ReportesDashboard.css';

function ReportesDashboard() {
  const [reporteData, setReporteData] = useState(null);
  const [colecciones, setColecciones] = useState([]);
  const [estadisticasGlobales, setEstadisticasGlobales] = useState({});
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState('generador'); // 'generador' o 'resultados'

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar colecciones
      const responseColecciones = await reportesAPI.obtenerColecciones();
      const coleccionesData = responseColecciones.data.colecciones || [];
      setColecciones(coleccionesData);

      // Cargar estadísticas de todas las colecciones
      const estadisticasPromises = coleccionesData.map(async (coleccion) => {
        try {
          const response = await reportesAPI.obtenerEstadisticas(coleccion);
          return { nombre: coleccion, ...response.data };
        } catch (error) {
          console.error(`Error obteniendo estadísticas de ${coleccion}:`, error);
          return { nombre: coleccion, total_documentos: 0 };
        }
      });

      const statsArr = await Promise.all(estadisticasPromises);
      const statsObj = {};
      statsArr.forEach(s => { statsObj[s.nombre] = s; });
      setEstadisticasGlobales(statsObj);

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReporteGenerado = (data) => {
    setReporteData(data);
    setVistaActiva('resultados');
  };

  const handleVolverGenerador = () => {
    setVistaActiva('generador');
  };

  const totalRegistros = Object.values(estadisticasGlobales).reduce(
    (total, stats) => total + (stats.total_documentos || 0), 0
  );

  if (loading) {
    return (
      <div className="reportes-dashboard-loading">
        <div className="loading-spinner" />
        <p>Cargando sistema de reportes...</p>
      </div>
    );
  }

  return (
    <div className="reportes-dashboard">
      <div className="reportes-header">
        <div className="header-content">
          <h1 className="reportes-title">
            📊 SISTEMA DE REPORTES AVANZADOS
          </h1>
          <div className="header-controls">
            <button 
              className={`tab-button ${vistaActiva === 'generador' ? 'active' : ''}`}
              onClick={() => setVistaActiva('generador')}
            >
              🔧 Generador
            </button>
            <button 
              className={`tab-button ${vistaActiva === 'resultados' ? 'active' : ''}`}
              onClick={() => setVistaActiva('resultados')}
              disabled={!reporteData}
            >
              📋 Resultados
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas globales */}
      <ReportesStats 
        colecciones={colecciones}
        estadisticas={estadisticasGlobales}
        totalRegistros={totalRegistros}
      />

      {/* Contenido principal */}
      <div className="reportes-content">
        {vistaActiva === 'generador' ? (
          <div className="generador-section">
            <div className="form-panel">
              <div className="panel-header">
                <h2>🛠️ Configuración del Reporte</h2>
                <p>Configure los parámetros para generar su reporte personalizado</p>
              </div>
              <div className="panel-body">
                <ReporteForm onReporteGenerado={handleReporteGenerado} />
              </div>
            </div>
          </div>
        ) : (
          <div className="resultados-section">
            <div className="resultados-panel">
              <div className="panel-header">
                <h2>📋 Resultados del Reporte</h2>
                <div className="resultados-controls">
                  <button 
                    className="btn-secondary"
                    onClick={handleVolverGenerador}
                  >
                    ← Volver al Generador
                  </button>
                  {reporteData && (
                    <span className="resultados-info">
                      {reporteData.total_registros} registros encontrados
                    </span>
                  )}
                </div>
              </div>
              <div className="panel-body">
                {reporteData && (
                  <TablaReporte
                    datos={reporteData.datos}
                    totalRegistros={reporteData.total_registros}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="reportes-footer">
        <p>Sistema de Reportes - Última actualización: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ReportesDashboard;