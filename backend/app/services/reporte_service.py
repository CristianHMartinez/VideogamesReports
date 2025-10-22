from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List, Optional
from datetime import datetime
import pandas as pd

class ReporteService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
    
    async def generar_reporte(
        self,
        coleccion: str,
        filtros: Dict[str, Any] = {},
        campos: Optional[List[str]] = None,
        fecha_inicio: Optional[datetime] = None,
        fecha_fin: Optional[datetime] = None,
        limite: int = 1000
    ):
        """Genera un reporte basado en los parámetros proporcionados"""
        
        # Construir filtros de fecha si se proporcionan
        if fecha_inicio or fecha_fin:
            filtros["fecha"] = {}
            if fecha_inicio:
                filtros["fecha"]["$gte"] = fecha_inicio
            if fecha_fin:
                filtros["fecha"]["$lte"] = fecha_fin
        
        # Construir proyección de campos
        projection = None
        if campos:
            projection = {campo: 1 for campo in campos}
            projection["_id"] = 0
        
        # Ejecutar consulta
        collection = self.db[coleccion]
        cursor = collection.find(filtros, projection).limit(limite)
        
        datos = await cursor.to_list(length=limite)
        
        # Convertir ObjectId a string para JSON
        for item in datos:
            if "_id" in item:
                item["_id"] = str(item["_id"])
        
        return {
            "success": True,
            "mensaje": "Reporte generado exitosamente",
            "total_registros": len(datos),
            "datos": datos
        }
    
    async def obtener_colecciones(self):
        """Obtiene la lista de colecciones disponibles"""
        colecciones = await self.db.list_collection_names()
        return {"colecciones": colecciones}
    
    async def obtener_estadisticas(self, coleccion: str):
        """Obtiene estadísticas básicas de una colección"""
        collection = self.db[coleccion]
        total = await collection.count_documents({})
        
        # Obtener un documento de muestra para ver campos
        muestra = await collection.find_one({})
        campos = list(muestra.keys()) if muestra else []
        
        return {
            "coleccion": coleccion,
            "total_documentos": total,
            "campos_disponibles": campos
        }