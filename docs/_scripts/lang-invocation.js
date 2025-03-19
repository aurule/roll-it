Prism.languages["invocation"] = {
  value: {
    pattern: /(\w+:)([\w+-/^*"@?]+\s*)+(\s|$)/,
    lookbehind: true,
  },
}
