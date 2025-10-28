import { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import './FiltrosAvanzados.css';

function FiltrosAvanzados({ coleccion, onFiltrosChange, filtrosIniciales = {} }) {
  const [campos, setCampos] = useState([]);
  const [campoSeleccionado1, setCampoSeleccionado1] = useState('');
  const [valorSeleccionado1, setValorSeleccionado1] = useState('');
  const [valoresDisponibles1, setValoresDisponibles1] = useState([]);
  
  const [campoSeleccionado2, setCampoSeleccionado2] = useState('');
  const [valorSeleccionado2, setValorSeleccionado2] = useState('');
  const [valoresDisponibles2, setValoresDisponibles2] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // Obtener campos disponibles cuando cambia la colección
  useEffect(() => {
    if (coleccion) {
      obtenerCamposDisponibles();
    } else {
      setCampos([]);
      limpiarFiltros();
    }
  }, [coleccion]);

  // Cargar filtros iniciales
  useEffect(() => {
    if (filtrosIniciales && Object.keys(filtrosIniciales).length > 0) {
      const campos = Object.keys(filtrosIniciales);
      if (campos[0]) {
        setCampoSeleccionado1(campos[0]);
        setValorSeleccionado1(String(filtrosIniciales[campos[0]]));
      }
      if (campos[1]) {
        setCampoSeleccionado2(campos[1]);
        setValorSeleccionado2(String(filtrosIniciales[campos[1]]));
      }
    }
  }, [filtrosIniciales]);

  const obtenerCamposDisponibles = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo campos para colección:', coleccion);
      const response = await reportesAPI.obtenerEsquemaColeccion(coleccion);
      console.log('Respuesta del esquema:', response.data);
      
      if (response.data && response.data.campos) {
        setCampos(response.data.campos);
        console.log('Campos obtenidos:', response.data.campos);
      } else {
        console.log('No se encontraron campos en la respuesta');
        setCampos([]);
      }
    } catch (error) {
      console.error('Error al obtener campos:', error);
      setCampos([]);
    } finally {
      setLoading(false);
    }
  };

  const obtenerValoresUnicos = async (campo) => {
    try {
      setLoading(true);
      console.log(`Obteniendo valores únicos para campo: ${campo} en colección: ${coleccion}`);
      const response = await reportesAPI.obtenerValoresUnicos(coleccion, campo);
      console.log(`Respuesta valores únicos para ${campo}:`, response.data);
      
      if (response.data && response.data.valores) {
        console.log(`Valores obtenidos para ${campo}:`, response.data.valores);
        return response.data.valores;
      }
      return [];
    } catch (error) {
      console.error(`Error al obtener valores únicos para ${campo}:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioCampo1 = async (campo) => {
    setCampoSeleccionado1(campo);
    setValorSeleccionado1('');
    
    if (campo) {
      const valores = await obtenerValoresUnicos(campo);
      setValoresDisponibles1(valores);
    } else {
      setValoresDisponibles1([]);
    }
    
    actualizarFiltros(campo, '', campoSeleccionado2, valorSeleccionado2);
  };

  const manejarCambioCampo2 = async (campo) => {
    setCampoSeleccionado2(campo);
    setValorSeleccionado2('');
    
    if (campo) {
      const valores = await obtenerValoresUnicos(campo);
      setValoresDisponibles2(valores);
    } else {
      setValoresDisponibles2([]);
    }
    
    actualizarFiltros(campoSeleccionado1, valorSeleccionado1, campo, '');
  };

  const manejarCambioValor1 = (valor) => {
    setValorSeleccionado1(valor);
    actualizarFiltros(campoSeleccionado1, valor, campoSeleccionado2, valorSeleccionado2);
  };

  const manejarCambioValor2 = (valor) => {
    setValorSeleccionado2(valor);
    actualizarFiltros(campoSeleccionado1, valorSeleccionado1, campoSeleccionado2, valor);
  };

  const actualizarFiltros = (campo1, valor1, campo2, valor2) => {
    const filtros = {};
    
    if (campo1 && valor1) {
      // Intentar convertir a número si es posible
      const valorConvertido = isNaN(valor1) ? valor1 : Number(valor1);
      filtros[campo1] = valorConvertido;
    }
    
    if (campo2 && valor2 && campo2 !== campo1) {
      // Intentar convertir a número si es posible
      const valorConvertido = isNaN(valor2) ? valor2 : Number(valor2);
      filtros[campo2] = valorConvertido;
    }
    
    onFiltrosChange(filtros);
  };

  const limpiarFiltros = () => {
    setCampoSeleccionado1('');
    setValorSeleccionado1('');
    setValoresDisponibles1([]);
    
    setCampoSeleccionado2('');
    setValorSeleccionado2('');
    setValoresDisponibles2([]);
    
    onFiltrosChange({});
  };

  const tieneAlgunFiltro = (campoSeleccionado1 && valorSeleccionado1) || (campoSeleccionado2 && valorSeleccionado2);

  return (
    <div className={`filtros-avanzados ${tieneAlgunFiltro ? 'filtro-activo' : ''}`}>
      <h3>Filtros</h3>
      
      {!coleccion ? (
        <p className="filtros-mensaje">Selecciona una colección para activar los filtros</p>
      ) : loading ? (
        <p className="filtros-mensaje">Cargando campos disponibles...</p>
      ) : (
        <div className="filtros-grid">
          {/* Primer Filtro */}
          <div className="filtro-item">
            <label>Campo 1:</label>
            <select
              value={campoSeleccionado1}
              onChange={(e) => manejarCambioCampo1(e.target.value)}
              disabled={loading}
            >
              <option value="">Seleccionar campo...</option>
              {campos.map((campo) => (
                <option key={campo} value={campo}>
                  {campo}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>Valor 1:</label>
            <select
              value={valorSeleccionado1}
              onChange={(e) => manejarCambioValor1(e.target.value)}
              disabled={!campoSeleccionado1 || loading}
            >
              <option value="">Seleccionar valor...</option>
              {valoresDisponibles1.map((valor, index) => (
                <option key={index} value={valor}>
                  {valor !== null && valor !== undefined ? String(valor) : '(vacío)'}
                </option>
              ))}
            </select>
          </div>

          {/* Segundo Filtro */}
          <div className="filtro-item">
            <label>Campo 2:</label>
            <select
              value={campoSeleccionado2}
              onChange={(e) => manejarCambioCampo2(e.target.value)}
              disabled={loading}
            >
              <option value="">Seleccionar campo...</option>
              {campos
                .filter((campo) => campo !== campoSeleccionado1)
                .map((campo) => (
                  <option key={campo} value={campo}>
                    {campo}
                  </option>
                ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>Valor 2:</label>
            <select
              value={valorSeleccionado2}
              onChange={(e) => manejarCambioValor2(e.target.value)}
              disabled={!campoSeleccionado2 || loading}
            >
              <option value="">Seleccionar valor...</option>
              {valoresDisponibles2.map((valor, index) => (
                <option key={index} value={valor}>
                  {valor !== null && valor !== undefined ? String(valor) : '(vacío)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="filtros-actions">
        <button
          type="button"
          className="btn-limpiar-filtros"
          onClick={limpiarFiltros}
          disabled={!tieneAlgunFiltro}
        >
          Limpiar Filtros
        </button>
      </div>

      {tieneAlgunFiltro && (
        <div className="filtros-aplicados">
          <h4>Filtros Activos:</h4>
          <ul>
            {campoSeleccionado1 && valorSeleccionado1 && (
              <li><strong>{campoSeleccionado1}:</strong> {valorSeleccionado1}</li>
            )}
            {campoSeleccionado2 && valorSeleccionado2 && (
              <li><strong>{campoSeleccionado2}:</strong> {valorSeleccionado2}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FiltrosAvanzados;
