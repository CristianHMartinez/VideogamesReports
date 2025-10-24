import { useState } from 'react';
import Header from './components/Header';
import ReportesDashboard from './components/ReportesDashboard';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [vistaActual, setVistaActual] = useState('reportes');

  const manejarCambioVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
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
          <main className="reportes-container">
            <ReportesDashboard />
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