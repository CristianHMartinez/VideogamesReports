import { useState } from 'react';
import './Header.css';

function Header({ vistaActual, onCambiarVista }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const opciones = [
    { id: 'reportes', nombre: 'Reportes', descripcion: 'Generar reportes personalizados' },
    { id: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel de control y estadísticas' }
  ];

  const manejarCambioVista = (nuevaVista) => {
    onCambiarVista(nuevaVista);
    setMenuAbierto(false);
  };

  return (
    <header className="sistema-header">
      <div className="header-contenido">
        <div className="header-izquierda">
          <div className="logo">
            <h1>
              <span className="logo-icono"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-gamepad-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4z" /><path d="M14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232" /><path d="M8 9v2" /><path d="M7 10h2" /><path d="M14 10h2" /></svg></span>
              VideogamesReports
            </h1>
          </div>
        </div>

        <nav className="header-navegacion">
          {opciones.map((opcion) => (
            <button
              key={opcion.id}
              className={`nav-boton ${vistaActual === opcion.id ? 'activo' : ''}`}
              onClick={() => manejarCambioVista(opcion.id)}
              title={opcion.descripcion}
            >
              {opcion.id === 'reportes' && <span className="nav-icono"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-report-analytics"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 17v-5" /><path d="M12 17v-1" /><path d="M15 17v-3" /></svg></span>}
              {opcion.id === 'dashboard' && <span className="nav-icono"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chart-bar"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 20h14" /></svg></span>}
              {opcion.nombre}
            </button>
          ))}
        </nav>

        {/* Navegación móvil */}
        <div className="header-mobile">
          <button
            className="menu-toggle"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          
          {menuAbierto && (
            <div className="menu-dropdown">
              {opciones.map((opcion) => (
                <button
                  key={opcion.id}
                  className={`dropdown-item ${vistaActual === opcion.id ? 'activo' : ''}`}
                  onClick={() => manejarCambioVista(opcion.id)}
                >
                  {opcion.id === 'reportes' && <span className="nav-icono"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-report-analytics"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 17v-5" /><path d="M12 17v-1" /><path d="M15 17v-3" /></svg></span>}
                  {opcion.id === 'dashboard' && <span className="nav-icono"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chart-bar"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 20h14" /></svg></span>}
                  <div>
                    <div className="item-nombre">{opcion.nombre}</div>
                    <div className="item-descripcion">{opcion.descripcion}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="header-derecha">
          <div className="vista-actual">
            <span className="vista-nombre">
              {opciones.find(o => o.id === vistaActual)?.nombre || 'Reportes'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;