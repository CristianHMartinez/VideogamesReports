import React, { useEffect, useState } from 'react';
import { reportesAPI } from '../services/api';
import './CorrelationView.css';

export default function CorrelationView({ colecciones = [] }) {
  const [coleccion, setColeccion] = useState(colecciones[0] || '');
  const [camposDisponibles, setCamposDisponibles] = useState([]);
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [limite, setLimite] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (coleccion) fetchEsquema();
  }, [coleccion]);

  async function fetchEsquema() {
    try {
      const res = await reportesAPI.obtenerEsquemaColeccion(coleccion);
      const camposRaw = res.data?.campos || [];
      // filtrar campos vacíos o nulos
      const campos = camposRaw.filter(Boolean);
      setCamposDisponibles(campos);
      setCamposSeleccionados(campos.slice(0, Math.min(6, campos.length)));
    } catch (e) {
      console.error(e);
      setCamposDisponibles([]);
    }
  }

  function toggleCampo(c) {
    setCamposSeleccionados(prev => prev.includes(c) ? prev.filter(x => x!==c) : [...prev, c]);
  }

  function colorFor(val){
    // val in [-1,1] => blue (neg) white (0) red (pos)
    const v = Math.max(-1, Math.min(1, val));
    if (v === 0) return '#ffffff';
    if (v > 0){
      // interpolate white -> red
      const t = Math.round(255 * v);
      return `rgb(255, ${255 - t}, ${255 - t})`;
    } else {
      const t = Math.round(255 * (-v));
      return `rgb(${255 - t}, ${255 - t}, 255)`;
    }
  }

  async function ejecutar() {
    setLoading(true);
    setResultado(null);
    try{
      const payload = { coleccion, campos: camposSeleccionados.filter(Boolean), limite };
      const res = await reportesAPI.matrizCorrelacion(payload);
      setResultado(res.data);
    }catch(e){
      console.error(e);
      setResultado({ success: false, mensaje: e.message || String(e) });
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="correlation-view">
      <div className="corr-left">
        <h3>Matriz de Correlación</h3>
        <label>Colección</label>
        <select value={coleccion} onChange={e=>setColeccion(e.target.value)}>
          {colecciones.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Campos (selección múltiple)</label>
        <div className="campos-list">
          {camposDisponibles.map(c => (
            <label key={c} className={`campo-item ${camposSeleccionados.includes(c)?'sel':''}`}>
              <input type="checkbox" checked={camposSeleccionados.includes(c)} onChange={()=>toggleCampo(c)} /> {c}
            </label>
          ))}
        </div>

        <label>Límite de registros</label>
        <input type="number" value={limite} onChange={e=>setLimite(Number(e.target.value))} />

        <div className="actions">
          <button className="btn-primary" onClick={ejecutar} disabled={loading}>{loading? 'Calculando...':'Calcular'}</button>
          <button className="btn-secondary" onClick={()=>{setResultado(null);}}>Limpiar</button>
        </div>
      </div>

      <div className="corr-right">
        {resultado && resultado.success && (
          <div className="matrix-card">
            <h4>Resultado (n = {resultado.n})</h4>
            <div className="matrix-wrap">
              <table className="corr-table">
                <thead>
                  <tr>
                    <th></th>
                    {resultado.fields.map((f,i)=> <th key={i}>{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {resultado.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="row-label">{resultado.fields[i]}</td>
                      {row.map((v,j)=> (
                        <td key={j} style={{background: colorFor(v)}} title={v}>{v.toFixed(3)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {resultado && !resultado.success && (
          <div className="error">{resultado.mensaje || 'Error calculando correlación'}</div>
        )}
      </div>
    </div>
  );
}
