const { oneLine } = require("common-tags")

module.exports = {
  name: "drh",
  title: "Don't Rest Your Head",
  notes: oneLine`
    Rolls all the pools and figures out what dominates the roll. Full support for Minor and Major uses of an
    exhaustion talent, as well as validation for Madness talents.
  `,
  commands: {
    required: ["drh"],
  },
}
