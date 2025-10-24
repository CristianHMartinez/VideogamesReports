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

    async def obtener_conteo_generos(self, coleccion: str, campo_generos: str = "Genres", limite: int = 20):
        """Devuelve conteo de géneros individuales, separando géneros múltiples.
        
        Maneja tanto arrays como strings:
        - Array: ["Adventure", "RPG"] 
        - String: "['Adventure', 'RPG']" o "Adventure, RPG"
        """
        try:
            collection = self.db[coleccion]
            
            # Primero verificar el tipo de datos
            muestra = await collection.find({}).limit(3).to_list(length=3)
            print(f"Muestra de {campo_generos}:")
            for doc in muestra:
                genero_val = doc.get(campo_generos)
                print(f"  Tipo: {type(genero_val)}, Valor: {genero_val}")
            
            # Pipeline robusto que maneja arrays y strings
            pipeline = [
                {
                    "$addFields": {
                        "__genresProcessed": {
                            "$cond": {
                                "if": {"$isArray": f"${campo_generos}"},
                                # Si es array, usar directamente
                                "then": f"${campo_generos}",
                                # Si no es array, convertir a string y procesar
                                "else": {
                                    "$split": [
                                        {
                                            "$replaceAll": {
                                                "input": {
                                                    "$replaceAll": {
                                                        "input": {
                                                            "$replaceAll": {
                                                                "input": {
                                                                    "$toString": {"$ifNull": [f"${campo_generos}", ""]}
                                                                },
                                                                "find": "[",
                                                                "replacement": ""
                                                            }
                                                        },
                                                        "find": "]",
                                                        "replacement": ""
                                                    }
                                                },
                                                "find": "'",
                                                "replacement": ""
                                            }
                                        },
                                        ", "
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    "$unwind": "$__genresProcessed"
                },
                {
                    "$addFields": {
                        "genero": {
                            "$trim": {
                                "input": {"$toString": "$__genresProcessed"}
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "genero": {"$ne": "", "$ne": None, "$ne": "null"}
                    }
                },
                {
                    "$group": {
                        "_id": "$genero",
                        "conteo": {"$sum": 1}
                    }
                },
                {
                    "$sort": {"conteo": -1}
                },
                {
                    "$limit": limite
                }
            ]

            print(f"Pipeline géneros para {coleccion}:")
            print(pipeline)

            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            print(f"Resultados géneros: {resultados}")
            
            conteos = [
                {"genero": doc.get("_id", ""), "conteo": doc.get("conteo", 0)} 
                for doc in resultados 
                if doc.get("_id")
            ]
            
            return {
                "success": True, 
                "conteos": conteos, 
                "total_generos": len(conteos)
            }
            
        except Exception as e:
            print(f"Error en obtener_conteo_generos: {str(e)}")
            return {
                "success": False, 
                "conteos": [], 
                "error": str(e)
            }

    async def obtener_rating_promedio(self, coleccion: str, campo_rating: str = "Rating"):
        """Calcula el rating promedio de todos los documentos en una colección.
        
        Maneja ratings como números o strings que pueden convertirse a números.
        """
        try:
            collection = self.db[coleccion]
            
            # Primero ver una muestra de los datos
            muestra = await collection.find({}).limit(3).to_list(length=3)
            print(f"Muestra de {campo_rating}:")
            for doc in muestra:
                rating_val = doc.get(campo_rating)
                print(f"  Tipo: {type(rating_val)}, Valor: {rating_val}")
            
            # Pipeline para calcular promedio, manejando strings y números
            pipeline = [
                {
                    "$addFields": {
                        "__ratingNum": {
                            "$cond": {
                                "if": {"$eq": [{"$type": f"${campo_rating}"}, "string"]},
                                "then": {
                                    "$toDouble": {
                                        "$cond": {
                                            "if": {"$regexMatch": {"input": f"${campo_rating}", "regex": "^[0-9]+(\\.[0-9]+)?$"}},
                                            "then": f"${campo_rating}",
                                            "else": None
                                        }
                                    }
                                },
                                "else": {
                                    "$cond": {
                                        "if": {"$or": [
                                            {"$eq": [{"$type": f"${campo_rating}"}, "double"]},
                                            {"$eq": [{"$type": f"${campo_rating}"}, "int"]},
                                            {"$eq": [{"$type": f"${campo_rating}"}, "long"]},
                                            {"$eq": [{"$type": f"${campo_rating}"}, "decimal"]}
                                        ]},
                                        "then": {"$toDouble": f"${campo_rating}"},
                                        "else": None
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "__ratingNum": {"$ne": None, "$gte": 0, "$lte": 10}
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "promedio": {"$avg": "$__ratingNum"},
                        "total_ratings": {"$sum": 1},
                        "min_rating": {"$min": "$__ratingNum"},
                        "max_rating": {"$max": "$__ratingNum"}
                    }
                }
            ]

            print(f"Pipeline rating promedio para {coleccion}:")
            print(pipeline)

            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=1)
            print(f"Resultados rating: {resultados}")
            
            if resultados:
                result = resultados[0]
                promedio = round(result.get("promedio", 0), 2)
                return {
                    "success": True,
                    "rating_promedio": promedio,
                    "total_ratings": result.get("total_ratings", 0),
                    "min_rating": result.get("min_rating", 0),
                    "max_rating": result.get("max_rating", 0)
                }
            else:
                return {
                    "success": True,
                    "rating_promedio": 0,
                    "total_ratings": 0,
                    "min_rating": 0,
                    "max_rating": 0
                }
            
        except Exception as e:
            print(f"Error en obtener_rating_promedio: {str(e)}")
            return {
                "success": False,
                "rating_promedio": 0,
                "error": str(e)
            }

    async def obtener_distribucion_rating(self, coleccion: str, campo_rating: str = "Rating"):
        """Devuelve la distribución de ratings agrupados por rangos.
        
        Agrupa ratings en rangos: 0-1, 1-2, 2-3, 3-4, 4-5, etc.
        """
        try:
            collection = self.db[coleccion]
            
            # Pipeline para agrupar ratings por rangos
            pipeline = [
                {
                    "$addFields": {
                        "__ratingNum": {
                            "$cond": {
                                "if": {"$eq": [{"$type": f"${campo_rating}"}, "string"]},
                                "then": {
                                    "$toDouble": {
                                        "$cond": {
                                            "if": {"$regexMatch": {"input": f"${campo_rating}", "regex": "^[0-9]+(\\.[0-9]+)?$"}},
                                            "then": f"${campo_rating}",
                                            "else": None
                                        }
                                    }
                                },
                                "else": {
                                    "$cond": {
                                        "if": {"$or": [
                                            {"$eq": [{"$type": f"${campo_rating}"}, "double"]},
                                            {"$eq": [{"$type": f"${campo_rating}"}, "int"]},
                                            {"$eq": [{"$type": f"${campo_rating}"}, "long"]},
                                            {"$eq": [{"$type": f"${campo_rating}"}, "decimal"]}
                                        ]},
                                        "then": {"$toDouble": f"${campo_rating}"},
                                        "else": None
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "__ratingNum": {"$ne": None, "$gte": 0, "$lte": 10}
                    }
                },
                {
                    "$addFields": {
                        "__ratingRange": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$and": [{"$gte": ["$__ratingNum", 0]}, {"$lt": ["$__ratingNum", 2]}]}, "then": "0-2 ⭐"},
                                    {"case": {"$and": [{"$gte": ["$__ratingNum", 2]}, {"$lt": ["$__ratingNum", 3]}]}, "then": "2-3 ⭐⭐"},
                                    {"case": {"$and": [{"$gte": ["$__ratingNum", 3]}, {"$lt": ["$__ratingNum", 4]}]}, "then": "3-4 ⭐⭐⭐"},
                                    {"case": {"$and": [{"$gte": ["$__ratingNum", 4]}, {"$lt": ["$__ratingNum", 5]}]}, "then": "4-5 ⭐⭐⭐⭐"},
                                    {"case": {"$gte": ["$__ratingNum", 5]}, "then": "5+ ⭐⭐⭐⭐⭐"}
                                ],
                                "default": "Sin rating"
                            }
                        }
                    }
                },
                {
                    "$group": {
                        "_id": "$__ratingRange",
                        "conteo": {"$sum": 1},
                        "promedio_rango": {"$avg": "$__ratingNum"}
                    }
                },
                {
                    "$sort": {"_id": 1}
                }
            ]

            print(f"Pipeline distribución rating para {coleccion}:")
            print(pipeline)

            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=10)
            print(f"Resultados distribución rating: {resultados}")
            
            # Definir colores para cada rango
            color_map = {
                "0-2 ⭐": "#ef4444",        # Rojo
                "2-3 ⭐⭐": "#f97316",      # Naranja
                "3-4 ⭐⭐⭐": "#eab308",    # Amarillo
                "4-5 ⭐⭐⭐⭐": "#22c55e",  # Verde
                "5+ ⭐⭐⭐⭐⭐": "#3b82f6", # Azul
            }
            
            distribucion = [
                {
                    "rango": doc.get("_id", ""),
                    "conteo": doc.get("conteo", 0),
                    "promedio_rango": round(doc.get("promedio_rango", 0), 2),
                    "color": color_map.get(doc.get("_id", ""), "#6b7280")
                }
                for doc in resultados
                if doc.get("_id")
            ]
            
            total_ratings = sum(d["conteo"] for d in distribucion)
            
            return {
                "success": True,
                "distribucion": distribucion,
                "total_ratings": total_ratings
            }
            
        except Exception as e:
            print(f"Error en obtener_distribucion_rating: {str(e)}")
            return {
                "success": False,
                "distribucion": [],
                "error": str(e)
            }