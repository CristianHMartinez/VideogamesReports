from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Cliente asíncrono para FastAPI
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Cliente síncrono para operaciones que lo requieran
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]

async def get_database():
    return database