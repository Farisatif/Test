---
name: Clerk web/server entry points
description: The managed Clerk setup's browser and Express integrations expose host key resolution through different package entry points.
---

Use the canonical Replit-managed Clerk imports: the browser uses `publishableKeyFromHost` from `@clerk/react/internal`, while Express uses the helper from `@clerk/shared/keys`.

**Why:** The packages are intentionally split between the browser SDK and server dependency graph; importing the server entry point in the web artifact can fail module resolution even when the server builds.

**How to apply:** When wiring Clerk in a React/Vite + Express workspace, keep the client and server imports separate and follow the setup reference's provider/proxy wiring exactly.