# Runbook - Operaciones PRUNAPE

Guía operacional para administradores de sistemas y personal de IT responsable de mantener la aplicación PRUNAPE en producción.

## Inicio Rápido

### Iniciar Ambiente de Desarrollo

```bash
# Terminal 1: Backend
cd prunape/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd prunape/frontend
npm install
npm run dev
```

**Verificación:**
- Backend: `curl http://localhost:8000/docs` (debe mostrar Swagger UI)
- Frontend: `http://localhost:5173` (debe mostrar aplicación)

### Iniciar en Producción

```bash
# Backend
cd prunape/backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (build + servidor estático)
cd prunape/frontend
npm run build
npm run preview
# O usar nginx/Apache para servir ./dist
```

---

## Variables de Entorno

### Backend

```bash
# .env (opcional, valores por defecto)
DATABASE_URL=sqlite:///./prunape.db
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,https://prunape.hospital.ar
ENVIRONMENT=development|production|staging
```

**Definiciones:**

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./prunape.db` | Path a base de datos SQLite |
| `LOG_LEVEL` | `INFO` | Nivel de logging (DEBUG, INFO, WARNING, ERROR, CRITICAL) |
| `CORS_ORIGINS` | `http://localhost:5173` | Orígenes permitidos para CORS (separados por coma) |
| `ENVIRONMENT` | `development` | Modo de ejecución |

**Producción típica:**
```bash
DATABASE_URL=sqlite:////data/prunape/prunape.db
LOG_LEVEL=INFO
CORS_ORIGINS=https://prunape.hospital.ar,https://prunape-staging.hospital.ar
ENVIRONMENT=production
```

### Frontend

```bash
# .env.production (en carpeta frontend)
VITE_API_URL=https://api.prunape.hospital.ar
```

**Definiciones:**

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | URL del servidor backend sin path. El cliente agrega `/api`. |

**Producción típica:**
```
VITE_API_URL=https://api.prunape.hospital.ar
```

---

## Base de Datos SQLite

### Ubicación

```
prunape/backend/prunape.db
```

En producción, se recomienda:
```
/data/prunape/prunape.db
```

O montar en volumen persistente si es containerizado.

### Estructura de Tablas

```
┌─────────────────────────────────────────────────────┐
│ patient                                             │
├─────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ name                                                │
│ birth_date                                          │
│ gestational_age_weeks (nullable)                    │
│ created_at                                          │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│ assessment                                          │
├─────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ patient_id (FK → patient.id)                        │
│ assessment_date                                     │
│ chronological_age                                   │
│ corrected_age (nullable)                            │
│ result (PASA | NO_PASA)                             │
│ created_at                                          │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│ assessment_item                                     │
├─────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ assessment_id (FK → assessment.id)                  │
│ pauta_id                                            │
│ pauta_name                                          │
│ area (P.Social|Motor Fino|Lenguaje|Motor Grueso)   │
│ pauta_type (A | B)                                  │
│ passed (bool)                                       │
└─────────────────────────────────────────────────────┘
```

### Inicializar Base de Datos

Las tablas se crean automáticamente al iniciar la aplicación:

```python
# backend/main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
```

**Reiniciar con BD limpia:**

```bash
cd backend
rm prunape.db  # Elimina BD actual
python -c "from database import Base, engine; Base.metadata.create_all(engine)"
# O simplemente iniciar la app: uvicorn main:app --reload
```

### Backup de Base de Datos

**Backup manual:**

```bash
# Copiar archivo
cp prunape.db prunape.db.backup.$(date +%Y%m%d_%H%M%S)

# O usar utilidad de SQLite
sqlite3 prunape.db ".backup prunape.db.backup"
```

**Script de backup automático (cron):**

```bash
#!/bin/bash
# /usr/local/bin/backup_prunape.sh

BACKUP_DIR="/backups/prunape"
DB_PATH="/data/prunape/prunape.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sqlite3 $DB_PATH ".backup $BACKUP_DIR/prunape.db.$DATE"

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "prunape.db.*" -mtime +30 -delete

echo "Backup completado: prunape.db.$DATE"
```

Agregar a crontab:
```bash
# Backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup_prunape.sh
```

**Restaurar desde backup:**

```bash
# Detener aplicación
systemctl stop prunape

# Restaurar
cp prunape.db.backup.20260315_030000 prunape.db

# Iniciar aplicación
systemctl start prunape
```

### Consultas SQL Útiles

```sql
-- Total de pacientes
SELECT COUNT(*) as total_pacientes FROM patient;

-- Total de evaluaciones
SELECT COUNT(*) as total_evaluaciones FROM assessment;

-- Pacientes sin evaluaciones
SELECT p.id, p.name, COUNT(a.id) as num_evaluaciones
FROM patient p
LEFT JOIN assessment a ON p.id = a.patient_id
GROUP BY p.id
HAVING COUNT(a.id) = 0;

-- Resultados históricos
SELECT result, COUNT(*) as cantidad
FROM assessment
GROUP BY result;

-- Evaluaciones recientes (últimos 7 días)
SELECT p.name, a.assessment_date, a.result
FROM assessment a
JOIN patient p ON a.patient_id = p.id
WHERE a.created_at >= date('now', '-7 days')
ORDER BY a.created_at DESC;

-- Pacientes prematuros
SELECT name, birth_date, gestational_age_weeks
FROM patient
WHERE gestational_age_weeks IS NOT NULL
AND gestational_age_weeks < 37;
```

---

## CORS Configuration

### Desarrollo

Por defecto permitido: `http://localhost:5173`

```python
# backend/main.py (development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Producción

Modificar `CORS_ORIGINS` en `.env` o en código:

```python
# backend/main.py (production)
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "https://prunape.hospital.ar"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)
```

**Múltiples dominios:**

```
CORS_ORIGINS=https://prunape.hospital.ar,https://prunape-staging.hospital.ar,https://prunape-mobile.hospital.ar
```

---

## Troubleshooting

### Problema: Backend no inicia

**Error: "Address already in use"**

```bash
# Puerto 8000 ya está en uso
# Encontrar proceso
lsof -i :8000
# Matar proceso
kill -9 <PID>
# O usar puerto diferente
uvicorn main:app --port 8001
```

**Error: "ModuleNotFoundError"**

```bash
# Falta instalar dependencias
cd backend
pip install -e ".[dev]"
```

**Error: "Database is locked"**

```bash
# SQLite bloqueada (otro proceso escribiendo)
# Opción 1: Esperar
sleep 10 && uvicorn main:app --reload

# Opción 2: Borrar lock (cuidado)
rm prunape.db-journal

# Opción 3: Usar WAL mode (mejor para concurrencia)
# En database.py
engine = create_engine(
    DATABASE_URL,
    connect_args={"timeout": 30},
)
# Luego ejecutar
sqlite3 prunape.db "PRAGMA journal_mode=WAL;"
```

### Problema: Frontend no conecta con backend

**Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**

1. Verificar que backend está corriendo: `curl http://localhost:8000/docs`
2. Verificar `CORS_ORIGINS` en backend
3. Verificar `VITE_API_URL` en frontend

```bash
# Frontend - verificar variable
echo $VITE_API_URL
# Debe ser solo el host, sin path (ej: http://localhost:8000). El cliente agrega /api.

# Forzar recompilar
rm -rf frontend/dist frontend/node_modules/.vite
npm run build
```

**Error: "Failed to fetch"**

1. Backend no accesible
2. Firewall bloqueando puerto 8000
3. Proxy requiere autenticación

```bash
# Probar conectividad
curl -v http://localhost:8000/api/patients
# Debe retornar JSON
```

### Problema: Evaluación lenta

**Causa: Base de datos fragmentada**

```bash
# Optimizar SQLite
sqlite3 prunape.db "VACUUM;"
sqlite3 prunape.db "ANALYZE;"
```

**Causa: Muchos datos acumulados**

```sql
-- Eliminar evaluaciones antiguas (si políticas lo permiten)
DELETE FROM assessment
WHERE created_at < date('now', '-1 year');

-- Después vacuum
VACUUM;
```

### Problema: Evaluación falla sin mensaje

Revisar logs del backend:

```bash
# Logs
tail -f /var/log/prunape/app.log

# O en stderr si está en foreground
# Buscar "ERROR" o "Exception"
```

**Errores comunes:**

```
ERROR: Invalid date format
→ Verificar formato de fecha en JSON

ERROR: Pauta not found
→ ID de hito incorrecto

ERROR: Patient not found
→ ID de paciente incorrecto
```

### Problema: Base de datos crece demasiado

SQLite no libera espacio automáticamente.

```bash
# Ver tamaño
ls -lh prunape.db

# Limpiar y optimizar
sqlite3 prunape.db "VACUUM;"

# Reducir journal
sqlite3 prunape.db "PRAGMA journal_mode=DELETE;"
```

---

## Monitoreo

### Métricas Importantes

```bash
# Tamaño de base de datos
ls -lh prunape.db

# Número de registros
sqlite3 prunape.db "SELECT 'Patients: ' || COUNT(*) FROM patient;"
sqlite3 prunape.db "SELECT 'Assessments: ' || COUNT(*) FROM assessment;"

# Evaluaciones en últimas 24 horas
sqlite3 prunape.db "SELECT COUNT(*) FROM assessment WHERE created_at > datetime('now', '-1 day');"

# Health check simple
curl -s http://localhost:8000/api/pautas | jq 'length'
# Debe retornar 79 (número de hitos)
```

### Logs

**Backend:**

```bash
# Log level en stderr
LOG_LEVEL=DEBUG uvicorn main:app

# Guardar logs en archivo
uvicorn main:app > logs/prunape.log 2>&1 &
```

**Frontend:**

```bash
# Check browser console
# F12 → Console tab
# Buscar errores de red y JavaScript
```

### Uptime Monitoring

```bash
# Script de healthcheck
#!/bin/bash
curl -f http://localhost:8000/api/pautas > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "OK"
else
    echo "FAIL - Backend no responde"
    systemctl restart prunape
fi
```

Configurar cron:
```bash
# Verificar cada 5 minutos
*/5 * * * * /usr/local/bin/healthcheck_prunape.sh
```

---

## Deployment

### Deployment en Linux (Systemd)

**1. Crear usuario de sistema:**

```bash
sudo useradd -r -s /bin/bash prunape
sudo usermod -d /opt/prunape prunape
```

**2. Preparar aplicación:**

```bash
sudo mkdir -p /opt/prunape /data/prunape
sudo git clone <repo> /opt/prunape
cd /opt/prunape
sudo chown -R prunape:prunape .
```

**3. Instalar dependencias:**

```bash
sudo -u prunape python3 -m venv venv
sudo -u prunape ./venv/bin/pip install -e ".[prod]"
cd frontend
sudo -u prunape npm install
sudo -u prunape npm run build
```

**4. Systemd service (Backend):**

```ini
# /etc/systemd/system/prunape-backend.service
[Unit]
Description=PRUNAPE FastAPI Backend
After=network.target

[Service]
Type=notify
User=prunape
WorkingDirectory=/opt/prunape/backend
Environment="DATABASE_URL=sqlite:////data/prunape/prunape.db"
Environment="LOG_LEVEL=INFO"
Environment="ENVIRONMENT=production"
ExecStart=/opt/prunape/venv/bin/python -m uvicorn main:app \
    --host 0.0.0.0 --port 8000 --workers 4

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable prunape-backend
sudo systemctl start prunape-backend
```

**5. Systemd service (Frontend - nginx):**

```bash
# /etc/nginx/sites-available/prunape
server {
    listen 80;
    server_name prunape.hospital.ar;

    location / {
        root /opt/prunape/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/prunape /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Deployment con Docker

**Dockerfile (Backend):**

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY backend /app/backend
WORKDIR /app/backend

RUN pip install -e ".[prod]"

ENV DATABASE_URL=sqlite:////data/prunape/prunape.db
ENV LOG_LEVEL=INFO

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Dockerfile (Frontend):**

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY frontend /app
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - prunape_data:/data/prunape
    environment:
      DATABASE_URL: sqlite:////data/prunape/prunape.db
    restart: always

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  prunape_data:
```

**Deploy:**

```bash
docker-compose up -d
docker-compose logs -f
```

### SSL/TLS (HTTPS)

**Con Let's Encrypt + Certbot:**

```bash
sudo certbot certonly --webroot -w /opt/prunape/frontend/dist \
    -d prunape.hospital.ar

# Actualizar nginx
sudo certbot install --nginx -d prunape.hospital.ar

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Updates y Maintenance

### Actualizar Aplicación

```bash
# Detener servicios
systemctl stop prunape-backend
systemctl stop prunape-frontend

# Actualizar código
cd /opt/prunape
git pull origin main

# Backend
cd backend
venv/bin/pip install -e ".[prod]"

# Frontend
cd ../frontend
npm install
npm run build

# Iniciar
systemctl start prunape-backend
systemctl start prunape-frontend

# Verificar
curl http://localhost:8000/api/patients
```

### Actualizar Hitos (Pautas)

Si Hospital Garrahan actualiza los 79 hitos:

1. **Actualizar `backend/percentiles.py`**
   - Modificar lista de hitos y percentiles

2. **Recrear base de datos (si fue schema change):**
   ```bash
   rm prunape.db
   systemctl restart prunape-backend
   ```

3. **O migración (si hay datos existentes):**
   - Crear alembic migration
   - Script custom de actualización

### Rotación de Logs

```bash
# /etc/logrotate.d/prunape
/var/log/prunape/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 prunape prunape
    sharedscripts
    postrotate
        systemctl reload prunape-backend > /dev/null 2>&1 || true
    endscript
}
```

---

## Performance Tuning

### SQLite Optimizations

```python
# backend/database.py
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "timeout": 30,
        "check_same_thread": False,
    },
    echo=False,  # Deshabilitar SQL logging
    pool_pre_ping=True,
)

# Ejecutar una sola vez
with engine.begin() as conn:
    conn.exec_driver_sql("PRAGMA journal_mode=WAL")
    conn.exec_driver_sql("PRAGMA synchronous=NORMAL")
    conn.exec_driver_sql("PRAGMA cache_size=10000")
    conn.exec_driver_sql("PRAGMA temp_store=MEMORY")
```

### API Response Caching

Ejemplo: Cachear lista de hitos (79 items, nunca cambian):

```python
# backend/main.py
from functools import lru_cache

@lru_cache(maxsize=1)
def get_pautas_cached():
    return PautasRepository.get_all()

@app.get("/api/pautas")
def list_pautas():
    return get_pautas_cached()
```

### Frontend Bundle Size

```bash
# Analizar
npm run build -- --analyze

# Optimizaciones en vite.config.ts
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
}
```

---

## Security Checklist

- [ ] CORS configurado solo para dominios permitidos
- [ ] Base de datos con permisos restrictivos (600: solo usuario prunape)
- [ ] Logs no contienen información sensible (nombres de pacientes)
- [ ] HTTPS habilitado en producción
- [ ] Validación de entrada en todos los endpoints
- [ ] No hay API keys o secrets en código (usar variables de entorno)
- [ ] SQLite no es accesible públicamente (firewall)
- [ ] Backups encriptados
- [ ] Política de retención de datos acorde a leyes locales

---

## Disaster Recovery

### Escenario: Servidor se cae

```bash
# 1. Verificar
systemctl status prunape-backend
systemctl status prunape-frontend

# 2. Reiniciar
systemctl restart prunape-backend
systemctl restart prunape-frontend

# 3. Verificar logs
journalctl -u prunape-backend -n 50
```

### Escenario: Datos corruptos

```bash
# 1. Mantener último backup limpio
ls -la /backups/prunape/

# 2. Restaurar
systemctl stop prunape-backend
cp /backups/prunape/prunape.db.20260314_020000 prunape.db
systemctl start prunape-backend
```

### Escenario: Pérdida total

1. Restore from offsite backup
2. Validar integridad de datos
3. Verificar que evaluaciones sean reproducibles
4. Informar a Hospital Garrahan si fue acceso externo

---

## Contacto y Escalations

| Problema | Contacto | Tiempo |
|----------|----------|--------|
| App no responde | IT Local | Inmediato |
| Datos corrompidos | IT + Backup team | 2 horas |
| Cambios en PRUNAPE | Hospital Garrahan | Según release |
| Seguridad | Cybersecurity team | Inmediato |

---

**Versión:** 1.0
**Última actualización:** Marzo 2026
**Próxima revisión:** Septiembre 2026
