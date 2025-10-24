import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const reportesAPI = {
  obtenerColecciones: () => api.get('/reportes/colecciones'),
  
  obtenerEstadisticas: (coleccion) => 
    api.get(`/reportes/estadisticas/${coleccion}`),
  
  generarReporte: (datos) => api.post('/reportes/generar', datos),
  
  obtenerEsquemaColeccion: (coleccion) =>
    api.get(`/reportes/esquema/${coleccion}`),
  
  obtenerValoresUnicos: (coleccion, campo) =>
    api.get(`/reportes/valores-unicos/${coleccion}/${campo}`),

  conteoPorCampo: (coleccion, campo) =>
    api.get(`/reportes/conteo-por-campo/${coleccion}/${campo}`),

  conteoPorAnio: (coleccion, campo, formato = "%b %d, %Y") =>
    api.get(`/reportes/conteo-por-anio/${coleccion}/${campo}`, { params: { formato } }),

  conteoGeneros: (coleccion, campo = "Genres") =>
    api.get(`/reportes/conteo-generos/${coleccion}`, { params: { campo } }),

  ratingPromedio: (coleccion, campo = "Rating") =>
    api.get(`/reportes/rating-promedio/${coleccion}`, { params: { campo } }),

  distribucionRating: (coleccion, campo = "Rating") =>
    api.get(`/reportes/distribucion-rating/${coleccion}`, { params: { campo } }),

  conteoDesarrolladores: (coleccion, campo = "Developers") =>
    api.get(`/reportes/conteo-desarrolladores/${coleccion}`, { params: { campo } }),

  topJuegosPopulares: (coleccion, limite = 20) =>
    api.get(`/reportes/top-juegos-populares/${coleccion}`, { params: { limite } }),
};

export default api;