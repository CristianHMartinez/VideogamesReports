# 🔧 Comandos Útiles - Railway Deployment

## 📦 Git y GitHub

### Inicializar y Subir a GitHub (Primera vez)
```bash
cd "c:\Users\GAMER\Documents\Proyectos Software\Videogms\VideogamesReports"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/VideogamesReports.git
git branch -M main
git push -u origin main
```

### Actualizar Código (Después de cambios)
```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

### Ver Estado
```bash
git status
```

### Ver Historial
```bash
git log --oneline
```

---

## 🐍 Backend - Desarrollo Local

### Crear y Activar Entorno Virtual
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Instalar Dependencias
```bash
pip install -r requirements.txt
```

### Actualizar Dependencias
```bash
pip freeze > requirements.txt
```

### Ejecutar Servidor de Desarrollo
```bash
uvicorn app.main:app --reload
```

### Ejecutar en Puerto Específico
```bash
uvicorn app.main:app --reload --port 8000
```

### Ver Documentación API
```
http://localhost:8000/docs
```

### Probar Health Check
```bash
curl http://localhost:8000/health
```

---

## ⚛️ Frontend - Desarrollo Local

### Instalar Dependencias
```bash
cd frontend
npm install
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

### Build para Producción
```bash
npm run build
```

### Preview de Build
```bash
npm run preview
```

### Limpiar y Reinstalar
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 🗄️ MongoDB

### Conectar a MongoDB Atlas (mongosh)
```bash
mongosh "mongodb+srv://cluster.mongodb.net/database" --username usuario
```

### Verificar Colecciones
```javascript
show collections
```

### Contar Documentos
```javascript
db.coleccion.countDocuments()
```

### Ver Muestra de Datos
```javascript
db.coleccion.findOne()
```

---

## 🚂 Railway CLI (Opcional)

### Instalar Railway CLI
```bash
npm install -g railway
```

### Login
```bash
railway login
```

### Ver Logs en Tiempo Real
```bash
railway logs
```

### Ver Variables de Entorno
```bash
railway variables
```

### Ejecutar Comando en Railway
```bash
railway run npm run build
```

---

## 🔍 Debugging

### Backend - Ver Logs Detallados
```bash
uvicorn app.main:app --reload --log-level debug
```

### Frontend - Ver Build con Detalles
```bash
npm run build -- --debug
```

### Verificar Puerto en Uso (Windows)
```powershell
netstat -ano | findstr :8000
```

### Matar Proceso por Puerto (Windows)
```powershell
taskkill /PID <PID> /F
```

---

## 🧪 Testing

### Probar Endpoint con PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/reportes/colecciones" -Method GET
```

### Probar POST con PowerShell
```powershell
$body = @{
    coleccion = "Videogames"
    limite = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/reportes/generar" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 📝 Variables de Entorno

### Crear archivo .env en Backend
```bash
cd backend
copy .env.example .env
notepad .env
```

### Crear archivo .env.production en Frontend
```bash
cd frontend
copy .env.example .env.production
notepad .env.production
```

---

## 🔄 Actualizar Proyecto en Railway

### Método Automático (Recomendado)
```bash
# Hacer cambios en el código
git add .
git commit -m "Actualización"
git push origin main
# Railway redesplegará automáticamente
```

### Método Manual (Railway Dashboard)
1. Ir a Railway Dashboard
2. Seleccionar el servicio
3. Click en "Deploy" → "Redeploy"

---

## 🚨 Solución Rápida de Problemas

### Backend no inicia en Railway
```bash
# Ver logs en Railway Dashboard
# Verificar variables de entorno
# Verificar MONGO_URI
```

### Frontend no conecta con Backend
```bash
# Verificar VITE_API_URL en Railway variables
# Debe ser: https://tu-backend.railway.app/api
```

### Error de CORS
```bash
# El backend ya acepta todos los orígenes
# Verificar que la URL del backend sea correcta en el frontend
```

### MongoDB connection error
```bash
# Verificar MONGO_URI
# Verificar Network Access en MongoDB Atlas (0.0.0.0/0)
# Verificar Database name
```

---

## 📊 Monitoreo

### Ver Logs Backend (Railway)
1. Dashboard → Servicio Backend → Deployments → View Logs

### Ver Logs Frontend (Railway)
1. Dashboard → Servicio Frontend → Deployments → View Logs

### Métricas de Uso
1. Dashboard → Project → Usage

---

## 🎯 Comandos de Producción

### Ver Variables en Railway
```bash
railway variables
```

### Actualizar Variable
```bash
railway variables set VARIABLE=valor
```

### Hacer Rollback
1. Railway Dashboard
2. Deployments
3. Seleccionar deployment anterior
4. "Redeploy"

---

## 💡 Tips Útiles

### Alias útiles (agregar a PowerShell Profile)
```powershell
# Editar perfil
notepad $PROFILE

# Agregar alias
function gp { git push origin main }
function gs { git status }
function gc { git commit -m $args }
function dev-backend { cd backend; .\venv\Scripts\activate; uvicorn app.main:app --reload }
function dev-frontend { cd frontend; npm run dev }
```

### Scripts Personalizados

Crea `scripts/` con:
- `deploy.ps1` - Script automatizado de despliegue
- `test.ps1` - Script de pruebas
- `backup.ps1` - Script de respaldo

---

## 📚 Referencias Rápidas

- **Railway Docs:** https://docs.railway.app
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Vite Docs:** https://vitejs.dev
- **MongoDB Docs:** https://docs.mongodb.com

---

**Mantén este archivo a mano para referencia rápida! 📌**
