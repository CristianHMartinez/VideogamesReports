from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Soportar tanto MONGODB_URL como MONGO_URI para compatibilidad
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL o MONGO_URI debe estar configurado en las variables de entorno")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME debe estar configurado en las variables de entorno")

# Cliente asíncrono para FastAPI
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Cliente síncrono para operaciones que lo requieran
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]

async def get_database():
    return database