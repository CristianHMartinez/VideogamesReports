import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';

function ReporteForm({ onReporteGenerado }) {
  const [colecciones, setColecciones] = useState([]);
  const [coleccionSeleccionada, setColeccionSeleccionada] = useState('');
  const [campos, setCampos] = useState([]);
  const [filtros, setFiltros] = useState('{}');
  const [limite, setLimite] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarColecciones();
  }, []);

  const cargarColecciones = async () => {
    try {
      const response = await reportesAPI.obtenerColecciones();
      setColecciones(response.data.colecciones);
    } catch (error) {
      console.error('Error al cargar colecciones:', error);
    }
  };

  const cargarEstadisticas = async (coleccion) => {
    try {
      const response = await reportesAPI.obtenerEstadisticas(coleccion);
      setCampos(response.data.campos_disponibles);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleGenerarReporte = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filtrosObj = JSON.parse(filtros);
      const response = await reportesAPI.generarReporte({
        coleccion: coleccionSeleccionada,
        filtros: filtrosObj,
        limite: parseInt(limite),
      });

      onReporteGenerado(response.data);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar reporte: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerarReporte} className="reporte-form">
      <h2>Generar Reporte</h2>
      
      <div className="form-group">
        <label>Colección:</label>
        <select
          value={coleccionSeleccionada}
          onChange={(e) => {
            setColeccionSeleccionada(e.target.value);
            cargarEstadisticas(e.target.value);
          }}
          required
        >
          <option value="">Seleccione una colección</option>
          {colecciones.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Filtros (JSON):</label>
        <textarea
          value={filtros}
          onChange={(e) => setFiltros(e.target.value)}
          placeholder='{"campo": "valor"}'
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>Límite de registros:</label>
        <input
          type="number"
          value={limite}
          onChange={(e) => setLimite(e.target.value)}
          min="1"
          max="10000"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Generando...' : 'Generar Reporte'}
      </button>

      {campos.length > 0 && (
        <div className="campos-info">
          <h4>Campos disponibles:</h4>
          <p>{campos.join(', ')}</p>
        </div>
      )}
    </form>
  );
}

export default ReporteForm;