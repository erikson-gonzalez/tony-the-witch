# Admin Backend - Arquitectura y API

## Resumen

Backend preparado para el panel `/admin`, con API REST autenticada, schema en PostgreSQL (Drizzle), y contrato de tipos compartido.

## Estructura

```
shared/
  schema.ts          # Tablas: site_config, nav_cards, gallery_works, products, admin_users
  defaults.ts        # Valores por defecto cuando la DB está vacía
  admin-routes.ts    # Contratos API (Zod schemas, paths, tipos)

server/
  auth.ts            # Passport Local, session (connect-pg-simple), requireAdmin middleware
  storage-admin.ts   # Capa de datos (CRUD para config, nav cards, gallery, products)
  routes-admin.ts    # Registro de rutas: público, auth, admin protegido
  routes.ts          # Orquesta: content, auth, admin, inquiries

script/
  seed-admin.ts      # Crear primer admin + config inicial
```

## Flujo de datos

1. **Frontend público** → `GET /api/content` → config + navCards + galleryWorks + products  
2. **Admin login** → `POST /api/admin/auth/login` → session  
3. **Admin CRUD** → `GET/PUT /api/admin/config`, `* /api/admin/nav-cards`, etc. → requieren session

## API

### Público (sin auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/content` | Config, nav cards, gallery, products |

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/auth/login` | Body: `{ username, password }` |
| POST | `/api/admin/auth/logout` | Cierra sesión |
| GET | `/api/admin/auth/me` | Usuario actual (401 si no autenticado) |

### Admin protegido (requiere login)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/config` | Obtener site config |
| PUT | `/api/admin/config` | Actualizar site config (partial) |
| GET | `/api/admin/nav-cards` | Listar nav cards |
| POST | `/api/admin/nav-cards` | Crear nav card |
| PUT | `/api/admin/nav-cards/:id` | Actualizar nav card |
| DELETE | `/api/admin/nav-cards/:id` | Eliminar nav card |
| GET | `/api/admin/gallery` | Listar obras |
| POST | `/api/admin/gallery` | Crear obra |
| PUT | `/api/admin/gallery/:id` | Actualizar obra |
| DELETE | `/api/admin/gallery/:id` | Eliminar obra |
| GET | `/api/admin/products` | Listar productos |
| POST | `/api/admin/products` | Crear producto |
| PUT | `/api/admin/products/:id` | Actualizar producto |
| DELETE | `/api/admin/products/:id` | Eliminar producto |

## Setup inicial

```bash
# 1. Crear tablas
npm run db:push

# 2. Crear primer admin (username/password por env o prompt)
ADMIN_USERNAME=admin ADMIN_PASSWORD=secret npm run db:seed-admin
# O interactivo:
npm run db:seed-admin
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL |
| `SESSION_SECRET` | Secret para sessions (cambiar en producción) |
| `ADMIN_USERNAME` | Usuario para seed (opcional) |
| `ADMIN_PASSWORD` | Contraseña para seed (opcional) |

## Próximos pasos

1. **Frontend /admin**: Páginas de login y CRUD usando estas rutas.
2. **Migrar frontend**: Reemplazar imports de `constants/` y `lib/products` por `GET /api/content`.
3. **Subida de archivos**: Para imágenes/videos propios, añadir endpoint de upload (S3, local, etc.).
