const { simpleflake } = require("simpleflakes")
const { EventEmitter } = require("node:events")
const { MessageFlags } = require("discord.js")

const { ComponentInteraction } = require("./component-interaction")

class Message {
  id
  guildId
  channelId
  userId
  content
  reactions = []
  components
  embeds
  flags
  componentEmitter = new ComponentEventEmitter()
  replies = []

  constructor({
    content = "",
    components = [],
    embeds = [],
    guildId,
    channelId,
    userId,
    flags = 0,
  } = {}) {
    this.id = simpleflake()
    this.guildId = guildId ?? simpleflake()
    this.channelId = channelId ?? simpleflake()
    this.userId = userId ?? simpleflake()

    this.content = content
    this.components = components
    this.embeds = embeds
    this.flags = flags
  }

  addReply(opts) {
    this.replies.push(opts)
    Object.assign(this, opts)
  }

  get isEphemeral() {
    return (this.flags & MessageFlags.Ephemeral) === MessageFlags.Ephemeral
  }

  async react(emoji) {
    this.reactions.push(emoji)
  }

  async awaitMessageComponent({ componentType, time } = {}) {
    return new ComponentInteraction({ customId: "" })
  }

  async delete() {
    return
  }

  createMessageComponentCollector({ time }) {
    return this.componentEmitter
  }

  click(customId, user) {
    // test that customId exists in this.components
    const member_flake = user.id ?? this.userId
    const comp_interaction = new ComponentInteraction({ message: this, customId, member_flake, guildId: this.guildId })
    this.componentEmitter.emit(comp_interaction)
  }

  select(customId, values, user) {
    // test that customId exists in this.components
    const member_flake = user.id ?? this.userId
    const comp_interaction = new ComponentInteraction({ message: this, customId, values, member_flake, guildId: this.guildId })
    this.componentEmitter.emit(comp_interaction)
  }
}

class ComponentEventEmitter extends EventEmitter {
  timeout() {
    this.emit("end", undefined, "time")
  }
}

module.exports = {
  Message,
}
