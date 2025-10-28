from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Soportar tanto MONGODB_URL como MONGO_URI para compatibilidad
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Debug: Imprimir información de configuración (sin mostrar la contraseña completa)
print("=" * 50)
print("🔍 CONFIGURACIÓN DE BASE DE DATOS")
print("=" * 50)
if MONGODB_URL:
    # Ocultar la contraseña en los logs
    safe_url = MONGODB_URL.split('@')[1] if '@' in MONGODB_URL else "URL configurada"
    print(f"✅ MONGO_URI: mongodb+srv://***@{safe_url}")
else:
    print("❌ MONGO_URI: NO CONFIGURADO")

print(f"✅ DATABASE_NAME: {DATABASE_NAME}" if DATABASE_NAME else "❌ DATABASE_NAME: NO CONFIGURADO")
print("=" * 50)

if not MONGODB_URL:
    raise ValueError("MONGODB_URL o MONGO_URI debe estar configurado en las variables de entorno")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME debe estar configurado en las variables de entorno")

# Cliente asíncrono para FastAPI
try:
    print("🔌 Intentando conectar a MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    database = client[DATABASE_NAME]
    print(f"✅ Conexión exitosa a la base de datos: {DATABASE_NAME}")
except Exception as e:
    print(f"❌ Error al conectar a MongoDB: {str(e)}")
    raise

# Cliente síncrono para operaciones que lo requieran
sync_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
sync_database = sync_client[DATABASE_NAME]

async def get_database():
    return database