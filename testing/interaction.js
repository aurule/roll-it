"use strict"

const { simpleflake } = require("simpleflakes")
const { PermissionFlagsBits, Collection } = require("discord.js")
const { User } = require("./user")
const { Message } = require("./message")

class Interaction {
  constructor(guildId = null, member_flake = null) {
    let member_snowflake = member_flake ?? simpleflake()

    this.id = simpleflake()
    this.command_options = {}
    this.partial_text = "partial"
    this.focused_option = "test"
    this.options = {
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
      id: guildId,
      members: [],
      name: "test guild",
    }
    this.guild.members.fetch = (user) => user
    this.channel = {
      id: simpleflake(),
      isThread: () => false,
      guildId: guildId,
      parentId: simpleflake(),
      messages: {},
    }
    this.message = {}
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
    this.replies = []
  }

  normalizeMessage(msg) {
    switch (typeof msg) {
      case "string":
        return new Message({ content: msg, guildId: this.guildId })
      case "object":
        return new Message({ guildId: this.guildId, ...msg })
      default:
        return Promise.reject(`msg is in invalid format "${typeof msg}"`)
    }
  }

  get replyContent() {
    return this.replies.map((r) => r.content).join("\n-----\n")
  }

  async reply(msg) {
    if (this.replied) return Promise.reject("cannot reply: interaction is already in replied state")
    const real_message = this.normalizeMessage(msg)
    this.replied = true
    this.replies.push(real_message)
    return real_message
  }

  async editReply(msg) {
    if (!this.replied) return Promise.reject("cannot editReply: interaction has no reply to edit")
    const real_message = this.normalizeMessage(msg)
    this.replies.push(real_message)
    return real_message
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

  async followUp(msg) {
    if (!this.replied) return Promise.reject("cannot followUp: interaction has no reply")
    const real_message = this.normalizeMessage(msg)
    this.replies.push(real_message)
    return real_message
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

module.exports = {
  Interaction,
}
