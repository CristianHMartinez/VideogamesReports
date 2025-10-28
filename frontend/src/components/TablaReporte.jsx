import React, { useMemo, useState } from 'react';
import './TablaReporte.css';

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Escape double quotes by doubling them and wrap in quotes when needed
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function TablaReporte({ datos = [], totalRegistros }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!datos || datos.length === 0) {
    return <div className="no-data">No hay datos para mostrar</div>;
  }

  // Filtrar columnas que tienen al menos un valor no vacío
  const columnas = useMemo(() => {
    if (!datos || datos.length === 0) return [];
    
    const allColumns = Object.keys(datos[0]);
    
    // Filtrar columnas que tienen al menos un valor válido
    return allColumns.filter(col => {
      return datos.some(row => {
        const value = row[col];
        // Considerar válido si no es null, undefined, string vacía, array vacío, o objeto vacío
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return true;
      });
    });
  }, [datos]);

  // Filtered data
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return datos;
    return datos.filter((row) =>
      columnas.some((col) => {
        const cell = row[col];
        const text =
          cell === null || cell === undefined
            ? ''
            : typeof cell === 'object'
            ? JSON.stringify(cell)
            : String(cell);
        return text.toLowerCase().includes(q);
      })
    );
  }, [datos, query, columnas]);

  // Sorted data
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const A = a[sortBy];
      const B = b[sortBy];
      if (A == null && B == null) return 0;
      if (A == null) return sortDir === 'asc' ? -1 : 1;
      if (B == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof A === 'number' && typeof B === 'number') {
        return sortDir === 'asc' ? A - B : B - A;
      }
      const aStr = typeof A === 'object' ? JSON.stringify(A) : String(A);
      const bStr = typeof B === 'object' ? JSON.stringify(B) : String(B);
      return sortDir === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  // Pagination
  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }

  const exportarCSV = (rows = sorted) => {
    const headers = columnas.map(escapeCsvValue).join(',');
    const dataRows = rows.map((row) =>
      columnas.map((col) => escapeCsvValue(row[col])).join(',')
    );
    const csv = [headers, ...dataRows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copiarPortapapeles = async (rows = paged) => {
    const headers = columnas.join('\t');
    const dataRows = rows.map((row) =>
      columnas
        .map((col) => {
          const v = row[col];
          return v === null || v === undefined ? '' : String(v);
        })
        .join('\t')
    );
    const tsv = [headers, ...dataRows].join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      // Optionally, you can show a toast in the parent app. For now do nothing.
    } catch (e) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = tsv;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  };

  return (
    <div className="tabla-reporte">
      <div className="tabla-header">
        <h3>
          Resultados ({totalFiltered} / {totalRegistros ?? datos.length} registros)
        </h3>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            aria-label="Buscar"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />

          <button onClick={() => exportarCSV()} className="btn-exportar">
            Exportar CSV
          </button>

          <button onClick={() => copiarPortapapeles()} className="btn-copy">
            Copiar
          </button>
        </div>
      </div>

      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              {columnas.map((col) => (
                <th
                  key={col}
                  className={`sortable col-${col.toLowerCase().replace('_', '-')}`}
                  onClick={() => toggleSort(col)}
                  title={`Ordenar por ${col}`}
                >
                  {col}
                  {sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr key={idx}>
                {columnas.map((col) => (
                  <td key={col} className={`col-${col.toLowerCase().replace('_', '-')}`}>
                    {typeof row[col] === 'object' && Array.isArray(row[col])
                      ? row[col].join(', ')
                      : typeof row[col] === 'object'
                      ? JSON.stringify(row[col])
                      : String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabla-footer">
        <div className="pagination-controls">
          <button onClick={() => setPage(1)} disabled={currentPage === 1}>
            « Primero
          </button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            ‹ Prev
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next ›
          </button>
          <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
            Último »
          </button>
        </div>

        <div className="page-size-selector">
          <label>
            Mostrar
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[5, 10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            por página
          </label>
        </div>
      </div>
    </div>
  );
}

export default TablaReporte;