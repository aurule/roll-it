const { ComponentEvent } = require("./component_event")
const { simpleflake } = require("simpleflakes")

class Message {
  constructor({
    content = "",
    ephemeral = false,
    components = [],
    embeds = [],
    guildId,
    channelId,
  } = {}) {
    this.id = simpleflake()
    this.guildId = guildId ?? simpleflake()
    this.channelId = channelId ?? simpleflake()

    this.content = content
    this.reactions = []
    this.ephemeral = ephemeral
    this.components = components
    this.embeds = embeds
  }

  async react(emoji) {
    this.reactions.push(emoji)
  }

  async awaitMessageComponent({ componentType, time } = {}) {
    return new ComponentEvent("")
  }

  async delete() {
    return
  }
}

module.exports = {
  Message,
}
