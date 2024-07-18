const { userMention } = require("discord.js")

module.exports = {
  injectMention(initial_string, userFlake) {
    return initial_string.replaceAll("{{userMention}}", userMention(userFlake))
  }
}
