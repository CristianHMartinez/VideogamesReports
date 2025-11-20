import React, { useState, useEffect } from 'react';
import { reportesAPI } from '../services/api';
import './RegressionView.css';

export default function RegressionView({ colecciones = [] }) {
  const [coleccion, setColeccion] = useState(colecciones[0] || '');
  const [campos, setCampos] = useState([]);
  const [campoX, setCampoX] = useState('');
  const [campoY, setCampoY] = useState('');
  const [limite, setLimite] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [datosPlot, setDatosPlot] = useState([]);

  useEffect(() => {
    if (coleccion) fetchEsquema(coleccion);
  }, [coleccion]);

  async function fetchEsquema(col) {
    try {
      const res = await reportesAPI.obtenerEsquemaColeccion(col);
      if (res.data && res.data.campos) {
        setCampos(res.data.campos);
        // preseleccionar valores razonables
        setCampoY(res.data.campos.find(c => /rating|score|rating_promedio|Rating/i.test(c)) || res.data.campos[0] || '');
        setCampoX(res.data.campos.find(c => c !== (res.data.campos.find(d => /rating|score|Rating/i.test(d)) || '')) || res.data.campos[1] || '');
      }
    } catch (e) {
      console.error('Error cargando esquema:', e);
      setCampos([]);
    }
  }

  async function ejecutarRegresion(e) {
    e && e.preventDefault();
    if (!coleccion || !campoY || !campoX) return alert('Seleccione colección, campo X y campo Y');
    setLoading(true);
    setResultado(null);
    setDatosPlot([]);
    try {
      const payload = { coleccion, campo_x: campoX, campo_y: campoY, limite };
      const res = await reportesAPI.regresionLineal(payload);
      if (res.data && res.data.success) {
        setResultado(res.data);

        // Obtener datos completos para el scatter (campos X e Y)
        const reporteRes = await reportesAPI.generarReporte({ coleccion, filtros: {}, campos: [campoX, campoY], limite: 2000 });
        const rows = reporteRes.data?.datos || [];
        const parsed = rows
          .map(r => ({ x: Number(r[campoX]), y: Number(r[campoY]) }))
          .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
        setDatosPlot(parsed);
      } else {
        setResultado(res.data || { success: false, mensaje: 'Respuesta no válida' });
      }
    } catch (err) {
      console.error('Error en regresión:', err);
      setResultado({ success: false, mensaje: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  // Simple scatter + regression line renderer for single-feature models
  function ScatterPlot({ data = [], coef = [], intercept = 0 }) {
    if (!data.length) return <div className="no-data">No hay datos para graficar</div>;

    const padding = 32;
    const width = 560;
    const height = 320;

    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const xScale = x => padding + ((x - minX) / (maxX - minX || 1)) * (width - padding * 2);
    const yScale = y => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - padding * 2);

    // regression line points
    const lineX1 = minX;
    const lineX2 = maxX;
    const lineY1 = (coef[0] ?? 0) * lineX1 + intercept;
    const lineY2 = (coef[0] ?? 0) * lineX2 + intercept;

    return (
      <svg className="scatter" viewBox={`0 0 ${width} ${height}`} width="100%">
        {/* axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ddd" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ddd" />

        {/* points */}
        {data.map((p, i) => (
          <circle key={i} cx={xScale(p.x)} cy={yScale(p.y)} r={3} fill="#16394F" opacity={0.9} />
        ))}

        {/* regression line */}
        <line
          x1={xScale(lineX1)}
          y1={yScale(lineY1)}
          x2={xScale(lineX2)}
          y2={yScale(lineY2)}
          stroke="#ff6b6b"
          strokeWidth={2}
        />
      </svg>
    );
  }

  return (
    <div className="regression-view">
      <div className="regression-form">
        <h3>Regresión Lineal</h3>
        <form onSubmit={ejecutarRegresion}>
          <label>Colección</label>
          <select value={coleccion} onChange={e => setColeccion(e.target.value)}>
            {colecciones.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label>Campo X (feature)</label>
          <select value={campoX} onChange={e => setCampoX(e.target.value)}>
            <option value="">-- Seleccione --</option>
            {campos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label>Campo Y (objetivo)</label>
          <select value={campoY} onChange={e => setCampoY(e.target.value)}>
            <option value="">-- Seleccione --</option>
            {campos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label>Máx. registros a usar</label>
          <input type="number" value={limite} onChange={e => setLimite(Number(e.target.value))} />

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Ejecutando...' : 'Ajustar regresión'}</button>
            <button type="button" className="btn-secondary" onClick={() => { setResultado(null); setDatosPlot([]); }}>Limpiar</button>
          </div>
        </form>
      </div>

      <div className="regression-results">
        {resultado && (
          <div className="results-card">
            <h4>Resultados</h4>
            <div className="metrics">
              <div><strong>Éxito:</strong> {String(resultado.success)}</div>
              <div><strong>Mensaje:</strong> {resultado.mensaje}</div>
              <div><strong>Coeficientes:</strong> {resultado.coeficientes?.join(', ')}</div>
              <div><strong>Intercept:</strong> {resultado.intercept}</div>
              <div><strong>R²:</strong> {resultado.r2}</div>
              <div><strong>n (observaciones):</strong> {resultado.n}</div>
            </div>

            {/* ejemplo de predicciones */}
            {resultado.ejemplo_predicciones && resultado.ejemplo_predicciones.length > 0 && (
              <div className="ejemplo">
                <h5>Ejemplo de predicciones</h5>
                <table>
                  <thead>
                    <tr><th>Input</th><th>Y</th><th>Pred</th></tr>
                  </thead>
                  <tbody>
                    {resultado.ejemplo_predicciones.map((r, i) => (
                      <tr key={i}>
                        <td><pre>{JSON.stringify(r.input)}</pre></td>
                        <td>{r.y}</td>
                        <td>{r.pred}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* scatter plot (si hay datos) */}
            <div className="plot-section">
              <h5>Scatter y línea de regresión</h5>
              <ScatterPlot data={datosPlot} coef={resultado.coeficientes} intercept={resultado.intercept} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
