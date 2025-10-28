# 🚀 Guía de Despliegue en Railway - Videogames Reports

Esta guía te ayudará a desplegar tu aplicación de Reportes de Videojuegos en Railway.

## 📋 Pre-requisitos

1. ✅ Cuenta en [Railway.app](https://railway.app)
2. ✅ Cuenta en GitHub
3. ✅ MongoDB Atlas configurado
4. ✅ Repositorio en GitHub con tu código

---

## 🎯 Paso 1: Preparar el Repositorio

### 1.1 Inicializar Git (si aún no lo has hecho)

```bash
cd "c:\Users\GAMER\Documents\Proyectos Software\Videogms\VideogamesReports"
git init
git add .
git commit -m "Initial commit - Videogames Reports"
```

### 1.2 Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un nuevo repositorio llamado `VideogamesReports`
3. **NO** inicialices con README, .gitignore o licencia
4. Copia la URL del repositorio

### 1.3 Conectar y Subir a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/VideogamesReports.git
git branch -M main
git push -u origin main
```

---

## 🚂 Paso 2: Desplegar Backend en Railway

### 2.1 Crear Nuevo Proyecto en Railway

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. Haz clic en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Selecciona tu repositorio `VideogamesReports`
6. Railway detectará automáticamente el proyecto

### 2.2 Configurar el Servicio Backend

1. Railway creará un servicio automáticamente
2. Haz clic en el servicio creado
3. Ve a **"Settings"** → **"General"**
4. En **"Root Directory"**, escribe: `backend`
5. En **"Start Command"**, escribe: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2.3 Configurar Variables de Entorno

1. Ve a la pestaña **"Variables"**
2. Agrega las siguientes variables:

```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DATABASE_NAME=tu_nombre_de_base_de_datos
PORT=8000
ENVIRONMENT=production
```

**⚠️ IMPORTANTE:** Reemplaza con tus credenciales reales de MongoDB Atlas

### 2.4 Obtener la URL del Backend

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Copia la URL generada (ejemplo: `https://tu-backend.railway.app`)
4. **Guarda esta URL**, la necesitarás para el frontend

---

## 🎨 Paso 3: Desplegar Frontend en Railway

### 3.1 Crear un Nuevo Servicio para el Frontend

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona el mismo repositorio `VideogamesReports`

### 3.2 Configurar el Servicio Frontend

1. Haz clic en el nuevo servicio
2. Ve a **"Settings"** → **"General"**
3. En **"Root Directory"**, escribe: `frontend`
4. En **"Build Command"**, escribe: `npm install && npm run build`
5. En **"Start Command"**, escribe: `npm run preview -- --host 0.0.0.0 --port $PORT`

### 3.3 Actualizar la URL del Backend en el Frontend

Antes de desplegar, necesitas actualizar la URL de la API en tu código:

```bash
# Edita el archivo: frontend/src/services/api.js
```

Cambia:
```javascript
const API_URL = 'http://localhost:8000';
```

Por:
```javascript
const API_URL = 'https://tu-backend.railway.app'; // URL de tu backend en Railway
```

### 3.4 Subir los Cambios

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

Railway redesplegará automáticamente.

### 3.5 Generar Dominio para el Frontend

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Copia la URL (ejemplo: `https://tu-frontend.railway.app`)

---

## 🔧 Paso 4: Configuración Final

### 4.1 Actualizar CORS en el Backend

Si quieres restringir el acceso solo a tu frontend:

1. Edita `backend/app/main.py`
2. En la línea de `allow_origins`, reemplaza `["*"]` por:

```python
allow_origins=[
    "https://tu-frontend.railway.app",  # Tu dominio de frontend en Railway
    "http://localhost:5173",  # Para desarrollo local
]
```

3. Sube los cambios:

```bash
git add .
git commit -m "Update CORS for production domain"
git push origin main
```

---

## ✅ Paso 5: Verificar el Despliegue

### 5.1 Probar el Backend

Abre en tu navegador:
```
https://tu-backend.railway.app/
```

Deberías ver:
```json
{
  "mensaje": "API de Reportes funcionando correctamente"
}
```

### 5.2 Probar Health Check

```
https://tu-backend.railway.app/health
```

Deberías ver:
```json
{
  "status": "healthy"
}
```

### 5.3 Probar el Frontend

Abre:
```
https://tu-frontend.railway.app
```

Deberías ver tu aplicación funcionando correctamente.

---

## 📊 Monitoreo y Logs

### Ver Logs del Backend
1. Ve al servicio backend en Railway
2. Haz clic en la pestaña **"Deployments"**
3. Selecciona el deployment actual
4. Haz clic en **"View Logs"**

### Ver Logs del Frontend
1. Ve al servicio frontend en Railway
2. Haz clic en la pestaña **"Deployments"**
3. Selecciona el deployment actual
4. Haz clic en **"View Logs"**

---

## 🔄 Redespliegue Automático

Railway redesplegará automáticamente cuando hagas `git push` a tu repositorio.

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Railway detectará los cambios y redesplegará automáticamente.

---

## ⚠️ Solución de Problemas Comunes

### Error: "Application failed to start"

**Solución:**
- Verifica que las variables de entorno estén correctamente configuradas
- Revisa los logs en Railway para ver el error específico
- Asegúrate de que `MONGO_URI` sea válido

### Error: "CORS policy blocked"

**Solución:**
- Verifica que el frontend esté usando la URL correcta del backend
- Asegúrate de que `allow_origins` incluya el dominio del frontend

### Error: "Cannot connect to database"

**Solución:**
- Verifica que tu IP esté en la lista blanca de MongoDB Atlas
- Para Railway, agrega `0.0.0.0/0` (todas las IPs) en MongoDB Atlas → Network Access
- Verifica que las credenciales de `MONGO_URI` sean correctas

### El frontend no carga los datos

**Solución:**
- Abre la consola del navegador (F12)
- Verifica la URL de la API en `frontend/src/services/api.js`
- Asegúrate de que apunta a tu backend de Railway

---

## 💰 Costos

Railway ofrece:
- **Plan gratuito:** $5 de crédito mensual
- Suficiente para proyectos pequeños
- Puedes actualizar a un plan de pago si es necesario

---

## 🎉 ¡Listo!

Tu aplicación de Reportes de Videojuegos ahora está desplegada en Railway.

**URLs importantes:**
- Backend: `https://tu-backend.railway.app`
- Frontend: `https://tu-frontend.railway.app`
- Documentación API: `https://tu-backend.railway.app/docs`

---

## 📝 Notas Adicionales

### Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Custom Domain"**
3. Sigue las instrucciones para configurar DNS

### Escalado

Railway escala automáticamente según la demanda. No necesitas configuración adicional.

### Base de Datos MongoDB

Railway no incluye MongoDB, por eso usamos MongoDB Atlas (gratuito hasta 512MB).

---

## 🆘 Ayuda

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de FastAPI](https://fastapi.tiangolo.com)
- [Documentación de Vite](https://vitejs.dev)

---

**¡Feliz despliegue! 🚀**
