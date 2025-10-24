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
        """Obtiene la lista de colecciones disponibles en la base de datos"""
        try:
            colecciones = await self.db.list_collection_names()
            return {
                "success": True,
                "colecciones": colecciones
            }
        except Exception as e:
            return {
                "success": False,
                "colecciones": [],
                "error": str(e)
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

    async def obtener_esquema_coleccion(self, coleccion: str):
        """Obtiene el esquema (campos) de una colección"""
        try:
            collection = self.db[coleccion]
            
            # Obtener algunos documentos de muestra para extraer todos los campos posibles
            muestras = await collection.find({}).limit(100).to_list(length=100)
            
            if not muestras:
                return {
                    "success": True,
                    "campos": [],
                    "mensaje": "La colección está vacía"
                }
            
            # Combinar todos los campos únicos de las muestras
            todos_los_campos = set()
            for doc in muestras:
                todos_los_campos.update(doc.keys())
            
            # Filtrar _id ya que no suele ser útil para filtros
            campos = [campo for campo in sorted(todos_los_campos) if campo != '_id']
            
            return {
                "success": True,
                "campos": campos,
                "total_documentos": len(muestras)
            }
            
        except Exception as e:
            return {
                "success": False,
                "campos": [],
                "error": str(e)
            }

    async def obtener_valores_unicos(self, coleccion: str, campo: str):
        """Obtiene valores únicos de un campo específico"""
        try:
            collection = self.db[coleccion]
            
            # Usar agregación para obtener valores únicos
            pipeline = [
                {"$group": {"_id": f"${campo}"}},
                {"$match": {"_id": {"$ne": None}}},  # Excluir valores nulos
                {"$sort": {"_id": 1}},
                {"$limit": 1000}  # Limitar a 1000 valores únicos
            ]
            
            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=1000)
            
            # Extraer los valores únicos
            valores = [doc["_id"] for doc in resultados if doc["_id"] is not None]
            
            return {
                "success": True,
                "valores": valores,
                "total_valores": len(valores)
            }
            
        except Exception as e:
            return {
                "success": False,
                "valores": [],
                "error": str(e)
            }

    async def obtener_conteo_por_campo(self, coleccion: str, campo: str, limite: int = 1000):
        """Devuelve el conteo de documentos agrupados por un campo dado.

        Respuesta: { success, conteos: [{valor, conteo}], total_valores }
        """
        try:
            collection = self.db[coleccion]

            pipeline = [
                {"$group": {"_id": f"${campo}", "conteo": {"$sum": 1}}},
                {"$match": {"_id": {"$ne": None}}},
                {"$sort": {"_id": 1}},
                {"$limit": limite}
            ]

            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)

            conteos = [{"valor": doc.get("_id"), "conteo": doc.get("conteo", 0)} for doc in resultados]

            return {
                "success": True,
                "conteos": conteos,
                "total_valores": len(conteos)
            }
        except Exception as e:
            return {
                "success": False,
                "conteos": [],
                "error": str(e)
            }

    async def obtener_conteo_por_anio(self, coleccion: str, campo_fecha: str, formato: str = "%b %d, %Y", limite: int = 200):
        """Devuelve conteo de documentos agrupados por año, extrayendo de Release_Date."""
        try:
            collection = self.db[coleccion]
            
            # Primero ver una muestra de los datos
            muestra = await collection.find({}).limit(5).to_list(length=5)
            print(f"Muestra de datos de {coleccion}:")
            for doc in muestra:
                print(f"  {campo_fecha}: {doc.get(campo_fecha)}")
            
            pipeline = [
                {
                    "$addFields": {
                        "__yearStr": {
                            "$regexFind": {
                                "input": {"$toString": {"$ifNull": [f"${campo_fecha}", ""]}},
                                "regex": r"(\d{4})"
                            }
                        }
                    }
                },
                {
                    "$addFields": {
                        "year": {
                            "$cond": {
                                "if": {"$ne": ["$__yearStr", None]},
                                "then": {"$toInt": "$__yearStr.match"},
                                "else": None
                            }
                        }
                    }
                },
                {"$match": {"year": {"$ne": None, "$gte": 1990, "$lte": 2030}}},
                {"$group": {"_id": "$year", "conteo": {"$sum": 1}}},
                {"$sort": {"_id": 1}},
                {"$limit": limite}
            ]

            print(f"Pipeline para {coleccion}.{campo_fecha}:")
            print(pipeline)
            
            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            print(f"Resultados de agregación: {resultados}")
            
            conteos = [{"valor": doc.get("_id"), "conteo": doc.get("conteo", 0)} for doc in resultados]
            print(f"Conteos finales: {conteos}")
            
            return {"success": True, "conteos": conteos, "total_valores": len(conteos)}
        except Exception as e:
            print(f"Error en obtener_conteo_por_anio: {str(e)}")
            return {"success": False, "conteos": [], "error": str(e)}