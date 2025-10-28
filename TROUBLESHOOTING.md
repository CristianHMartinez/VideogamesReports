# 🚨 Solución al Error "Nixpacks was unable to generate a build plan"

## ❌ Error que Estás Viendo

```
Nixpacks was unable to generate a build plan for this app.
The contents of the app directory are:
  VISUAL_GUIDE.md
  backend/
  frontend/
  ...
```

## ✅ Solución (2 Minutos)

### Paso 1: Configurar Root Directory

Railway no sabe si debe construir el `backend/` o el `frontend/`. Necesitas decirle cuál.

**Para el Backend:**

1. Ve a tu servicio en Railway Dashboard
2. Click en **Settings** (⚙️ rueda dentada)
3. Scroll hasta **Service Settings** → **General**
4. Busca **Root Directory**
5. Escribe: `backend`
6. Click fuera del campo (se guarda automáticamente)
7. El deploy se reiniciará automáticamente

**Captura de pantalla de referencia:**
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│ ┌─────────────────────────────────┐ │
│ │ backend                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Paso 2: Verificar el Deploy

Después de configurar el Root Directory:

1. El deploy se reiniciará automáticamente
2. Ve a la pestaña **Deployments**
3. Verás un nuevo deployment en progreso
4. Espera a que termine (1-2 minutos)

### Paso 3: Verificar que Funciona

Abre en tu navegador:
```
https://tu-servicio.railway.app/health
```

Deberías ver:
```json
{
  "status": "healthy"
}
```

---

## 🔍 ¿Por Qué Ocurre Este Error?

Railway usa **Nixpacks** para detectar automáticamente el lenguaje y framework de tu aplicación.

Cuando tienes un **monorepo** (múltiples proyectos en una carpeta), Railway ve:
- `backend/` (Python/FastAPI)
- `frontend/` (Node.js/React)
- Archivos `.md` (documentación)

Y no sabe cuál construir. Por eso necesitas especificar el **Root Directory**.

---

## 📝 Configuración Completa para Backend

### Settings → General

```
Root Directory:     backend
Build Command:      (automático con nixpacks.toml)
Start Command:      (automático con nixpacks.toml)
```

Si el Start Command no se detecta, agrégalo manualmente:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Settings → Variables (pestaña Variables)

```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
DATABASE_NAME=tu_base_datos
PORT=8000
ENVIRONMENT=production
```

---

## 🎯 Para el Frontend (Más Tarde)

Cuando quieras desplegar el frontend, necesitarás:

1. Crear un **nuevo servicio** en Railway
2. Conectar el mismo repositorio
3. Configurar **Root Directory: `frontend`**
4. Agregar variable: `VITE_API_URL=https://tu-backend.railway.app/api`

---

## ✅ Checklist Rápido

- [ ] Ir a Settings en Railway
- [ ] Configurar Root Directory: `backend`
- [ ] Guardar (click fuera del campo)
- [ ] Esperar a que el deploy se reinicie
- [ ] Verificar /health endpoint

---

## 🆘 Si Aún Tienes Problemas

### Ver Logs del Build

1. Ve a **Deployments**
2. Click en el deployment actual
3. Verás los logs en tiempo real

### Errores Comunes

**Error: "Python not found"**
- Solución: El archivo `nixpacks.toml` debería resolverlo
- Si persiste, agrega `runtime.txt` con `python-3.11.0`

**Error: "requirements.txt not found"**
- Solución: Verifica que Root Directory esté en `backend`
- El archivo debe estar en `backend/requirements.txt`

**Error: "Module 'app' not found"**
- Solución: Verifica la estructura del backend
- Debe tener `backend/app/main.py`

---

## 📞 Información de Ayuda

Si el problema persiste después de configurar el Root Directory:

1. Revisa los **logs** del deployment
2. Verifica que el archivo `backend/nixpacks.toml` existe
3. Asegúrate de que `backend/requirements.txt` existe
4. Confirma que `backend/app/main.py` existe

---

## 🎉 ¡Listo!

Después de configurar el Root Directory, tu backend debería desplegarse correctamente en Railway.

**URLs para verificar:**
- Health: `https://tu-backend.railway.app/health`
- API Docs: `https://tu-backend.railway.app/docs`
- Colecciones: `https://tu-backend.railway.app/api/reportes/colecciones`

---

**¿Funcionó?** ¡Continúa con el despliegue del frontend! 🚀
