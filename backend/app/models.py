from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReporteRequest(BaseModel):
    coleccion: str
    filtros: Optional[Dict[str, Any]] = {}
    campos: Optional[List[str]] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    limite: Optional[int] = 1000

class ReporteResponse(BaseModel):
    success: bool
    mensaje: str
    total_registros: int
    datos: List[Dict[str, Any]]