import './MiniCard.css';

function MiniCard({ title, icon, data, tipo }) {
  if (!data || data.length === 0) {
    return (
      <div className="mini-card">
        <div className="mini-card-header">
          <span className="mini-card-icon">{icon}</span>
          <h3 className="mini-card-title">{title}</h3>
        </div>
        <div className="mini-card-body">
          <p className="mini-card-empty">Sin datos disponibles</p>
        </div>
      </div>
    );
  }

  const formatearGeneros = (generos) => {
    if (!generos) return '';
    if (Array.isArray(generos)) {
      return generos.slice(0, 2).join(', ');
    }
    return String(generos).slice(0, 30);
  };

  const truncarTitulo = (titulo) => {
    if (!titulo) return '';
    return titulo.length > 35 ? titulo.slice(0, 35) + '...' : titulo;
  };

  return (
    <div className="mini-card">
      <div className="mini-card-header">
        <span className="mini-card-icon">{icon}</span>
        <h3 className="mini-card-title">{title}</h3>
      </div>
      <div className="mini-card-body">
        {data.map((juego, index) => (
          <div key={index} className="mini-card-item">
            <div className="item-info">
              <div className="item-title" title={juego.titulo}>
                {truncarTitulo(juego.titulo)}
              </div>
              <div className="item-details">
                {tipo === 'hidden' && (
                  <>
                    <span className="rating-mini">⭐ {juego.rating?.toFixed(1)}</span>
                    <span className="reviews-mini">📝 {juego.reviews}</span>
                  </>
                )}
                {tipo === 'trending' && (
                  <>
                    <span className="rating-mini">⭐ {juego.rating?.toFixed(1)}</span>
                    <span className="year-mini">📅 {juego.anio}</span>
                  </>
                )}
                {tipo === 'toprated' && (
                  <>
                    <span className="rating-mini">⭐ {juego.rating?.toFixed(1)}</span>
                    <span className="reviews-mini">📝 {juego.reviews}</span>
                  </>
                )}
              </div>
              <div className="item-genres">
                {formatearGeneros(juego.generos)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MiniCard;