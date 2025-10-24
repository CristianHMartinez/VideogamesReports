import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import './Dashboard.css';

// Nuevo layout del Dashboard con secciones y placeholders
function Dashboard({ onCambiarVista }) {
  const [colecciones, setColecciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [seriesAnio, setSeriesAnio] = useState([]);
  const [seriesGeneros, setSeriesGeneros] = useState([]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
  const responseColecciones = await reportesAPI.obtenerColecciones();
      const coleccionesData = responseColecciones.data.colecciones || [];
      setColecciones(coleccionesData);

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
      setEstadisticas(statsObj);

      // Cargar conteo por año desde Release_Date
      if (coleccionesData.length > 0) {
        const preferida = coleccionesData.includes('Videogames') ? 'Videogames' : coleccionesData[0];
        console.log('Intentando cargar datos de año para colección:', preferida);
        
        try {
          const rAnio = await reportesAPI.conteoPorAnio(preferida, 'Release_Date');
          console.log('Respuesta del API:', rAnio);
          const conteos = rAnio.data?.conteos || [];
          console.log('Conteos recibidos:', conteos);
          
          // Normalizar a {year, count}
          const serie = conteos
            .filter(d => d.valor !== null && d.valor !== undefined)
            .map(d => ({ year: d.valor, count: d.conteo }));
          console.log('Serie normalizada:', serie);
          setSeriesAnio(serie);
        } catch (e) {
          console.error('Error cargando conteo por año:', e);
          setSeriesAnio([]);
        }

        // Cargar conteo de géneros
        try {
          const rGeneros = await reportesAPI.conteoGeneros(preferida, 'Genres');
          console.log('Respuesta géneros:', rGeneros);
          const generosData = rGeneros.data?.conteos || [];
          
          // Normalizar a {genero, count}
          const serieGeneros = generosData.map(g => ({
            genero: g.genero,
            count: g.conteo
          }));
          console.log('Serie géneros:', serieGeneros);
          setSeriesGeneros(serieGeneros);
        } catch (e) {
          console.error('Error cargando géneros:', e);
          setSeriesGeneros([]);
        }
      }
    } catch (e) {
      console.error('Error cargando datos del dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalJuegos = Object.values(estadisticas).reduce((t, s) => t + (s.total_documentos || 0), 0);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Cargando estadísticas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-v2">
      <div className="title-bar">📊 DASHBOARD DE ANÁLISIS DE VIDEOJUEGOS</div>

      {/* Métricas principales */}
      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-title">Total Juegos</span>
          <span className="stat-value">{totalJuegos.toLocaleString()}</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Rating Promedio</span>
          <span className="stat-value">—</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Jugadores Activos</span>
          <span className="stat-value">—</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Reviews Totales</span>
          <span className="stat-value">—</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Juegos 2024</span>
          <span className="stat-value">—</span>
        </article>
      </section>

      {/* Fila 1 de gráficos */}
      <section className="section-grid-2">
        <article className="panel">
          <header className="panel-header">📈 Juegos Lanzados por Año</header>
          <div className="panel-body">
            {seriesAnio.length > 0 ? (
              <LineChart data={seriesAnio} />
            ) : (
              <div className="placeholder">Sin datos de año</div>
            )}
          </div>
        </article>
        <article className="panel">
          <header className="panel-header">📊 Top Géneros</header>
          <div className="panel-body">
            {seriesGeneros.length > 0 ? (
              <BarChart data={seriesGeneros} />
            ) : (
              <div className="placeholder">Sin datos de géneros</div>
            )}
          </div>
        </article>
      </section>

      {/* Fila 2 de gráficos */}
      <section className="section-grid-2">
        <article className="panel">
          <header className="panel-header">🍩 Distribución por Rating</header>
          <div className="panel-body placeholder">[Gráfico de Dona]</div>
        </article>
        <article className="panel">
          <header className="panel-header">📊 Top Desarrolla.</header>
          <div className="panel-body placeholder">[Gráfico Horizontal]</div>
        </article>
      </section>

      {/* Tabla principal */}
      <section className="section-grid-1">
        <article className="panel">
          <header className="panel-header">🏆 Top 20 Juegos Más Populares</header>
          <div className="panel-body placeholder">[Tabla Interactiva con Sorting]</div>
        </article>
      </section>

      {/* Mini-cards */}
      <section className="section-grid-3">
        <article className="panel">
          <header className="panel-header">🔹 Hidden Gems</header>
          <div className="panel-body placeholder">[Mini Cards]</div>
        </article>
        <article className="panel">
          <header className="panel-header">🔥 Trending</header>
          <div className="panel-body placeholder">[Mini Cards]</div>
        </article>
        <article className="panel">
          <header className="panel-header">⭐ Top Rated</header>
          <div className="panel-body placeholder">[Mini Cards]</div>
        </article>
      </section>

      <div className="dashboard-footer">
        <p>Última actualización: {new Date().toLocaleString()}</p>
        <button onClick={cargarDatosDashboard} className="btn-actualizar">🔄 Actualizar</button>
      </div>
    </div>
  );
}

export default Dashboard;