const { oneLine } = require("common-tags")

module.exports = {
  name: "nwod",
  title: "New World of Darkness / Chronicles of Darkness",
  notes: oneLine`
    Works for both first and second edition of Chronicles of Darkness. Rolls and tallies with correct
    exploding dice. Handles chance rolls, the rote benefit, and has an interactive teamwork mode.
  `,
  commands: {
    required: ["nwod"],
    recommended: ["d10"],
  },
}
