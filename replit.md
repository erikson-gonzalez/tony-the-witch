# replit.md

## Overview

This is a portfolio website for a tattoo artist called "Tony The Witch" (TTW). It's a dark-themed, parallax-heavy single-page-style site with a portfolio gallery and a contact/booking form. The site is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for storing inquiry submissions. The design emphasizes a gothic/occult aesthetic with pure black backgrounds, white text, and smooth scroll-based parallax animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with routes: `/` (Home), `/portfolio` (Portfolio), `/shop` (Shop), `/shop/:slug` (Product Detail), `/cart` (Cart). ScrollToTop component resets scroll on navigation.
- **Styling**: Tailwind CSS with CSS custom properties for theming. Strictly dark mode — black background (#000), white text. Sharp edges (border-radius: 0) for a raw/gothic feel
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, stored in `client/src/components/ui/`
- **Animations**: Framer Motion for parallax scroll effects using `useScroll` and `useTransform` hooks
- **Forms**: React Hook Form with Zod schema validation via `@hookform/resolvers`
- **Data Fetching**: TanStack React Query for server state management
- **Fonts**: Lora (display/headings) and DM Sans (body text), loaded via Google Fonts
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 running on Node.js with TypeScript (executed via `tsx`)
- **API Design**: Single REST endpoint `POST /api/inquiries` for contact form submissions. Route definitions and Zod schemas are shared between client and server via `shared/routes.ts`
- **Development**: Vite dev server runs as middleware inside Express during development (see `server/vite.ts`), providing HMR
- **Production**: Client is built to `dist/public/`, server is bundled with esbuild to `dist/index.cjs`, and Express serves the static files via `server/static.ts`
- **Build script**: Custom build in `script/build.ts` using both Vite (for client) and esbuild (for server), with selective dependency bundling for faster cold starts

### Shared Layer
- **Schema** (`shared/schema.ts`): Drizzle ORM table definitions and Zod insert schemas. The `inquiries` table stores contact form data (name, email, message, tattoo idea, placement, read status, timestamp)
- **Routes** (`shared/routes.ts`): Type-safe API contract definitions with Zod schemas for inputs and responses, shared between frontend and backend

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Driver**: `pg` (node-postgres) Pool connection
- **Connection**: Uses `DATABASE_URL` environment variable
- **Schema management**: `drizzle-kit push` for applying schema changes (no migration files needed during development)
- **Storage pattern**: `IStorage` interface in `server/storage.ts` with `DatabaseStorage` implementation, making the storage layer swappable

### Key Design Decisions
1. **Shared schemas between client and server**: Zod schemas defined once in `shared/` are used for both client-side form validation and server-side request validation, ensuring type safety across the stack
2. **No authentication**: This is a public portfolio site; the only write operation is the inquiry form submission
3. **Minimal API surface**: Only one endpoint exists. The site is primarily a static presentation layer with a single form submission feature
5. **Client-side shop**: Product data is static (in `client/src/lib/products.ts`), cart state managed via React Context + localStorage (`client/src/lib/cart.tsx`). No backend needed for shop
6. **Shared Footer**: Reusable `Footer` component (`client/src/components/Footer.tsx`) used across all pages
4. **Vite middleware in dev**: Instead of running separate dev servers, Vite runs as Express middleware, simplifying the development workflow

## External Dependencies

### Database
- **PostgreSQL**: Required. Connection string must be provided via `DATABASE_URL` environment variable. Used for storing inquiry form submissions

### Third-Party Services (referenced in code but not yet configured)
- **WhatsApp**: Contact links point to `wa.me/1234567890` (placeholder number)
- **Instagram**: Links to `instagram.com/tonythewitch` (placeholder handle)
- **Unsplash**: All images are sourced from Unsplash CDN URLs (placeholder images for portfolio and hero sections)

### Key NPM Dependencies
- `express` v5 — HTTP server
- `drizzle-orm` + `drizzle-zod` + `drizzle-kit` — Database ORM and schema tooling
- `pg` — PostgreSQL client
- `framer-motion` — Scroll-based parallax animations
- `@tanstack/react-query` — Server state management
- `react-hook-form` + `@hookform/resolvers` — Form handling with Zod validation
- `wouter` — Client-side routing
- `zod` — Schema validation (shared between client and server)
- `shadcn/ui` components (Radix UI primitives) — UI component library
- `connect-pg-simple` — Available for session storage if authentication is added later