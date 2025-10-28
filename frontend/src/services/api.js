import axios from 'axios';

// Configuración de la URL base de la API
// IMPORTANTE: Siempre usa la variable de entorno VITE_API_URL
// Si no está configurada, usa la URL de producción directamente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://videogamesreports-production.up.railway.app';

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const reportesAPI = {
  obtenerColecciones: () => api.get('/api/reportes/colecciones'),
  
  obtenerEstadisticas: (coleccion) => 
    api.get(`/api/reportes/estadisticas/${coleccion}`),
  
  generarReporte: (datos) => api.post('/api/reportes/generar', datos),
  
  obtenerEsquemaColeccion: (coleccion) =>
    api.get(`/api/reportes/esquema/${coleccion}`),
  
  obtenerValoresUnicos: (coleccion, campo) =>
    api.get(`/api/reportes/valores-unicos/${coleccion}/${campo}`),

  conteoPorCampo: (coleccion, campo) =>
    api.get(`/api/reportes/conteo-por-campo/${coleccion}/${campo}`),

  conteoPorAnio: (coleccion, campo, formato = "%b %d, %Y") =>
    api.get(`/api/reportes/conteo-por-anio/${coleccion}/${campo}`, { params: { formato } }),

  conteoGeneros: (coleccion, campo = "Genres") =>
    api.get(`/api/reportes/conteo-generos/${coleccion}`, { params: { campo } }),

  ratingPromedio: (coleccion, campo = "Rating") =>
    api.get(`/api/reportes/rating-promedio/${coleccion}`, { params: { campo } }),

  distribucionRating: (coleccion, campo = "Rating") =>
    api.get(`/api/reportes/distribucion-rating/${coleccion}`, { params: { campo } }),

  conteoDesarrolladores: (coleccion, campo = "Developers") =>
    api.get(`/api/reportes/conteo-desarrolladores/${coleccion}`, { params: { campo } }),

  topJuegosPopulares: (coleccion, limite = 20) =>
    api.get(`/api/reportes/top-juegos-populares/${coleccion}`, { params: { limite } }),

  metricasDashboard: (coleccion) =>
    api.get(`/api/reportes/metricas-dashboard/${coleccion}`),

  hiddenGems: (coleccion, limite = 5) =>
    api.get(`/api/reportes/hidden-gems/${coleccion}`, { params: { limite } }),

  trendingGames: (coleccion, limite = 5) =>
    api.get(`/api/reportes/trending-games/${coleccion}`, { params: { limite } }),

  topRatedGames: (coleccion, limite = 5) =>
    api.get(`/api/reportes/top-rated-games/${coleccion}`, { params: { limite } }),
};

export default api;