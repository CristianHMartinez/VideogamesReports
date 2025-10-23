function TablaReporte({ datos, totalRegistros }) {
  if (!datos || datos.length === 0) {
    return <div className="no-data">No hay datos para mostrar</div>;
  }

  const columnas = Object.keys(datos[0]);

  const exportarCSV = () => {
    const headers = columnas.join(',');
    const rows = datos.map(row => 
      columnas.map(col => JSON.stringify(row[col] || '')).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="tabla-reporte">
      <div className="tabla-header">
        <h3>Resultados ({totalRegistros} registros)</h3>
        <button onClick={exportarCSV} className="btn-exportar">
          Exportar CSV
        </button>
      </div>
      
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((row, idx) => (
              <tr key={idx}>
                {columnas.map((col) => (
                  <td key={col}>
                    {typeof row[col] === 'object'
                      ? JSON.stringify(row[col])
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaReporte;