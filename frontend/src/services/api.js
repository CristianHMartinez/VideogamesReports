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
};

export default api;