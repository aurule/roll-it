import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
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
