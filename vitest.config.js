import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    isolate: true,
    dir: "src/",
    setupFiles: ["testing/setup-matchers.js"],
    coverage: {
      include: [
        "/src/",
      ],
      exclude: [
        "/services/api.js",
      ],
    },
    fakeTimers: {
      enableGlobally: true,
      advanceTimers: true,
    },
  },
})
