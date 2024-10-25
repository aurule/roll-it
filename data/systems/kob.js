const { oneLine } = require("common-tags")

module.exports = {
  name: "kob",
  title: "Kids On Bikes",
  description: "Exploding polyhedrals",
  notes: oneLine`
    Handles exploding the highest result on a die. However, it does not stop after the test is passed, since
    it doesn't know the difficulty.
  `,
  commands: {
    required: ["kob"],
    recommended: ["roll-formula"],
  },
}
