---
name: Orval and Zod compatibility
description: Compatibility note for generated validation schemas in this workspace.
---

The current API code generator can emit Zod 4-only helpers while the workspace catalog may still resolve Zod 3.

**Why:** A successful code generation step can still fail the shared TypeScript build when generated schemas call helpers unavailable in the installed major version.

**How to apply:** After changing the OpenAPI contract, run codegen and the library typecheck together; if generated syntax and the installed Zod major differ, align the dependency or generator configuration before adding route imports.