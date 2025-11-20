from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List, Optional
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

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

    async def obtener_conteo_desarrolladores(self, coleccion: str, campo_desarrolladores: str = "Developers", limite: int = 15):
        """Devuelve conteo de desarrolladores individuales, separando desarrolladores múltiples.
        
        Maneja tanto arrays como strings:
        - Array: ["FromSoftware", "Bandai Namco"] 
        - String: "['FromSoftware', 'Bandai Namco Entertainment']"
        """
        try:
            collection = self.db[coleccion]
            
            # Primero verificar el tipo de datos
            muestra = await collection.find({}).limit(3).to_list(length=3)
            print(f"Muestra de {campo_desarrolladores}:")
            for doc in muestra:
                dev_val = doc.get(campo_desarrolladores)
                print(f"  Tipo: {type(dev_val)}, Valor: {dev_val}")
            
            # Pipeline robusto que maneja arrays y strings
            pipeline = [
                {
                    "$addFields": {
                        "__devsProcessed": {
                            "$cond": {
                                "if": {"$isArray": f"${campo_desarrolladores}"},
                                # Si es array, usar directamente
                                "then": f"${campo_desarrolladores}",
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
                                                                    "$toString": {"$ifNull": [f"${campo_desarrolladores}", ""]}
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
                    "$unwind": "$__devsProcessed"
                },
                {
                    "$addFields": {
                        "desarrollador": {
                            "$trim": {
                                "input": {"$toString": "$__devsProcessed"}
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "desarrollador": {"$ne": "", "$ne": None, "$ne": "null"}
                    }
                },
                {
                    "$group": {
                        "_id": "$desarrollador",
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

            print(f"Pipeline desarrolladores para {coleccion}:")
            print(pipeline)

            cursor = collection.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            print(f"Resultados desarrolladores: {resultados}")
            
            conteos = [
                {"desarrollador": doc.get("_id", ""), "conteo": doc.get("conteo", 0)} 
                for doc in resultados 
                if doc.get("_id")
            ]
            
            return {
                "success": True, 
                "conteos": conteos, 
                "total_desarrolladores": len(conteos)
            }
            
        except Exception as e:
            print(f"Error en obtener_conteo_desarrolladores: {str(e)}")
            return {
                "success": False, 
                "conteos": [], 
                "error": str(e)
            }

    async def obtener_top_juegos_populares(self, nombre_coleccion: str, limite: int = 20) -> Dict[str, Any]:
        """
        Obtiene el top de juegos más populares basado en diferentes métricas como rating, 
        número de reviews, etc. Prioriza juegos con más datos disponibles.
        """
        try:
            coleccion = self.db[nombre_coleccion]
            
            # Pipeline que calcula una puntuación de popularidad combinando varios factores
            pipeline = [
                {
                    "$addFields": {
                        # Normalizar rating (0-10 scale)
                        "rating_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Rating", None]}, 
                                    {"$ne": ["$Rating", ""]},
                                    {"$ne": ["$Rating", "N/A"]},
                                    {"$ne": ["$Rating", "TBD"]},
                                    {"$not": {"$eq": [{"$type": "$Rating"}, "string"]}}
                                ]},
                                "then": {
                                    "$cond": {
                                        "if": {"$isNumber": "$Rating"},
                                        "then": "$Rating",
                                        "else": {
                                            "$convert": {
                                                "input": "$Rating",
                                                "to": "double",
                                                "onError": 0
                                            }
                                        }
                                    }
                                },
                                "else": 0
                            }
                        },
                        # Contar reviews si existe el campo
                        "reviews_count": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Reviews", None]}, 
                                    {"$ne": ["$Reviews", ""]}
                                ]},
                                "then": {
                                    "$cond": {
                                        "if": {"$isNumber": "$Reviews"},
                                        "then": "$Reviews",
                                        "else": 1
                                    }
                                },
                                "else": 0
                            }
                        },
                        # Factor de completitud de datos (más campos = más popular)
                        "completitud": {
                            "$add": [
                                {"$cond": [{"$ne": ["$Title", None]}, 1, 0]},
                                {"$cond": [{"$ne": ["$Rating", None]}, 1, 0]},
                                {"$cond": [{"$ne": ["$Genres", None]}, 1, 0]},
                                {"$cond": [{"$ne": ["$Developers", None]}, 1, 0]},
                                {"$cond": [{"$ne": ["$Release_Date", None]}, 1, 0]}
                            ]
                        }
                    }
                },
                {
                    "$addFields": {
                        # Calcular puntuación de popularidad
                        "popularidad_score": {
                            "$add": [
                                {"$multiply": ["$rating_normalizado", 2]},  # Rating tiene peso 2
                                {"$multiply": [{"$min": [{"$divide": ["$reviews_count", 100]}, 5]}, 1]},  # Reviews (max 5 puntos)
                                {"$multiply": ["$completitud", 0.5]}  # Completitud de datos
                            ]
                        }
                    }
                },
                {
                    "$match": {
                        "Title": {"$ne": None, "$ne": ""},
                        "popularidad_score": {"$gt": 0}
                    }
                },
                {"$sort": {"popularidad_score": -1, "rating_normalizado": -1}},
                {"$limit": limite},
                {
                    "$project": {
                        "_id": 0,
                        "nombre": "$Title",
                        "rating": "$rating_normalizado",
                        "generos": "$Genres",
                        "desarrolladores": "$Developers",
                        "fecha_lanzamiento": "$Release_Date",
                        "reviews": "$reviews_count",
                        "popularidad_score": {"$round": ["$popularidad_score", 2]}
                    }
                }
            ]
            
            print(f"Pipeline juegos populares para {nombre_coleccion}:")
            print(pipeline)

            cursor = coleccion.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            print(f"Resultados juegos populares: {len(resultados)} juegos")
            
            return {
                "success": True, 
                "juegos": resultados, 
                "total_juegos": len(resultados)
            }
            
        except Exception as e:
            print(f"Error en obtener_top_juegos_populares: {str(e)}")

    async def regresion_lineal(
        self,
        coleccion: str,
        campo_y: str,
        campo_x: Optional[str] = None,
        campos_x: Optional[List[str]] = None,
        filtros: Dict[str, Any] = {},
        limite: int = 10000
    ) -> Dict[str, Any]:
        """Ajusta una regresión lineal simple o múltiple sobre los campos especificados.

        Retorna coeficientes, intercepto, R^2 y un ejemplo de predicciones.
        """
        try:
            collection = self.db[coleccion]

            # Construir proyección
            projection = {"_id": 0}
            features: List[str] = []
            if campos_x:
                for f in campos_x:
                    projection[f] = 1
                    features.append(f)
            elif campo_x:
                projection[campo_x] = 1
                features.append(campo_x)
            projection[campo_y] = 1

            cursor = collection.find(filtros, projection).limit(limite)
            datos = await cursor.to_list(length=limite)

            if not datos:
                return {
                    "success": False,
                    "mensaje": "No se encontraron registros",
                    "coeficientes": [],
                    "intercept": 0.0,
                    "r2": 0.0,
                    "n": 0,
                    "ejemplo_predicciones": []
                }

            df = pd.DataFrame(datos)

            # Convertir a valores numéricos
            cols_to_convert = features + [campo_y]
            for col in cols_to_convert:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')

            df = df.dropna(subset=cols_to_convert)

            if df.empty or len(features) == 0:
                return {
                    "success": False,
                    "mensaje": "No hay datos numéricos válidos o no se especificaron features",
                    "coeficientes": [],
                    "intercept": 0.0,
                    "r2": 0.0,
                    "n": 0,
                    "ejemplo_predicciones": []
                }

            X = df[features].values if len(features) > 1 else df[features[0]].values.reshape(-1, 1)
            y = df[campo_y].values

            model = LinearRegression()
            model.fit(X, y)

            preds = model.predict(X)
            score = float(r2_score(y, preds))

            coefs = [float(c) for c in np.atleast_1d(model.coef_).tolist()]
            intercept = float(model.intercept_)

            ejemplo = []
            sample = df.head(5)
            for _, row in sample.iterrows():
                input_vals = {f: (row[f] if f in row else None) for f in features}
                x_for_pred = row[features].values.reshape(1, -1) if len(features) > 1 else [row[features[0]]]
                try:
                    pred_val = float(model.predict(np.array(x_for_pred).reshape(1, -1))[0])
                except Exception:
                    pred_val = None
                ejemplo.append({"input": input_vals, "y": float(row[campo_y]), "pred": pred_val})

            return {
                "success": True,
                "mensaje": "Regresión lineal ajustada",
                "coeficientes": coefs,
                "intercept": intercept,
                "r2": score,
                "n": len(df),
                "ejemplo_predicciones": ejemplo
            }
        except Exception as e:
            return {
                "success": False,
                "mensaje": "Error ajustando regresión: " + str(e),
                "coeficientes": [],
                "intercept": 0.0,
                "r2": 0.0,
                "n": 0,
                "ejemplo_predicciones": []
            }
        return {
            "success": False, 
            "juegos": [], 
            "error": str(e)
        }

    async def calcular_matriz_correlacion(
        self,
        coleccion: str,
        campos: Optional[List[str]] = None,
        filtros: Dict[str, Any] = {},
        limite: int = 10000
    ) -> Dict[str, Any]:
        """Calcula la matriz de correlación Pearson entre campos numéricos.

        Si `campos` es None se intentan inferir columnas numéricas a partir
        de una muestra de documentos.
        """
        try:
            collection = self.db[coleccion]
            cursor = collection.find(filtros).limit(limite)
            datos = await cursor.to_list(length=limite)

            if not datos:
                return {
                    "success": False,
                    "mensaje": "No se encontraron registros",
                    "fields": [],
                    "matrix": [],
                    "n": 0
                }

            df = pd.DataFrame(datos)

            # Si no se especificaron campos, inferir columnas que pueden convertirse a numéricas
            if not campos:
                posibles = []
                for c in df.columns:
                    if c == '_id':
                        continue
                    # intentar conversión a numérico en una muestra
                    series = pd.to_numeric(df[c], errors='coerce')
                    non_na = series.dropna()
                    if len(non_na) >= max(1, min(10, len(df)//10)):
                        posibles.append(c)
                campos = posibles

            # Convertir columnas seleccionadas a numéricas y filtrar
            cols_validas = []
            for c in campos:
                if c in df.columns:
                    df[c] = pd.to_numeric(df[c], errors='coerce')
                    if df[c].dropna().shape[0] > 0:
                        cols_validas.append(c)

            if not cols_validas:
                return {
                    "success": False,
                    "mensaje": "No se encontraron columnas numéricas válidas",
                    "fields": [],
                    "matrix": [],
                    "n": 0
                }

            df_clean = df[cols_validas].dropna()
            if df_clean.empty:
                return {
                    "success": False,
                    "mensaje": "No hay suficientes datos numéricos después de limpiar NA",
                    "fields": cols_validas,
                    "matrix": [],
                    "n": 0
                }

            corr = df_clean.corr(method='pearson').round(3)

            # Convertir a matriz (lista de listas) y devolver campos
            fields = list(corr.columns)
            matrix = corr.values.tolist()

            # asegurar floats nativos
            matrix = [[float(v) for v in row] for row in matrix]

            return {
                "success": True,
                "mensaje": "Matriz de correlación calculada",
                "fields": fields,
                "matrix": matrix,
                "n": len(df_clean)
            }
        except Exception as e:
            return {
                "success": False,
                "mensaje": "Error calculando correlación: " + str(e),
                "fields": [],
                "matrix": [],
                "n": 0
            }

    async def obtener_metricas_dashboard(self, nombre_coleccion: str) -> Dict[str, Any]:
        """
        Obtiene métricas adicionales para el dashboard: jugadores activos, reviews totales, juegos 2024
        """
        try:
            coleccion = self.db[nombre_coleccion]
            
            # Pipeline para calcular múltiples métricas en una sola consulta
            pipeline = [
                {
                    "$addFields": {
                        # Normalizar jugadores activos
                        "playing_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Playing", None]}, 
                                    {"$ne": ["$Playing", ""]},
                                    {"$isNumber": "$Playing"}
                                ]},
                                "then": "$Playing",
                                "else": 0
                            }
                        },
                        # Normalizar reviews
                        "reviews_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Reviews", None]}, 
                                    {"$ne": ["$Reviews", ""]},
                                    {"$isNumber": "$Reviews"}
                                ]},
                                "then": "$Reviews",
                                "else": 0
                            }
                        },
                        # Extraer año de Release_Date
                        "anio_lanzamiento": {
                            "$cond": {
                                "if": {"$ne": ["$Release_Date", None]},
                                "then": {
                                    "$let": {
                                        "vars": {
                                            "match": {
                                                "$regexFind": {
                                                    "input": {"$toString": "$Release_Date"},
                                                    "regex": "\\d{4}"
                                                }
                                            }
                                        },
                                        "in": {
                                            "$cond": {
                                                "if": {"$ne": ["$$match", None]},
                                                "then": {
                                                    "$toInt": "$$match.match"
                                                },
                                                "else": 0
                                            }
                                        }
                                    }
                                },
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_jugadores_activos": {"$sum": "$playing_normalizado"},
                        "total_reviews": {"$sum": "$reviews_normalizado"},
                        "juegos_2024": {
                            "$sum": {
                                "$cond": [
                                    {"$eq": ["$anio_lanzamiento", 2024]}, 
                                    1, 
                                    0
                                ]
                            }
                        },
                        "total_juegos": {"$sum": 1}
                    }
                }
            ]
            
            print(f"Pipeline métricas dashboard para {nombre_coleccion}:")
            print(pipeline)

            cursor = coleccion.aggregate(pipeline)
            resultados = await cursor.to_list(length=1)
            print(f"Resultados métricas dashboard: {resultados}")
            
            if resultados:
                metricas = resultados[0]
                return {
                    "success": True,
                    "jugadores_activos": metricas.get("total_jugadores_activos", 0),
                    "reviews_totales": metricas.get("total_reviews", 0),
                    "juegos_2024": metricas.get("juegos_2024", 0),
                    "total_juegos": metricas.get("total_juegos", 0)
                }
            else:
                return {
                    "success": True,
                    "jugadores_activos": 0,
                    "reviews_totales": 0,
                    "juegos_2024": 0,
                    "total_juegos": 0
                }
            
        except Exception as e:
            print(f"Error en obtener_metricas_dashboard: {str(e)}")
            return {
                "success": False,
                "jugadores_activos": 0,
                "reviews_totales": 0,
                "juegos_2024": 0,
                "total_juegos": 0,
                "error": str(e)
            }

    async def obtener_hidden_gems(self, nombre_coleccion: str, limite: int = 5) -> Dict[str, Any]:
        """
        Obtiene juegos 'Hidden Gems': alto rating pero pocas reviews (joyas ocultas)
        """
        try:
            coleccion = self.db[nombre_coleccion]
            
            pipeline = [
                {
                    "$addFields": {
                        "rating_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Rating", None]}, 
                                    {"$ne": ["$Rating", ""]},
                                    {"$ne": ["$Rating", "N/A"]},
                                    {"$ne": ["$Rating", "TBD"]},
                                    {"$not": {"$eq": [{"$type": "$Rating"}, "string"]}}
                                ]},
                                "then": {
                                    "$cond": {
                                        "if": {"$isNumber": "$Rating"},
                                        "then": "$Rating",
                                        "else": {
                                            "$convert": {
                                                "input": "$Rating",
                                                "to": "double",
                                                "onError": 0
                                            }
                                        }
                                    }
                                },
                                "else": 0
                            }
                        },
                        "reviews_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Reviews", None]}, 
                                    {"$ne": ["$Reviews", ""]},
                                    {"$isNumber": "$Reviews"}
                                ]},
                                "then": "$Reviews",
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "Title": {"$ne": None, "$ne": ""},
                        "rating_normalizado": {"$gte": 4.0},  # Rating alto
                        "reviews_normalizado": {"$lte": 500}  # Pocas reviews
                    }
                },
                {"$sort": {"rating_normalizado": -1, "reviews_normalizado": 1}},
                {"$limit": limite},
                {
                    "$project": {
                        "_id": 0,
                        "titulo": "$Title",
                        "rating": "$rating_normalizado",
                        "reviews": "$reviews_normalizado",
                        "generos": "$Genres"
                    }
                }
            ]
            
            cursor = coleccion.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            
            return {
                "success": True,
                "juegos": resultados,
                "total": len(resultados)
            }
            
        except Exception as e:
            print(f"Error en obtener_hidden_gems: {str(e)}")
            return {
                "success": False,
                "juegos": [],
                "error": str(e)
            }

    async def obtener_trending_games(self, nombre_coleccion: str, limite: int = 5) -> Dict[str, Any]:
        """
        Obtiene juegos 'Trending': juegos recientes (2020+) con buena recepción
        """
        try:
            coleccion = self.db[nombre_coleccion]
            
            pipeline = [
                {
                    "$addFields": {
                        "rating_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Rating", None]}, 
                                    {"$ne": ["$Rating", ""]},
                                    {"$ne": ["$Rating", "N/A"]},
                                    {"$ne": ["$Rating", "TBD"]},
                                    {"$not": {"$eq": [{"$type": "$Rating"}, "string"]}}
                                ]},
                                "then": {
                                    "$cond": {
                                        "if": {"$isNumber": "$Rating"},
                                        "then": "$Rating",
                                        "else": {
                                            "$convert": {
                                                "input": "$Rating",
                                                "to": "double",
                                                "onError": 0
                                            }
                                        }
                                    }
                                },
                                "else": 0
                            }
                        },
                        "anio_lanzamiento": {
                            "$cond": {
                                "if": {"$ne": ["$Release_Date", None]},
                                "then": {
                                    "$let": {
                                        "vars": {
                                            "match": {
                                                "$regexFind": {
                                                    "input": {"$toString": "$Release_Date"},
                                                    "regex": "\\d{4}"
                                                }
                                            }
                                        },
                                        "in": {
                                            "$cond": {
                                                "if": {"$ne": ["$$match", None]},
                                                "then": {
                                                    "$toInt": "$$match.match"
                                                },
                                                "else": 0
                                            }
                                        }
                                    }
                                },
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "Title": {"$ne": None, "$ne": ""},
                        "rating_normalizado": {"$gte": 3.5},
                        "anio_lanzamiento": {"$gte": 2020}  # Juegos recientes
                    }
                },
                {"$sort": {"anio_lanzamiento": -1, "rating_normalizado": -1}},
                {"$limit": limite},
                {
                    "$project": {
                        "_id": 0,
                        "titulo": "$Title",
                        "rating": "$rating_normalizado",
                        "anio": "$anio_lanzamiento",
                        "generos": "$Genres"
                    }
                }
            ]
            
            cursor = coleccion.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            
            return {
                "success": True,
                "juegos": resultados,
                "total": len(resultados)
            }
            
        except Exception as e:
            print(f"Error en obtener_trending_games: {str(e)}")
            return {
                "success": False,
                "juegos": [],
                "error": str(e)
            }

    async def obtener_top_rated_games(self, nombre_coleccion: str, limite: int = 5) -> Dict[str, Any]:
        """
        Obtiene juegos 'Top Rated': los juegos con mejores calificaciones
        """
        try:
            coleccion = self.db[nombre_coleccion]
            
            pipeline = [
                {
                    "$addFields": {
                        "rating_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Rating", None]}, 
                                    {"$ne": ["$Rating", ""]},
                                    {"$ne": ["$Rating", "N/A"]},
                                    {"$ne": ["$Rating", "TBD"]},
                                    {"$not": {"$eq": [{"$type": "$Rating"}, "string"]}}
                                ]},
                                "then": {
                                    "$cond": {
                                        "if": {"$isNumber": "$Rating"},
                                        "then": "$Rating",
                                        "else": {
                                            "$convert": {
                                                "input": "$Rating",
                                                "to": "double",
                                                "onError": 0
                                            }
                                        }
                                    }
                                },
                                "else": 0
                            }
                        },
                        "reviews_normalizado": {
                            "$cond": {
                                "if": {"$and": [
                                    {"$ne": ["$Reviews", None]}, 
                                    {"$ne": ["$Reviews", ""]},
                                    {"$isNumber": "$Reviews"}
                                ]},
                                "then": "$Reviews",
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$match": {
                        "Title": {"$ne": None, "$ne": ""},
                        "rating_normalizado": {"$gte": 4.0},
                        "reviews_normalizado": {"$gte": 100}  # Al menos 100 reviews para ser confiable
                    }
                },
                {"$sort": {"rating_normalizado": -1, "reviews_normalizado": -1}},
                {"$limit": limite},
                {
                    "$project": {
                        "_id": 0,
                        "titulo": "$Title",
                        "rating": "$rating_normalizado",
                        "reviews": "$reviews_normalizado",
                        "generos": "$Genres"
                    }
                }
            ]
            
            cursor = coleccion.aggregate(pipeline)
            resultados = await cursor.to_list(length=limite)
            
            return {
                "success": True,
                "juegos": resultados,
                "total": len(resultados)
            }
            
        except Exception as e:
            print(f"Error en obtener_top_rated_games: {str(e)}")
            return {
                "success": False,
                "juegos": [],
                "error": str(e)
            }