import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import HorizontalBarChart from './charts/HorizontalBarChart';
import TopJuegosTabla from './TopJuegosTabla';
import MiniCard from './MiniCard';
import './Dashboard.css';

// Nuevo layout del Dashboard con secciones y placeholders
function Dashboard({ onCambiarVista }) {
  const [colecciones, setColecciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [seriesAnio, setSeriesAnio] = useState([]);
  const [seriesGeneros, setSeriesGeneros] = useState([]);
  const [ratingPromedio, setRatingPromedio] = useState(0);
  const [distribucionRating, setDistribucionRating] = useState([]);
  const [seriesDesarrolladores, setSeriesDesarrolladores] = useState([]);
  const [topJuegosPopulares, setTopJuegosPopulares] = useState([]);
  const [metricasAdicionales, setMetricasAdicionales] = useState({
    jugadores_activos: 0,
    reviews_totales: 0,
    juegos_2024: 0
  });
  const [hiddenGems, setHiddenGems] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);

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

        // Cargar rating promedio
        try {
          const rRating = await reportesAPI.ratingPromedio(preferida, 'Rating');
          console.log('Respuesta rating promedio:', rRating);
          const promedio = rRating.data?.rating_promedio || 0;
          console.log('Rating promedio:', promedio);
          setRatingPromedio(promedio);
        } catch (e) {
          console.error('Error cargando rating promedio:', e);
          setRatingPromedio(0);
        }

        // Cargar distribución de rating
        try {
          const rDistribucion = await reportesAPI.distribucionRating(preferida, 'Rating');
          console.log('Respuesta distribución rating:', rDistribucion);
          const distribucion = rDistribucion.data?.distribucion || [];
          
          // Normalizar a {rango, count, color}
          const serieDistribucion = distribucion.map(d => ({
            rango: d.rango,
            count: d.conteo,
            color: d.color
          }));
          console.log('Serie distribución:', serieDistribucion);
          setDistribucionRating(serieDistribucion);
        } catch (e) {
          console.error('Error cargando distribución rating:', e);
          setDistribucionRating([]);
        }

        // Cargar desarrolladores
        try {
          const rDesarrolladores = await reportesAPI.conteoDesarrolladores(preferida, 'Developers');
          console.log('Respuesta desarrolladores:', rDesarrolladores);
          const desarrolladoresData = rDesarrolladores.data?.conteos || [];
          
          // Normalizar a {desarrollador, count}
          const serieDesarrolladores = desarrolladoresData.map(d => ({
            desarrollador: d.desarrollador,
            count: d.conteo
          }));
          console.log('Serie desarrolladores:', serieDesarrolladores);
          setSeriesDesarrolladores(serieDesarrolladores);
        } catch (e) {
          console.error('Error cargando desarrolladores:', e);
          setSeriesDesarrolladores([]);
        }

        // Cargar top juegos populares
        try {
          const rTopJuegos = await reportesAPI.topJuegosPopulares(preferida, 20);
          console.log('Respuesta top juegos:', rTopJuegos);
          const juegosData = rTopJuegos.data?.juegos || [];
          console.log('Top juegos populares:', juegosData);
          setTopJuegosPopulares(juegosData);
        } catch (e) {
          console.error('Error cargando top juegos populares:', e);
          setTopJuegosPopulares([]);
        }

        // Cargar métricas adicionales
        try {
          const rMetricas = await reportesAPI.metricasDashboard(preferida);
          console.log('Respuesta métricas adicionales:', rMetricas);
          const metricas = rMetricas.data || {};
          setMetricasAdicionales({
            jugadores_activos: metricas.jugadores_activos || 0,
            reviews_totales: metricas.reviews_totales || 0,
            juegos_2024: metricas.juegos_2024 || 0
          });
        } catch (e) {
          console.error('Error cargando métricas adicionales:', e);
          setMetricasAdicionales({
            jugadores_activos: 0,
            reviews_totales: 0,
            juegos_2024: 0
          });
        }

        // Cargar Hidden Gems
        try {
          const rHidden = await reportesAPI.hiddenGems(preferida, 5);
          console.log('Respuesta hidden gems:', rHidden);
          const hiddenData = rHidden.data?.juegos || [];
          setHiddenGems(hiddenData);
        } catch (e) {
          console.error('Error cargando hidden gems:', e);
          setHiddenGems([]);
        }

        // Cargar Trending Games
        try {
          const rTrending = await reportesAPI.trendingGames(preferida, 5);
          console.log('Respuesta trending games:', rTrending);
          const trendingData = rTrending.data?.juegos || [];
          setTrendingGames(trendingData);
        } catch (e) {
          console.error('Error cargando trending games:', e);
          setTrendingGames([]);
        }

        // Cargar Top Rated Games
        try {
          const rTopRated = await reportesAPI.topRatedGames(preferida, 5);
          console.log('Respuesta top rated games:', rTopRated);
          const topRatedData = rTopRated.data?.juegos || [];
          setTopRatedGames(topRatedData);
        } catch (e) {
          console.error('Error cargando top rated games:', e);
          setTopRatedGames([]);
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
      <div className="title-bar"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chart-bar"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 20h14" /></svg> DASHBOARD DE ANÁLISIS DE VIDEOJUEGOS</div>

      {/* Métricas principales */}
      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-title">Total Juegos</span>
          <span className="stat-value">{totalJuegos.toLocaleString()}</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Rating Promedio</span>
          <span className="stat-value">{ratingPromedio > 0 ? ratingPromedio.toFixed(1) : '—'}</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Jugadores Activos</span>
          <span className="stat-value">{metricasAdicionales.jugadores_activos.toLocaleString()}</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Reviews Totales</span>
          <span className="stat-value">{metricasAdicionales.reviews_totales.toLocaleString()}</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Juegos 2024</span>
          <span className="stat-value">{metricasAdicionales.juegos_2024.toLocaleString()}</span>
        </article>
      </section>

      {/* Fila 1 de gráficos */}
      <section className="section-grid-2">
        <article className="panel">
          <header className="panel-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-timeline"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 16l6 -7l5 5l5 -6" /><path d="M15 14m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M10 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M4 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M20 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg> Juegos Lanzados por Año</header>
          <div className="panel-body">
            {seriesAnio.length > 0 ? (
              <LineChart data={seriesAnio} />
            ) : (
              <div className="placeholder">Sin datos de año</div>
            )}
          </div>
        </article>
        <article className="panel">
          <header className="panel-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-trophy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3a1 1 0 0 1 .993 .883l.007 .117v2.17a3 3 0 1 1 0 5.659v.171a6.002 6.002 0 0 1 -5 5.917v2.083h3a1 1 0 0 1 .117 1.993l-.117 .007h-8a1 1 0 0 1 -.117 -1.993l.117 -.007h3v-2.083a6.002 6.002 0 0 1 -4.996 -5.692l-.004 -.225v-.171a3 3 0 0 1 -3.996 -2.653l-.003 -.176l.005 -.176a3 3 0 0 1 3.995 -2.654l-.001 -2.17a1 1 0 0 1 1 -1h10zm-12 5a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z" /></svg>Top Géneros</header>
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
          <header className="panel-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-chart-donut"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.292 2.61c.396 .318 .65 .78 .703 1.286l.005 .104v4a1 1 0 0 1 -.748 .968a3.1 3.1 0 1 0 3.78 3.78a1 1 0 0 1 .968 -.748h3.8a2 2 0 0 1 2 2a1 1 0 0 1 -.026 .226a10 10 0 1 1 -12 -12l.057 -.01l.052 -.01a1.9 1.9 0 0 1 1.409 .404m3.703 -.11l.045 .002l.067 .004l.081 .014l.032 .004l.072 .022l.04 .01a10 10 0 0 1 6.003 5.818l.108 .294a1 1 0 0 1 -.943 1.332h-4.5a1 1 0 0 1 -.76 -.35a8 8 0 0 0 -.89 -.89a1 1 0 0 1 -.35 -.76v-4.5q .001 -.119 .026 -.23l.03 -.102a1 1 0 0 1 .168 -.299l.03 -.033l.039 -.043a1 1 0 0 1 .089 -.08l.051 -.034l.03 -.023l.045 -.025l.052 -.03a1 1 0 0 1 .435 -.101" /></svg> Distribución por Rating</header>
          <div className="panel-body">
            {distribucionRating.length > 0 ? (
              <DonutChart data={distribucionRating} />
            ) : (
              <div className="placeholder">Sin datos de rating</div>
            )}
          </div>
        </article>
        <article className="panel">
          <header className="panel-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-trophy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3a1 1 0 0 1 .993 .883l.007 .117v2.17a3 3 0 1 1 0 5.659v.171a6.002 6.002 0 0 1 -5 5.917v2.083h3a1 1 0 0 1 .117 1.993l-.117 .007h-8a1 1 0 0 1 -.117 -1.993l.117 -.007h3v-2.083a6.002 6.002 0 0 1 -4.996 -5.692l-.004 -.225v-.171a3 3 0 0 1 -3.996 -2.653l-.003 -.176l.005 -.176a3 3 0 0 1 3.995 -2.654l-.001 -2.17a1 1 0 0 1 1 -1h10zm-12 5a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z" /></svg>Top Desarrolla.</header>
          <div className="panel-body">
            {seriesDesarrolladores.length > 0 ? (
              <HorizontalBarChart data={seriesDesarrolladores} />
            ) : (
              <div className="placeholder">Sin datos de desarrolladores</div>
            )}
          </div>
        </article>
      </section>

      {/* Tabla principal */}
      <section className="section-grid-1">
        <article className="panel">
          <header className="panel-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-trophy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3a1 1 0 0 1 .993 .883l.007 .117v2.17a3 3 0 1 1 0 5.659v.171a6.002 6.002 0 0 1 -5 5.917v2.083h3a1 1 0 0 1 .117 1.993l-.117 .007h-8a1 1 0 0 1 -.117 -1.993l.117 -.007h3v-2.083a6.002 6.002 0 0 1 -4.996 -5.692l-.004 -.225v-.171a3 3 0 0 1 -3.996 -2.653l-.003 -.176l.005 -.176a3 3 0 0 1 3.995 -2.654l-.001 -2.17a1 1 0 0 1 1 -1h10zm-12 5a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z" /></svg> Top 20 Juegos Más Populares</header>
          <div className="panel-body">
            {topJuegosPopulares.length > 0 ? (
              <TopJuegosTabla data={topJuegosPopulares} />
            ) : (
              <div className="placeholder">Cargando top juegos populares...</div>
            )}
          </div>
        </article>
      </section>

      {/* Mini-cards */}
      <section className="section-grid-3">
        <article className="panel">
          <MiniCard
            title="Hidden Gems"
            icon="🔹"
            data={hiddenGems}
            tipo="hidden"
          />
        </article>
        <article className="panel">
          <MiniCard
            title="Trending"
            icon="🔥"
            data={trendingGames}
            tipo="trending"
          />
        </article>
        <article className="panel">
          <MiniCard
            title="Top Rated"
            icon="⭐"
            data={topRatedGames}
            tipo="toprated"
          />
        </article>
      </section>

      <div className="dashboard-footer">
        <p>Última actualización: {new Date().toLocaleString()}</p>
        <button onClick={cargarDatosDashboard} className="btn-actualizar"> Actualizar</button>
      </div>
    </div>
  );
}

export default Dashboard;