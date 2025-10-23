import { useState } from 'react';
import Header from './components/Header';
import ReporteForm from './components/ReporteForm';
import TablaReporte from './components/TablaReporte';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [vistaActual, setVistaActual] = useState('reportes');
  const [reporteData, setReporteData] = useState(null);

  const handleReporteGenerado = (data) => {
    setReporteData(data);
  };

  const manejarCambioVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
    // Limpiar datos del reporte si cambiamos de vista
    if (nuevaVista !== 'reportes') {
      setReporteData(null);
    }
  };

  const renderizarContenido = () => {
    switch (vistaActual) {
      case 'dashboard':
        return (
          <main className="dashboard-container">
            <Dashboard onCambiarVista={manejarCambioVista} />
          </main>
        );
      case 'reportes':
      default:
        return (
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
        );
    }
  };

  return (
    <div className="App">
      <Header 
        vistaActual={vistaActual} 
        onCambiarVista={manejarCambioVista} 
      />
      
      {renderizarContenido()}
    </div>
  );
}

export default App;