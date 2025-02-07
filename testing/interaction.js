const { simpleflake } = require("simpleflakes")
const { PermissionFlagsBits, Collection } = require("discord.js")
const { User } = require("./user")

class Interaction {
  constructor(guildId = null, member_flake = null) {
    const { Message } = require("./message")

    let member_snowflake = member_flake ?? simpleflake()

    this.id = simpleflake()
    this.command_options = {}
    this.partial_text = "partial"
    this.focused_option = "test"
    this.locale = "en-US"
    this.options = {
      data: [],
      getString: (key) => this.command_options[key]?.toString(),
      getBoolean: (key) => !!this.command_options[key],
      getChannel: (key) => this.command_options[key],
      getInteger: (key) => this.command_options[key],
      getUser: (key) => this.command_options[key],
      getAttachment: (key) => this.command_options[key],
      getFocused: (be_obj = false) => {
        if (be_obj) {
          return {
            name: this.focused_option,
            value: this.partial_text,
          }
        }

        return this.partial_text
      },
      getSubcommand: () => this.command_options.subcommand_name,
    }
    this.guildId = guildId ?? simpleflake()
    this.guild = {
      id: this.guildId,
      members: [],
      name: "test guild",
    }
    this.guild.members.fetch = (user) => user
    this.channel = {
      id: simpleflake(),
      isThread: () => false,
      guildId: this.guildId,
      parentId: simpleflake(),
      messages: {},
    }
    this.message = new Message({
      guildId: this.guildId,
      channelId: this.channel.id,
    })
    this.user = new User(member_snowflake)
    this.member = {
      id: member_snowflake,
      permissions: PermissionFlagsBits.Defaults,
      user: this.user,
    }
    this.client = {
      commands: new Collection(),
      followups: new Collection(),
    }

    this.interactionType = "command"
    this.customId = ""
    this.replied = false
    this.deferred = false

    // custom field to track responses
    this.message.replies = []
  }

  get replies() {
    return this.message.replies
  }

  normalizeMessage(msg) {
    switch (typeof msg) {
      case "string":
        return { content: msg, guildId: this.guildId }
      case "object":
        return { guildId: this.guildId, ...msg }
      default:
        return Promise.reject(`msg is in invalid format "${typeof msg}"`)
    }
  }

  get replyContent() {
    return this.message.replies.map((r) => r.content).join("\n-----\n")
  }

  async reply(msg) {
    if (this.deferred) return Promise.reject("cannot reply: interaction is in deferred state")
    if (this.replied) return Promise.reject("cannot reply: interaction is already in replied state")
    const message_opts = this.normalizeMessage(msg)
    this.replied = true
    this.message.addReply(message_opts)
    return this.message
  }

  async editReply(msg) {
    if (!this.replied) return Promise.reject("cannot editReply: interaction has no reply to edit")
    const message_opts = this.normalizeMessage(msg)
    this.message.addReply(message_opts)
    return this.message
  }

  async deferReply() {
    if (this.replied) return Promise.reject("cannot defer: interaction is already in replied state")
    if (this.deferred)
      return Promise.reject("cannot defer: interaction is already in deferred state")
    this.replied = true
    this.deferred = true
    return
  }

  async deferUpdate() {
    if (this.replied) return Promise.reject("cannot defer: interaction is already in replied state")
    if (this.deferred)
      return Promise.reject("cannot defer: interaction is already in deferred state")
    this.deferred = true
    return
  }

  async update(msg) {
    if (this.deferred) return Promise.reject("cannot update: interaction has been deferred")
    if (this.deferred || this.replied) return Promise.reject("cannot update: interaction has already been replied")
    const message_opts = this.normalizeMessage(msg)
    this.message.addReply(message_opts)
    this.replied = true
    return this.message
  }

  async followUp(msg) {
    if (!this.deferred && !this.replied) return Promise.reject("cannot followUp: interaction has no reply")
    const message_opts = this.normalizeMessage(msg)
    this.message.addReply(message_opts)
    return this.message
  }

  async showModal(modal) {
    if (this.replied || this.deferred)
      return Promise.reject("cannot showModal: must be the first response")
    return modal
  }

  async respond(data) {
    return data
  }

  isCommand() {
    return this.interactionType == "command"
  }

  isChatInputCommand() {
    return this.interactionType == "chatInputCommand"
  }

  isAutocomplete() {
    return this.interactionType == "autocomplete"
  }
}

require("../patches/whisper").patch(Interaction)
require("../patches/paginate").patch(Interaction)
require("../patches/roll-reply").patch(Interaction)

module.exports = {
  Interaction,
}
