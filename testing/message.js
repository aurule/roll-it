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
  componentEvents = new ComponentEventEmitter()
  editEvents = new EventEmitter()
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
    this.editEvents.emit("edited", opts)
  }

  async untilEdited() {
    return new Promise((resolve, reject) => {
      this.editEvents.once("edited", (opts) => {
        resolve(opts)
      })
    })
  }

  get isEphemeral() {
    return (this.flags & MessageFlags.Ephemeral) === MessageFlags.Ephemeral
  }

  async react(emoji) {
    this.reactions.push(emoji)
  }

  async delete() {
    return
  }

  hasComponent(search_id) {
    return this.components.some((row) => {
      return row.components.some((component) => {
        return component.data.custom_id === search_id
      })
    })
  }

  getComponent(search_id) {
    for (const row of this.components) {
      for (const component of row.components) {
        if (component.data.custom_id === search_id) return component
      }
    }
  }

  async awaitMessageComponent({ componentType, time } = {}) {
    return new Promise((resolve, reject) => {
      this.componentEvents.once("collect", (comp_interaction) => {
        resolve(comp_interaction)
      })
    })
  }

  createMessageComponentCollector({ time }) {
    return this.componentEvents
  }

  async click(customId, user) {
    if (!this.hasComponent(customId)) throw new Error(`no such component "${customId}"`)
    const member_flake = user?.id ?? this.userId
    const comp_interaction = new ComponentInteraction({ message: this, customId, member_flake, guildId: this.guildId })
    this.componentEvents.emit("collect", comp_interaction)
    return comp_interaction
  }

  select(customId, values, user) {
    if (!this.hasComponent(customId)) throw new Error(`no such component "${customId}"`)
    const member_flake = user?.id ?? this.userId
    const comp_interaction = new ComponentInteraction({ message: this, customId, values, member_flake, guildId: this.guildId })
    this.componentEvents.emit("collect", comp_interaction)
    return comp_interaction
  }
}

class ComponentEventEmitter extends EventEmitter {
  timeout() {
    this.emit("end", undefined, "time")
  }

  stop() {
    this.emit("end", undefined, "user")
  }
}

module.exports = {
  Message,
}
