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