# 🎮 Videogames Reports

Sistema de reportes y análisis de datos de videojuegos con MongoDB, FastAPI y React.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.119.1-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 📋 Descripción

Aplicación web completa para generar reportes personalizados desde MongoDB Atlas, con visualización de datos interactiva y análisis estadísticos de videojuegos.

### ✨ Características Principales

- 📊 **Dashboard Interactivo** - Visualización de métricas clave
- 📈 **Gráficos Dinámicos** - LineChart, BarChart, DonutChart
- 🔍 **Filtros Avanzados** - Búsqueda y filtrado por múltiples criterios
- 📥 **Exportación CSV** - Descarga de reportes personalizados
- 🎯 **Top Rankings** - Juegos más populares y mejor valorados
- 📱 **Responsive Design** - Adaptable a todos los dispositivos

---

## 🏗️ Arquitectura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │◄────►│  FastAPI Backend│◄────►│  MongoDB Atlas  │
│   (Vite)        │      │   (Python)      │      │   (Database)    │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 🚀 Despliegue en Railway

### Opción 1: Guía Rápida
Lee **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** para un resumen con comandos.

### Opción 2: Guía Completa
Lee **[DEPLOYMENT.md](./DEPLOYMENT.md)** para instrucciones detalladas paso a paso.

### Opción 3: Configuración Inicial
Lee **[SETUP.md](./SETUP.md)** para información sobre archivos creados.

---

## 💻 Desarrollo Local

### Requisitos Previos

- Python 3.11+
- Node.js 18+
- MongoDB Atlas (cuenta gratuita)

### Configuración del Backend

```bash
# Navegar a la carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Copia .env.example a .env y edita con tus credenciales
copy .env.example .env

# Ejecutar servidor
uvicorn app.main:app --reload
```

El backend estará disponible en: `http://localhost:8000`

Documentación API: `http://localhost:8000/docs`

### Configuración del Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
VideogamesReports/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Aplicación FastAPI
│   │   ├── database.py          # Conexión MongoDB
│   │   ├── models.py            # Modelos Pydantic
│   │   ├── routes/
│   │   │   └── reportes.py      # Endpoints API
│   │   └── services/
│   │       └── reporte_service.py
│   ├── requirements.txt         # Dependencias Python
│   ├── Procfile                 # Configuración Railway
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ReporteForm.jsx
│   │   │   ├── TablaReporte.jsx
│   │   │   ├── TopJuegosTabla.jsx
│   │   │   └── charts/          # Gráficos
│   │   ├── services/
│   │   │   └── api.js           # Cliente Axios
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── DEPLOYMENT.md                # Guía completa de despliegue
├── QUICK_DEPLOY.md              # Resumen de comandos
├── SETUP.md                     # Información de configuración
└── README.md                    # Este archivo
```

---

## 🔑 Variables de Entorno

### Backend (.env)

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
DATABASE_NAME=nombre_base_datos
PORT=8000
ENVIRONMENT=development
```

### Frontend (.env.production)

```env
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## 📊 Endpoints API Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reportes/colecciones` | Obtener colecciones disponibles |
| GET | `/api/reportes/estadisticas/{coleccion}` | Estadísticas de una colección |
| POST | `/api/reportes/generar` | Generar reporte personalizado |
| GET | `/api/reportes/top-juegos-populares/{coleccion}` | Top juegos más populares |
| GET | `/api/reportes/metricas-dashboard/{coleccion}` | Métricas para dashboard |
| GET | `/health` | Estado del servidor |

Ver documentación completa en: `http://localhost:8000/docs`

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno y rápido
- **Motor** - Driver asíncrono de MongoDB
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI
- **Python-dotenv** - Variables de entorno

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilos componetizados

### Base de Datos
- **MongoDB Atlas** - Base de datos cloud

### Deploy
- **Railway** - Plataforma de despliegue

---

## 📈 Características de Análisis

- ✅ Conteo por campo
- ✅ Distribución temporal
- ✅ Análisis de géneros
- ✅ Rating promedio
- ✅ Top desarrolladores
- ✅ Juegos populares
- ✅ Hidden gems
- ✅ Métricas agregadas

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Cristian H. Martinez**
- GitHub: [@CristianHMartinez](https://github.com/CristianHMartinez)

---

## 🆘 Soporte

¿Problemas con el despliegue? Consulta:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Sección "Solución de Problemas"
- [Documentación de Railway](https://docs.railway.app)
- [Documentación de FastAPI](https://fastapi.tiangolo.com)

---

## 🎯 Roadmap

- [ ] Autenticación de usuarios
- [ ] Exportación a Excel
- [ ] Más tipos de gráficos
- [ ] Filtros guardados
- [ ] Comparación de juegos
- [ ] API pública

---

**¡Hecho con ❤️ para la comunidad gamer!** 🎮
