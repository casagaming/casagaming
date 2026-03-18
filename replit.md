# Casa Gaming

A React + Vite e-commerce storefront for gaming products ("Casa Gaming").

## Stack
- **Frontend**: React 19, TypeScript, Vite 6, TailwindCSS 4
- **Routing**: React Router DOM 7
- **3D**: React Three Fiber + Drei + Three.js
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Database/Auth**: Supabase (hardcoded connection in `src/lib/supabase.ts`)
- **AI**: Google Gemini (`@google/genai`) — requires `GEMINI_API_KEY` env var

## Project Structure
- `src/App.tsx` — main app with routing
- `src/pages/` — page components (Home, Catalog, Products, Categories, Product, Cart, Checkout, OrderReceived)
- `src/components/` — shared UI components (Navbar, Footer, Hero, ProductCard, etc.)
- `src/context/` — React context providers (Cart, Toast, Config, Theme)
- `src/lib/supabase.ts` — Supabase client (hardcoded URL and anon key)
- `src/data.ts` — static product/category data

## Configuration
- Dev server runs on port 5000 via `vite.config.ts`
- `allowedHosts: true` set in Vite config for Replit proxy compatibility
- Deployment configured as static site (build: `npm run build`, publicDir: `dist`)

## Environment Variables
- `GEMINI_API_KEY` — Google Gemini API key (optional, for AI features)
