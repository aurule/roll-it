const { simpleflake } = require("simpleflakes")
const { userMention } = require("discord.js")

class User {
  constructor(snowflake) {
    this.flake = snowflake ?? simpleflake()

    this.id = this.flake.toString()
    this.bot = false
    this.username = "Test User"
  }

  toString() {
    return userMention(this.id)
  }
}

module.exports = {
  User,
}
