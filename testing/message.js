const { simpleflake } = require("simpleflakes")
const { EventEmitter } = require("node:events")
const { MessageFlags } = require("discord.js")

const { ComponentInteraction } = require("./component-interaction")
const { User } = require("./user")

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
  deleted = false
  resource
  interaction
  author
  mentions

  constructor({
    content = "",
    components = [],
    embeds = [],
    guildId,
    channelId,
    userId,
    flags = 0,
    interaction,
  } = {}) {
    const { Interaction } = require("./interaction")
    this.id = simpleflake()
    this.guildId = guildId ?? simpleflake()
    this.channelId = channelId ?? simpleflake()
    this.userId = userId ?? simpleflake()
    this.author = new User(this.userId)

    this.content = content
    this.components = components
    this.embeds = embeds
    this.flags = flags
    this.resource = {
      message: this,
    }
    this.mentions = {}
  }

  reply(opts) {
    return this.interaction.reply(opts)
  }

  addReply(opts) {
    this.replies.push(opts)
    Object.assign(this, opts)
    this.editEvents.emit("edited", opts)
  }

  async edit(opts) {
    Object.assign(this, opts)
    this.editEvents.emit("edited", opts)
    return this
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
    this.deleted = true
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
    const comp_interaction = new ComponentInteraction({
      message: this,
      customId,
      member_flake,
      guildId: this.guildId,
    })
    await this.componentEvents.emit("collect", comp_interaction)
    return comp_interaction
  }

  async select(customId, values, user) {
    if (!this.hasComponent(customId)) throw new Error(`no such component "${customId}"`)
    const member_flake = user?.id ?? this.userId
    const comp_interaction = new ComponentInteraction({
      message: this,
      customId,
      values,
      member_flake,
      guildId: this.guildId,
    })
    await this.componentEvents.emit("collect", comp_interaction)
    return comp_interaction
  }

  async timeout() {
    return this.componentEvents.timeout()
  }
}

class ComponentEventEmitter extends EventEmitter {
  /**
   * Call listeners for an event using special async handling
   *
   * Unlike the normal emit() behavior, this implementation wraps each listener in a promise and then awaits
   * each one sequentially. This allows tests to be written far simpler, and the obvious slowdown doesn't
   * matter during tests.
   */
  async emit(event_name, ...opts) {
    const promise_wrap = (callback) => new Promise((resolve) => resolve(callback(...opts)))
    const listeners = this.listeners(event_name)
    for (const listener of listeners.map((callback) => () => promise_wrap(callback))) {
      await listener()
    }
    return listeners.length > 0
  }

  timeout() {
    this.emit("end", undefined, "time")
  }

  stop() {
    this.emit("end", undefined, "user")
  }
}

require("../src/patches/whisper").patch(Message)

module.exports = {
  Message,
}
