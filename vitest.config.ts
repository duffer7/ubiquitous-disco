import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

/**
 * Vitest configuration.
 *
 * Tests run in a Node environment and use the same `@/*` path alias as the app
 * so imports match production code. Coverage is collected from `src/lib` and
 * the server action files under `src/app` — the logic-dense parts — rather
 * than UI components.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/db.ts", "src/**/*.types.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      // `server-only` is a Next.js build-time guard with no runtime module to
      // load under Node. Alias it to an empty stub so server modules can be
      // imported in tests without resolving the missing package.
      "server-only": resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});

