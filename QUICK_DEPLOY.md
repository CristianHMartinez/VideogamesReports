# 🚀 Despliegue Rápido en Railway - Resumen de Comandos

## 📦 1. Preparar y Subir a GitHub

```bash
# Navegar al proyecto
cd "c:\Users\GAMER\Documents\Proyectos Software\Videogms\VideogamesReports"

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Ready for deployment"

# Agregar repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/VideogamesReports.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

---

## 🚂 2. Desplegar en Railway

### Backend

1. **Crear proyecto en Railway:**
   - Ve a https://railway.app
   - Login con GitHub
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona `VideogamesReports`

2. **Configurar Backend:**
   - **⚠️ MUY IMPORTANTE:** Settings → General → Root Directory: `backend`
   - El Start Command se detecta automáticamente con `nixpacks.toml`
   - Si es necesario, manualmente agrega: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Variables de entorno (pestaña Variables):**
   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   DATABASE_NAME=nombre_base_datos
   PORT=8000
   ENVIRONMENT=production
   ```

4. **Generar dominio:**
   - Settings → Networking → Generate Domain
   - **Copia la URL** (ej: `https://videogames-backend.railway.app`)

### Frontend

1. **Crear nuevo servicio:**
   - En el mismo proyecto, click "+ New"
   - Selecciona "GitHub Repo"
   - Selecciona `VideogamesReports`

2. **Configurar Frontend:**
   - Settings → General → Root Directory: `frontend`
   - Settings → General → Build Command: `npm install && npm run build`
   - Settings → General → Start Command: `npm run start`

3. **Variable de entorno (pestaña Variables):**
   ```
   VITE_API_URL=https://TU-BACKEND.railway.app/api
   ```
   ⚠️ Reemplaza con la URL de tu backend de Railway

4. **Generar dominio:**
   - Settings → Networking → Generate Domain
   - **Copia la URL** (ej: `https://videogames-frontend.railway.app`)

---

## ✅ 3. Verificar Despliegue

### Probar Backend:
```
https://tu-backend.railway.app/
https://tu-backend.railway.app/health
https://tu-backend.railway.app/docs
```

### Probar Frontend:
```
https://tu-frontend.railway.app
```

---

## 🔄 4. Actualizar la Aplicación

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Railway redesplegará automáticamente. 🎉

---

## ⚙️ 5. Configurar MongoDB Atlas

**Importante:** Permitir acceso desde cualquier IP

1. Ve a MongoDB Atlas
2. Network Access → Add IP Address
3. Selecciona "Allow Access from Anywhere"
4. IP: `0.0.0.0/0`
5. Confirma

---

## 📝 Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Backend desplegado en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] URL del backend generada
- [ ] Frontend desplegado en Railway
- [ ] Variable `VITE_API_URL` configurada con URL del backend
- [ ] URL del frontend generada
- [ ] MongoDB Atlas configurado con IP 0.0.0.0/0
- [ ] Backend funcionando (visita /health)
- [ ] Frontend funcionando (visita la URL)

---

## 🆘 Problemas Comunes

### "Application failed to start"
→ Revisa los logs en Railway
→ Verifica variables de entorno

### "CORS blocked"
→ Verifica `VITE_API_URL` en frontend
→ El backend ya acepta todos los orígenes

### "Cannot connect to database"
→ Verifica `MONGO_URI`
→ Agrega 0.0.0.0/0 en MongoDB Atlas Network Access

---

## 📚 Documentación Completa

Para más detalles, consulta: `DEPLOYMENT.md`

---

¡Listo para desplegar! 🚀
