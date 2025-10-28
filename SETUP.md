# 🚀 Configuración Inicial para Despliegue en Railway

## Archivos Creados ✅

Se han creado los siguientes archivos para facilitar el despliegue en Railway:

### Backend:
- ✅ `backend/Procfile` - Comando de inicio para Railway
- ✅ `backend/runtime.txt` - Versión de Python
- ✅ `backend/.env.example` - Ejemplo de variables de entorno

### Frontend:
- ✅ `frontend/.env.development` - Variables para desarrollo
- ✅ `frontend/.env.production` - Variables para producción (actualiza la URL)
- ✅ `frontend/.env.example` - Ejemplo de variables de entorno

### Raíz del proyecto:
- ✅ `railway.json` - Configuración de Railway
- ✅ `.railwayignore` - Archivos a ignorar en Railway
- ✅ `DEPLOYMENT.md` - Guía completa de despliegue
- ✅ `QUICK_DEPLOY.md` - Resumen rápido de comandos
- ✅ `SETUP.md` - Este archivo

### Archivos Modificados:
- ✅ `backend/app/main.py` - CORS configurado para producción
- ✅ `frontend/src/services/api.js` - Soporte para variables de entorno
- ✅ `frontend/package.json` - Scripts para Railway

---

## 🎯 Próximos Pasos

### 1. Actualizar `.env.production` del Frontend

Después de desplegar el backend en Railway, edita:
```
frontend/.env.production
```

Y reemplaza:
```
VITE_API_URL=https://tu-backend.railway.app/api
```

Con la URL real de tu backend.

### 2. Configurar MongoDB Atlas

Asegúrate de:
- Tener MongoDB Atlas configurado
- Agregar `0.0.0.0/0` en Network Access
- Copiar tu Connection String

### 3. Crear Repositorio en GitHub

Si aún no tienes un repositorio:
1. Ve a https://github.com/new
2. Crea `VideogamesReports`
3. No inicialices con README

### 4. Seguir la Guía de Despliegue

Lee `QUICK_DEPLOY.md` para pasos rápidos o `DEPLOYMENT.md` para guía completa.

---

## 📋 Variables de Entorno Necesarias

### Backend (Railway):
```
MONGO_URI=mongodb+srv://...
DATABASE_NAME=tu_base_datos
PORT=8000
ENVIRONMENT=production
```

### Frontend (Railway):
```
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## ✅ Checklist Pre-Despliegue

Antes de desplegar, asegúrate de:

- [ ] Tienes cuenta en Railway.app
- [ ] Tienes cuenta en GitHub
- [ ] MongoDB Atlas está configurado
- [ ] Tienes el Connection String de MongoDB
- [ ] Has leído `QUICK_DEPLOY.md`

---

## 🔗 Enlaces Útiles

- **Railway:** https://railway.app
- **GitHub:** https://github.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentación Railway:** https://docs.railway.app

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway
2. Consulta `DEPLOYMENT.md` sección "Solución de Problemas"
3. Revisa la documentación de Railway

---

¡Todo listo para desplegar! 🎉

**Siguiente paso:** Abre `QUICK_DEPLOY.md` y sigue las instrucciones.
