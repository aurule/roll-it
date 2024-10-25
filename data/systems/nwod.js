const { oneLine } = require("common-tags")

module.exports = {
  name: "nwod",
  title: "New World / Chronicles of Darkness",
  description: "Suitable for 1e and 2e",
  notes: oneLine`
    Works for both first and second edition of Chronicles of Darkness. Rolls and tallies with correct
    exploding dice. Handles chance rolls, the rote benefit, and has an interactive teamwork mode.
  `,
  commands: {
    required: ["nwod"],
    recommended: ["d10"],
  },
}
