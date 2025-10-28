# 🗺️ Mapa Visual del Despliegue en Railway

## 📍 Resumen en 3 Pasos

```
1️⃣  PREPARAR      2️⃣  DESPLEGAR      3️⃣  VERIFICAR
    ↓                   ↓                   ↓
  GitHub            Railway              Probar
```

---

## 🔄 Flujo Completo de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                    🖥️  TU COMPUTADORA                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ git push
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      🌐  GITHUB                                  │
│                                                                  │
│  Repository: VideogamesReports                                  │
│  ├── backend/                                                   │
│  └── frontend/                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Railway conecta
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      🚂  RAILWAY                                 │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  Backend Service     │      │  Frontend Service    │        │
│  │  ─────────────────   │      │  ──────────────────  │        │
│  │  Root: backend/      │      │  Root: frontend/     │        │
│  │  Port: $PORT         │      │  Port: $PORT         │        │
│  │  ✅ uvicorn          │      │  ✅ npm build        │        │
│  └──────────┬───────────┘      └──────────┬───────────┘        │
│             │                              │                     │
│             ↓                              ↓                     │
│  https://backend.railway.app   https://frontend.railway.app    │
└─────────────┬────────────────────────────┬────────────────────┘
              │                            │
              │ ← API Calls →              │
              ↓                            ↓
┌─────────────────────────┐    ┌─────────────────────────┐
│   📊 MongoDB Atlas      │    │    👤 Usuario Final     │
│   (Base de Datos)       │    │    (Navegador)          │
└─────────────────────────┘    └─────────────────────────┘
```

---

## 🎯 Arquitectura de Producción

```
┌────────────────────────────────────────────────────────────────┐
│                        INTERNET                                 │
└────────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌─────────────────────────────────────┐
        │    🌐 Railway Frontend Service      │
        │    https://app.railway.app          │
        │                                      │
        │    • React App                       │
        │    • Vite Build                      │
        │    • Static Files                    │
        └──────────────┬──────────────────────┘
                       │
                       │ VITE_API_URL
                       │
                       ↓
        ┌─────────────────────────────────────┐
        │    🚀 Railway Backend Service       │
        │    https://api.railway.app          │
        │                                      │
        │    • FastAPI                         │
        │    • Python 3.11                     │
        │    • uvicorn                         │
        └──────────────┬──────────────────────┘
                       │
                       │ MONGO_URI
                       │
                       ↓
        ┌─────────────────────────────────────┐
        │    🗄️  MongoDB Atlas                │
        │    mongodb+srv://...                 │
        │                                      │
        │    • Videogames Collection           │
        │    • Games Collection                │
        │    • Stats & Analytics               │
        └─────────────────────────────────────┘
```

---

## 📊 Variables de Entorno - Flujo

```
DESARROLLO LOCAL:
─────────────────
Backend (.env)          →   MongoDB Atlas
├── MONGO_URI          →   (Connection String)
├── DATABASE_NAME      →   videogames_db
├── PORT               →   8000
└── ENVIRONMENT        →   development

Frontend (.env.development)
└── VITE_API_URL       →   http://localhost:8000/api


PRODUCCIÓN (Railway):
─────────────────────
Backend (Railway Variables)  →   MongoDB Atlas
├── MONGO_URI                →   (Connection String)
├── DATABASE_NAME            →   videogames_db
├── PORT                     →   $PORT (Auto)
└── ENVIRONMENT              →   production

Frontend (Railway Variables)
└── VITE_API_URL             →   https://backend.railway.app/api
```

---

## 🔄 Ciclo de Actualización

```
1. 💻 Hacer Cambios Localmente
   │
   ├── Editar código
   ├── Probar localmente
   └── Verificar funcionamiento
   │
   ↓

2. 📝 Commit a Git
   │
   ├── git add .
   ├── git commit -m "mensaje"
   └── git push origin main
   │
   ↓

3. 🚂 Railway Detecta Cambios
   │
   ├── Webhook desde GitHub
   ├── Inicia build automático
   └── Ejecuta tests
   │
   ↓

4. 🏗️ Build y Deploy
   │
   Backend:
   ├── Instala requirements.txt
   ├── Ejecuta uvicorn
   └── Health check
   │
   Frontend:
   ├── npm install
   ├── npm run build
   └── npm run start
   │
   ↓

5. ✅ Aplicación Actualizada
   │
   ├── Nueva versión en vivo
   ├── URLs siguen siendo las mismas
   └── Sin downtime (zero-downtime deployment)
```

---

## 🎨 Componentes y Comunicación

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                           │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Dashboard  │  │ ReporteForm │  │ TablaReporte│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         └────────────────┴────────────────┘                  │
│                          │                                    │
│                    ┌─────▼─────┐                             │
│                    │  api.js   │  (Axios)                    │
│                    └─────┬─────┘                             │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    HTTP Requests
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   main.py   │→ │  routes/    │→ │  services/  │         │
│  │   (FastAPI) │  │ reportes.py │  │ reporte_    │         │
│  │             │  │             │  │ service.py  │         │
│  └─────────────┘  └─────────────┘  └──────┬──────┘         │
│                                            │                  │
│                                     ┌──────▼──────┐          │
│                                     │ database.py │          │
│                                     │  (Motor)    │          │
│                                     └──────┬──────┘          │
└────────────────────────────────────────────┼─────────────────┘
                                             │
                                      MongoDB Queries
                                             │
┌────────────────────────────────────────────▼─────────────────┐
│                    MONGODB ATLAS                              │
│                                                               │
│  Collections:                                                 │
│  ├── Videogames  (100+ documentos)                           │
│  ├── Games       (1000+ documentos)                          │
│  └── Statistics  (agregaciones)                              │
└───────────────────────────────────────────────────────────────┘
```

---

## 📋 Timeline de Despliegue

```
Tiempo  │  Acción                         │  Estado
────────┼─────────────────────────────────┼─────────────────
        │                                 │
 T+0    │  Push a GitHub                  │  🟡 Iniciando
        │  ├── git push origin main       │
        │  └── GitHub recibe código       │
        │                                 │
 T+10s  │  Railway Detecta Cambios        │  🟡 Building
        │  ├── Webhook activado           │
        │  └── Inicia build               │
        │                                 │
 T+30s  │  Backend Build                  │  🟡 Building
        │  ├── Instala Python deps        │
        │  └── Ejecuta uvicorn            │
        │                                 │
 T+45s  │  Frontend Build                 │  🟡 Building
        │  ├── npm install                │
        │  ├── npm run build              │
        │  └── Vite optimiza assets       │
        │                                 │
 T+60s  │  Health Checks                  │  🟡 Verificando
        │  ├── Backend: /health           │
        │  └── Frontend: HTTP 200         │
        │                                 │
 T+75s  │  Deploy Completo                │  🟢 Live!
        │  ├── URLs activas               │
        │  └── Aplicación funcionando     │
        │                                 │
```

---

## 🔐 Seguridad y Configuración

```
┌───────────────────────────────────────────────────────────┐
│                  CONFIGURACIÓN SEGURA                      │
└───────────────────────────────────────────────────────────┘

GitHub Repository
├── ✅ Código fuente
├── ✅ Archivos de configuración
├── ✅ .env.example (sin credenciales)
├── ❌ .env (ignorado por .gitignore)
├── ❌ credenciales reales
└── ❌ archivos sensibles

Railway Environment Variables
├── ✅ MONGO_URI (encriptado)
├── ✅ DATABASE_NAME
├── ✅ API Keys
└── ✅ Secrets

MongoDB Atlas
├── ✅ Network Access: 0.0.0.0/0
├── ✅ User authentication
├── ✅ Connection string encryption
└── ✅ Backup automático
```

---

## 🎯 Endpoints Disponibles

```
BACKEND API:
────────────
GET  /                                    →  Mensaje de bienvenida
GET  /health                              →  Estado del servidor
GET  /docs                                →  Documentación Swagger

GET  /api/reportes/colecciones           →  Lista de colecciones
GET  /api/reportes/estadisticas/{col}    →  Estadísticas
POST /api/reportes/generar               →  Generar reporte

GET  /api/reportes/top-juegos-populares/{col}  →  Top juegos
GET  /api/reportes/metricas-dashboard/{col}    →  Métricas
GET  /api/reportes/hidden-gems/{col}           →  Joyas ocultas

FRONTEND ROUTES:
────────────────
/                                         →  Dashboard principal
```

---

**📚 Para más información, consulta:**
- `QUICK_DEPLOY.md` - Comandos rápidos
- `DEPLOYMENT.md` - Guía completa
- `CHECKLIST.md` - Lista de verificación

**¡Feliz despliegue! 🚀**
