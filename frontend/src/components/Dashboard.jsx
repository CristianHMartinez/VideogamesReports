import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import './Dashboard.css';

function Dashboard({ onCambiarVista }) {
  const [colecciones, setColecciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      
      // Obtener colecciones
      const responseColecciones = await reportesAPI.obtenerColecciones();
      const coleccionesData = responseColecciones.data.colecciones || [];
      setColecciones(coleccionesData);

      // Obtener estadísticas de cada colección
      const estadisticasPromises = coleccionesData.map(async (coleccion) => {
        try {
          const response = await reportesAPI.obtenerEstadisticas(coleccion);
          return {
            nombre: coleccion,
            ...response.data
          };
        } catch (error) {
          console.error(`Error obteniendo estadísticas de ${coleccion}:`, error);
          return {
            nombre: coleccion,
            total_documentos: 0,
            campos_disponibles: []
          };
        }
      });

      const estadisticasArray = await Promise.all(estadisticasPromises);
      const estadisticasObj = {};
      estadisticasArray.forEach(stat => {
        estadisticasObj[stat.nombre] = stat;
      });
      
      setEstadisticas(estadisticasObj);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalRegistros = () => {
    return Object.values(estadisticas).reduce((total, stat) => total + (stat.total_documentos || 0), 0);
  };

  const calcularTotalCampos = () => {
    return Object.values(estadisticas).reduce((total, stat) => total + (stat.campos_disponibles?.length || 0), 0);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Panel de Control</h2>
        <p>Resumen general del sistema de reportes</p>
      </div>

      <div className="dashboard-resumen">
        <div className="tarjeta-resumen">
          <div className="tarjeta-icono colecciones">📊</div>
          <div className="tarjeta-contenido">
            <h3>{colecciones.length}</h3>
            <p>Colecciones</p>
          </div>
        </div>

        <div className="tarjeta-resumen">
          <div className="tarjeta-icono registros">📋</div>
          <div className="tarjeta-contenido">
            <h3>{calcularTotalRegistros().toLocaleString()}</h3>
            <p>Total Registros</p>
          </div>
        </div>

        <div className="tarjeta-resumen">
          <div className="tarjeta-icono campos">🏷️</div>
          <div className="tarjeta-contenido">
            <h3>{calcularTotalCampos()}</h3>
            <p>Campos Únicos</p>
          </div>
        </div>

        <div className="tarjeta-resumen">
          <div className="tarjeta-icono sistema">⚡</div>
          <div className="tarjeta-contenido">
            <h3>Activo</h3>
            <p>Estado Sistema</p>
          </div>
        </div>
      </div>

      <div className="dashboard-contenido">
        <div className="seccion-colecciones">
          <h3>Colecciones Disponibles</h3>
          <div className="colecciones-grid">
            {colecciones.map((coleccion) => {
              const stats = estadisticas[coleccion] || {};
              return (
                <div key={coleccion} className="tarjeta-coleccion">
                  <div className="coleccion-header">
                    <h4>{coleccion}</h4>
                    <span className="coleccion-badge">
                      {stats.total_documentos || 0} registros
                    </span>
                  </div>
                  <div className="coleccion-detalles">
                    <p>
                      <strong>Campos disponibles:</strong> {stats.campos_disponibles?.length || 0}
                    </p>
                    <div className="campos-preview">
                      {stats.campos_disponibles?.slice(0, 3).map((campo) => (
                        <span key={campo} className="campo-tag">{campo}</span>
                      ))}
                      {stats.campos_disponibles?.length > 3 && (
                        <span className="campo-tag mas">+{stats.campos_disponibles.length - 3} más</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="seccion-accesos-rapidos">
          <h3>Accesos Rápidos</h3>
          <div className="accesos-grid">
            <button 
              className="acceso-rapido reportes"
              onClick={() => onCambiarVista && onCambiarVista('reportes')}
            >
              <span className="acceso-icono">📋</span>
              <div>
                <h4>Generar Reporte</h4>
                <p>Crear un nuevo reporte personalizado</p>
              </div>
            </button>
            
            <button className="acceso-rapido estadisticas">
              <span className="acceso-icono">📊</span>
              <div>
                <h4>Ver Estadísticas</h4>
                <p>Análisis detallado de las colecciones</p>
              </div>
            </button>
            
            <button className="acceso-rapido exportar">
              <span className="acceso-icono">💾</span>
              <div>
                <h4>Exportar Datos</h4>
                <p>Descargar información del sistema</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p>Última actualización: {new Date().toLocaleString()}</p>
        <button onClick={cargarDatosDashboard} className="btn-actualizar">
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
}

export default Dashboard;