# Guía de Deploy — PRUNAPE

## Arquitectura en producción

- **Backend**: Fly.io (Python + FastAPI)
- **Frontend**: Cloudflare Pages (React + Vite)
- **Base de datos**: Neon Postgres (free tier 0.5GB)
- **Auth**: Clerk (free hasta 10k MAU)
- **Costo total objetivo**: $0/mes

## Prerrequisitos

- Cuenta en GitHub (para CI/CD)
- Cuenta en Fly.io: https://fly.io
- Cuenta en Neon: https://neon.tech
- Cuenta en Clerk: https://clerk.com
- Cuenta en Cloudflare: https://cloudflare.com
- `flyctl` instalado: `brew install flyctl` (Mac) o https://fly.io/docs/hands-on/install-flyctl/

## 1. Base de datos — Neon Postgres

1. Crear cuenta en https://neon.tech
2. Crear proyecto "prunape"
3. En el dashboard de Neon, ir a **Connection Details**
4. Copiar el connection string en formato psycopg:
   ```
   postgresql+psycopg://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Guardar como `DATABASE_URL` para usarlo en el paso de Fly.io

## 2. Auth — Clerk

1. Crear cuenta en https://clerk.com
2. Crear aplicación "PRUNAPE"
3. En **API Keys**, copiar:
   - `NEXT_PUBLIC_PUBLISHABLE_KEY` → será `VITE_CLERK_PUBLISHABLE_KEY` en el frontend
   - `SECRET_KEY` (no se usa directamente, pero guardarlo)
4. En **JWT Templates** → verificar que existe un template default
5. En **Domains**, copiar el issuer URL:
   - Formato: `https://xxx.clerk.accounts.dev`
   - Este será `CLERK_JWT_ISSUER` y la JWKS URL será `https://xxx.clerk.accounts.dev/.well-known/jwks.json`

## 3. Backend — Fly.io

### Primera vez
```bash
# Login
fly auth login

# Crear app (desde la raíz del repositorio)
fly launch --no-deploy --name prunape --region gru

# Configurar secrets
fly secrets set \
  DATABASE_URL="postgresql+psycopg://user:pass@host/db?sslmode=require" \
  CLERK_JWT_ISSUER="https://xxx.clerk.accounts.dev" \
  CLERK_JWKS_URL="https://xxx.clerk.accounts.dev/.well-known/jwks.json" \
  CORS_ORIGINS='["https://prunape.pages.dev"]'

# Correr migrations en Neon (desde local apuntando a Neon)
DATABASE_URL="postgresql+psycopg://..." alembic upgrade head

# Deploy
fly deploy
```

### Verificar deploy
```bash
curl https://prunape.fly.dev/healthz
# Debe devolver: {"status":"ok","env":"prod"}
```

### Deploys siguientes
Los deploys automáticos se configuran en GitHub Actions (ver sección CI/CD).
Para deploy manual: `fly deploy`

## 4. Frontend — Cloudflare Pages

1. En Cloudflare Dashboard → **Pages** → **Create a project**
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. Variables de entorno (en **Settings → Environment Variables**):
   ```
   VITE_API_URL=https://prunape.fly.dev
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
   ```
5. Click **Save and Deploy**

El archivo `frontend/public/_redirects` ya está configurado para el SPA fallback.

## 5. CI/CD — GitHub Actions

Los workflows ya están en `.github/workflows/`:

- `ci.yml`: corre tests (backend + frontend) en cada push/PR a `develop` y `main`
- `deploy-backend.yml`: despliega a Fly.io automáticamente en merge a `main`

Para habilitar el deploy automático:
```
Settings → Secrets and variables → Actions → New repository secret
Nombre: FLY_API_TOKEN
Valor: (obtener con `fly tokens create deploy -x 999999h`)
```

El frontend se despliega automáticamente vía Cloudflare Pages (ya configurado en el paso 4).

## Variables de entorno — referencia completa

Ver `.env.example` en la raíz del proyecto para la lista completa.

### Backend (Fly.io secrets)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres Neon | `postgresql+psycopg://...` |
| `CLERK_JWT_ISSUER` | URL base de Clerk | `https://xxx.clerk.accounts.dev` |
| `CLERK_JWKS_URL` | JWKS endpoint de Clerk | `https://xxx.clerk.accounts.dev/.well-known/jwks.json` |
| `CORS_ORIGINS` | Orígenes permitidos | `["https://prunape.pages.dev"]` |
| `ENV` | Entorno | `prod` |

### Frontend (Cloudflare Pages)
| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend | `https://prunape.fly.dev` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_live_xxx` |

## Desarrollo local con Docker

Ver [docker-compose.yml](../docker-compose.yml) en la raíz.

```bash
# Levantar todos los servicios
docker compose up

# Solo backend + DB (si corrés el frontend local)
docker compose up db backend

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Parar
docker compose down

# Borrar volúmenes (reset de DB)
docker compose down -v
```

La app estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Docs API (Swagger): http://localhost:8000/docs

## Troubleshooting

### Backend no levanta en Fly.io
```bash
fly logs -a prunape
fly status -a prunape
```

### Migrations fallaron
```bash
# Correr desde local apuntando a Neon
DATABASE_URL="postgresql+psycopg://..." alembic upgrade head
# Verificar estado
DATABASE_URL="postgresql+psycopg://..." alembic current
```

### Frontend blanco (blank screen)
- Verificar que `VITE_API_URL` apunta al backend correcto
- Verificar en Cloudflare Pages que el `_redirects` está en `dist/`
- Revisar Console en DevTools por errores de red

### Cold start lento (primer request)
Fly.io con `min_machines_running = 0` hace scale-to-zero. El primer request tarda ~3-5s.
Para evitarlo: `fly scale count 1` (costo ~$2/mes).
