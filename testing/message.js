const { simpleflake } = require("simpleflakes")

class Message {
  constructor(content = "") {
    this.id = simpleflake()
    this.guildId = simpleflake()
    this.channelId = simpleflake()
    this.content = content
  }
}

module.exports = {
  Message
}
