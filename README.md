# Tony The Witch

Portfolio website para el artista de tatuajes Tony The Witch (TTW). Aplicación full-stack con React, Express y PostgreSQL.

## Requisitos

- Node.js 20+
- PostgreSQL 16+
- npm

## Instalación

1. **Clona el repositorio** (si aún no lo has hecho)

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Crea un archivo `.env`** con tu conexión a PostgreSQL
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus credenciales.

   **Opción más rápida (sin instalar nada):** [Supabase](https://supabase.com) ofrece PostgreSQL gratis.
   - Crea una cuenta → New Project → copia la *Connection string* (modo URI)
   - Pégalo en tu `.env` como `DATABASE_URL=postgresql://...`

   **Opción local:** Si tienes PostgreSQL instalado:
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tonythewitch
   SESSION_SECRET=cualquier-texto-secreto
   ```

4. **Aplica el esquema de la base de datos**
   ```bash
   npm run db:push
   ```

5. **Arranca el servidor de desarrollo**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:5000`.

## Scripts

| Comando      | Descripción                    |
|-------------|--------------------------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build para producción        |
| `npm start` | Ejecuta la app en producción   |
| `npm run db:push` | Aplica el esquema a PostgreSQL |
| `npm run check` | Verifica tipos TypeScript   |
