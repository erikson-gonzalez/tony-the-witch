# Tony The Witch — Project Context

## What is this?
Full-stack tattoo artist portfolio + e-commerce shop. Built for a tattoo artist to showcase work, sell merch, and manage content via an admin dashboard.

## Tech Stack
- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Express.js (Node 20+)
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS v3 + shadcn/ui + Radix UI
- **Routing:** Wouter (client), Express (server)
- **State:** React Context + TanStack React Query
- **Forms:** React Hook Form + Zod
- **Auth:** Passport.js (local strategy) + express-session (PostgreSQL store)
- **i18n:** i18next (ES/EN)
- **Deployment:** Vercel

## Project Structure
```
client/src/
  pages/          # Public pages (Home, Portfolio, Shop, ProductDetail, Cart)
  admin/
    pages/        # Admin pages (Dashboard, Config, NavCards, Gallery, Products)
    components/   # Admin UI components
    hooks/        # Admin-specific hooks
    context/      # AdminAuthProvider
  components/
    ui/           # Radix + shadcn components
    home/         # Home page components
    gallery/      # Gallery components
    cart/         # Cart components
  hooks/          # Shared React hooks
  lib/            # queryClient, cart context, utilities
  api/            # API client/hooks
  i18n/locales/   # Translation files (es/, en/)
  App.tsx         # Main router

server/
  index.ts        # Express entry point (port 5000)
  routes.ts       # Public API routes
  routes-admin.ts # Admin CRUD routes
  auth.ts         # Passport.js + session middleware
  db.ts           # PostgreSQL connection pool
  storage.ts      # Public data access layer
  storage-admin.ts # Admin data access layer

shared/
  schema.ts       # Drizzle table definitions + Zod schemas
  routes.ts       # Public API route definitions
  admin-routes.ts # Admin API route definitions (typed)
  defaults.ts     # Default seed data
```

## Database Tables
- **inquiries** — contact form submissions
- **site_config** — single-row JSONB (hero, artist, footer, booking, etc.)
- **nav_cards** — homepage navigation cards
- **gallery_works** — tattoo portfolio images (category, height, sortOrder)
- **products** — e-commerce products (slug, price, sizes, colors, stock as JSONB, images)
- **admin_users** — authentication (username, passwordHash)

## API Endpoints
- `GET /api/content` — all public content
- `POST /api/inquiries` — contact form
- `POST /api/admin/auth/login|logout` — auth
- `GET /api/admin/auth/me` — session check
- Admin CRUD: `GET|POST|PUT|DELETE /api/admin/{config,nav-cards,gallery,products}`

## Key Patterns & Conventions
- **Type-safe APIs:** Zod schemas in `shared/` validate both client & server
- **Path aliases:** `@/*` → `client/src/`, `@shared/*` → `shared/`
- **Component style:** Functional components, hooks, Tailwind classes
- **Data fetching:** TanStack React Query with optimistic updates
- **Cart:** Client-side context backed by localStorage
- **Admin protection:** `requireAdmin` middleware + `AdminRouteGuard` component
- **ES Modules:** `"type": "module"` in package.json

## Scripts
- `npm run dev` — dev server with HMR
- `npm run build` — production build (Vite + esbuild)
- `npm start` — production server
- `npm run db:push` — apply Drizzle migrations
- `npm run check` — TypeScript type checking

## Agent Workflow
This project uses a 3-agent pipeline for task execution:
1. **Ticket Elaborator** — expands short task descriptions into detailed specs
2. **Developer** — implements the spec in an isolated worktree
3. **Code Reviewer** — reviews changes and provides feedback

Task specs are written to `tasks/` directory. The user has final approval on all changes.
