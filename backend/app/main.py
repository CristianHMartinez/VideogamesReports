from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import reportes
import os

app = FastAPI(
    title="API de Reportes MongoDB",
    description="API para generar reportes desde MongoDB Atlas",
    version="1.0.0"
)

# Configurar CORS - permitir todos los orígenes en producción
# En producción deberías especificar tu dominio de frontend
allowed_origins = [
    "tranquil-fascination-production.up.railway.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.railway.app",  # Permite todos los subdominios de Railway
    "*"  # Temporalmente permite todos los orígenes (cambiar en producción)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, reemplaza con tu dominio específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(reportes.router)

@app.get("/")
async def root():
    return {"mensaje": "API de Reportes funcionando correctamente"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}