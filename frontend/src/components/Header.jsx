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
              <span className="logo-icono">📊</span>
              VideogamesReports
            </h1>
            <p className="logo-descripcion">Sistema de Reportes MongoDB</p>
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
              {opcion.id === 'reportes' && <span className="nav-icono">📋</span>}
              {opcion.id === 'dashboard' && <span className="nav-icono">📈</span>}
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
                  {opcion.id === 'reportes' && <span className="nav-icono">📋</span>}
                  {opcion.id === 'dashboard' && <span className="nav-icono">📈</span>}
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