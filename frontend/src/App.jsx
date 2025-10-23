import { useState } from 'react';
import ReporteForm from './components/ReporteForm';
import TablaReporte from './components/TablaReporte';
import './App.css';

function App() {
  const [reporteData, setReporteData] = useState(null);

  const handleReporteGenerado = (data) => {
    setReporteData(data);
  };

  return (
    <div className="App">
      <header>
        <h1>Sistema de Reportes MongoDB</h1>
      </header>
      
      <main className="container">
        <div className="form-section">
          <ReporteForm onReporteGenerado={handleReporteGenerado} />
        </div>
        
        <div className="results-section">
          {reporteData && (
            <TablaReporte
              datos={reporteData.datos}
              totalRegistros={reporteData.total_registros}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;