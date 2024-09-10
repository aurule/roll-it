module.exports = {
  ignores: ["**/*.test.js", ".yarn/", "testing/**", "guides/**", "docs/**", ".pnp*"],
  rules: {
    "no-unused-vars": "error",
    "no-undef": "error",
  },
  languageOptions: {
    sourceType: "commonjs",
    globals: {
      module: "readonly",
      fetch: "readonly",
      __dirname: "readonly",
      __filename: "readonly",
      process: "readonly",
      console: "readonly",
    },
  },
}
