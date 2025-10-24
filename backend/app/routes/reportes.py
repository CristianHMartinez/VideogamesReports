from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.models import ReporteRequest, ReporteResponse
from app.services.reporte_service import ReporteService
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/api/reportes", tags=["reportes"])

@router.get("/colecciones")
async def listar_colecciones(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Obtiene la lista de colecciones disponibles"""
    service = ReporteService(db)
    return await service.obtener_colecciones()

@router.get("/estadisticas/{coleccion}")
async def obtener_estadisticas(
    coleccion: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene estadísticas de una colección"""
    service = ReporteService(db)
    return await service.obtener_estadisticas(coleccion)

@router.post("/generar", response_model=ReporteResponse)
async def generar_reporte(
    request: ReporteRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Genera un reporte personalizado"""
    try:
        service = ReporteService(db)
        resultado = await service.generar_reporte(
            coleccion=request.coleccion,
            filtros=request.filtros,
            campos=request.campos,
            fecha_inicio=request.fecha_inicio,
            fecha_fin=request.fecha_fin,
            limite=request.limite
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/esquema/{coleccion}")
async def obtener_esquema_coleccion(
    coleccion: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene el esquema (campos) de una colección"""
    try:
        service = ReporteService(db)
        return await service.obtener_esquema_coleccion(coleccion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/valores-unicos/{coleccion}/{campo}")
async def obtener_valores_unicos(
    coleccion: str,
    campo: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene valores únicos de un campo específico"""
    try:
        service = ReporteService(db)
        return await service.obtener_valores_unicos(coleccion, campo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conteo-por-campo/{coleccion}/{campo}")
async def conteo_por_campo(
    coleccion: str,
    campo: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Conteo de documentos agrupados por un campo (útil para series por año)."""
    try:
        service = ReporteService(db)
        return await service.obtener_conteo_por_campo(coleccion, campo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conteo-por-anio/{coleccion}/{campo}")
async def conteo_por_anio(
    coleccion: str,
    campo: str,
    formato: str = "%b %d, %Y",
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Conteo agrupado por año extrayéndolo desde un campo string de fecha.
    Formato por defecto: "Feb 25, 2022" => "%b %d, %Y".
    """
    try:
        service = ReporteService(db)
        return await service.obtener_conteo_por_anio(coleccion, campo, formato)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conteo-generos/{coleccion}")
async def conteo_generos(
    coleccion: str,
    campo: str = "Genres",
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Conteo de géneros individuales separando géneros múltiples."""
    try:
        service = ReporteService(db)
        return await service.obtener_conteo_generos(coleccion, campo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rating-promedio/{coleccion}")
async def rating_promedio(
    coleccion: str,
    campo: str = "Rating",
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene el rating promedio de una colección."""
    try:
        service = ReporteService(db)
        return await service.obtener_rating_promedio(coleccion, campo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/distribucion-rating/{coleccion}")
async def distribucion_rating(
    coleccion: str,
    campo: str = "Rating",
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene la distribución de ratings por rangos."""
    try:
        service = ReporteService(db)
        return await service.obtener_distribucion_rating(coleccion, campo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conteo-desarrolladores/{coleccion}")
async def conteo_desarrolladores(
    coleccion: str,
    campo: str = "Developers",
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Conteo de desarrolladores individuales separando desarrolladores múltiples."""
    try:
        service = ReporteService(db)
        return await service.obtener_conteo_desarrolladores(coleccion, campo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-juegos-populares/{coleccion}")
async def top_juegos_populares(
    coleccion: str,
    limite: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene el top de juegos más populares basado en rating, reviews y completitud de datos."""
    try:
        service = ReporteService(db)
        return await service.obtener_top_juegos_populares(coleccion, limite)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metricas-dashboard/{coleccion}")
async def metricas_dashboard(
    coleccion: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene métricas adicionales para el dashboard: jugadores activos, reviews totales, juegos 2024."""
    try:
        service = ReporteService(db)
        return await service.obtener_metricas_dashboard(coleccion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hidden-gems/{coleccion}")
async def hidden_gems(
    coleccion: str,
    limite: int = 5,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene juegos 'Hidden Gems': alto rating pero pocas reviews."""
    try:
        service = ReporteService(db)
        return await service.obtener_hidden_gems(coleccion, limite)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending-games/{coleccion}")
async def trending_games(
    coleccion: str,
    limite: int = 5,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene juegos 'Trending': juegos recientes con buena recepción."""
    try:
        service = ReporteService(db)
        return await service.obtener_trending_games(coleccion, limite)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-rated-games/{coleccion}")
async def top_rated_games(
    coleccion: str,
    limite: int = 5,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obtiene juegos 'Top Rated': los juegos con mejores calificaciones."""
    try:
        service = ReporteService(db)
        return await service.obtener_top_rated_games(coleccion, limite)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))