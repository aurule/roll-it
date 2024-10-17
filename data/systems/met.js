const { inlineCode } = require("discord.js")

module.exports = {
  name: "met",
  title: "MET Revised",
  notes: `Rock-paper-scissors with proper support for ${inlineCode("bomb")} and interactive opposed tests.`,
  commands: {
    required: ["met"],
    recommended: ["d10"],
  },
}
