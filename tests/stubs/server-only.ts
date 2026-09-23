// Test stub for the `server-only` marker package.
//
// In the Next.js build, importing `server-only` from a Client Component fails
// at build time, which prevents leaking server code to the browser. That guard
// is irrelevant under Vitest (Node environment), so we alias the package to an
// empty module for tests.
export {};
