# Bazaar E-commerce Store

Bazaar is a colorful, responsive storefront for discovering lifestyle products, managing a cart, and placing orders.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `PORT` and `BASE_PATH` are provided by the managed artifact workflow.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React, Vite, Wouter, TanStack Query, Tailwind CSS
- API: Express 5 with OpenAPI-first generated clients
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/bazaar-ecommerce/src/App.tsx` — storefront shell, routes, cart state, checkout, and admin overview
- `artifacts/bazaar-ecommerce/src/index.css` — Bazaar color tokens, typography, responsive styles, and motion
- `artifacts/api-server/src/routes/catalog.ts` — catalog and category API data/filtering
- `artifacts/api-server/src/routes/orders.ts` — order creation endpoint
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-client-react/src/generated/` — generated React Query client
- `lib/api-zod/src/generated/` — generated server validation schemas

## Architecture decisions

- Product discovery, detail, cart, checkout, and admin screens share one responsive shell.
- Cart and favorites persist in browser storage so the shopping experience survives refreshes.
- The API contract is defined in OpenAPI and drives both client hooks and server validation.
- Product imagery uses remote editorial photography with graceful local color fallbacks if an image fails.

## Product

- Browse featured products and categories from the home page.
- Search, filter, sort, favorite, and open product details from the shop.
- Select size/color, add products to a persistent cart, update quantities, and remove items.
- Submit customer details at checkout and receive an order confirmation.
- View a live store pulse with product count, orders, revenue, and conversion metrics at `/admin`.

## User preferences

- Use the palette `#7EC151`, `#F7F4ED`, `#B2054C`, `#D10056`, `#FFB900`, `#007DCC` as the product's visual language.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- The frontend build expects workflow-provided `PORT` and `BASE_PATH`; use the managed web workflow for previews.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
