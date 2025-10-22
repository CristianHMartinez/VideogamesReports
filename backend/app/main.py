from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import reportes

app = FastAPI(
    title="API de Reportes MongoDB",
    description="API para generar reportes desde MongoDB Atlas",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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