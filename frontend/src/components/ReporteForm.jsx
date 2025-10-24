import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import FiltrosAvanzados from './FiltrosAvanzados';
import './ReporteForm.css';

function ReporteForm({ onReporteGenerado }) {
  const [colecciones, setColecciones] = useState([]);
  const [coleccionSeleccionada, setColeccionSeleccionada] = useState('');
  const [campos, setCampos] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({});
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
      const response = await reportesAPI.generarReporte({
        coleccion: coleccionSeleccionada,
        filtros: filtrosAvanzados,
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

  const manejarCambioFiltros = (nuevosFiltros) => {
    setFiltrosAvanzados(nuevosFiltros);
  };

  return (
    <div className="reporte-form-modern">
      <div className="form-section">
        <h3 className="section-title">🗂️ Selección de Datos</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Colección de Datos:</label>
            <select
              value={coleccionSeleccionada}
              onChange={(e) => {
                setColeccionSeleccionada(e.target.value);
                cargarEstadisticas(e.target.value);
                setFiltrosAvanzados({});
              }}
              required
              className="form-select"
            >
              <option value="">🔍 Seleccione una colección...</option>
              {colecciones.map((col) => (
                <option key={col} value={col}>
                  📋 {col}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Límite de Registros:</label>
            <select
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              className="form-select"
            >
              <option value={100}>📄 100 registros</option>
              <option value={500}>📄 500 registros</option>
              <option value={1000}>📄 1,000 registros</option>
              <option value={5000}>📄 5,000 registros</option>
              <option value={10000}>📄 10,000 registros</option>
            </select>
          </div>
        </div>
      </div>

      {coleccionSeleccionada && (
        <div className="form-section">
          <h3 className="section-title">🔧 Filtros Avanzados</h3>
          <div className="filtros-container">
            <FiltrosAvanzados 
              coleccion={coleccionSeleccionada}
              onFiltrosChange={manejarCambioFiltros}
              filtrosIniciales={filtrosAvanzados}
            />
          </div>
        </div>
      )}

      {campos.length > 0 && (
        <div className="form-section">
          <h3 className="section-title">📊 Información de la Colección</h3>
          <div className="campos-info-modern">
            <div className="info-header">
              <span className="info-icon">🏷️</span>
              <span className="info-title">Campos Disponibles ({campos.length})</span>
            </div>
            <div className="campos-tags">
              {campos.map((campo, index) => (
                <span key={index} className="campo-tag">
                  {campo}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          disabled={loading || !coleccionSeleccionada}
          className="btn-generar"
          onClick={handleGenerarReporte}
        >
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Generando Reporte...
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              Generar Reporte
            </>
          )}
        </button>
        
        {coleccionSeleccionada && (
          <div className="form-info">
            <span className="info-text">
              ✨ Se generará un reporte de máximo {parseInt(limite).toLocaleString()} registros de la colección "{coleccionSeleccionada}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReporteForm;