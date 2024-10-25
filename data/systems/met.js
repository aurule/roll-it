const { inlineCode } = require("discord.js")

module.exports = {
  name: "met",
  title: "MET Revised",
  description: "Rock-paper-scissors for classic WoD LARP",
  notes: `Rock-paper-scissors with proper support for ${inlineCode("bomb")} and interactive opposed tests.`,
  commands: {
    required: ["met"],
    recommended: ["d10"],
  },
}
