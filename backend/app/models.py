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


class RegresionRequest(BaseModel):
    coleccion: str
    # Puede especificar un campo de feature único `campo_x` o una lista `campos_x`
    campo_x: Optional[str] = None
    campos_x: Optional[List[str]] = None
    campo_y: str
    filtros: Optional[Dict[str, Any]] = {}
    limite: Optional[int] = 10000


class RegresionResponse(BaseModel):
    success: bool
    mensaje: str
    coeficientes: List[float]
    intercept: float
    r2: float
    n: int
    ejemplo_predicciones: Optional[List[Dict[str, Any]]] = None


class CorrelacionRequest(BaseModel):
    coleccion: str
    campos: Optional[List[str]] = None
    filtros: Optional[Dict[str, Any]] = {}
    limite: Optional[int] = 10000


class CorrelacionResponse(BaseModel):
    success: bool
    mensaje: str
    fields: List[str]
    matrix: List[List[float]]
    n: int