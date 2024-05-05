"use strict"

const { simpleflake } = require("simpleflakes")
const { PermissionFlagsBits, Collection } = require("discord.js")
const { User } = require("./user")

class Interaction {
  constructor(snowflake = null, member_flake = null) {
    let member_snowflake = member_flake
    if (!member_snowflake) {
      member_snowflake = simpleflake()
    }

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
      getFocused: (be_obj = false) => {
        if (be_obj) {
          return {
            name: this.focused_option,
          }
        }

        return this.partial_text
      },
    }
    this.guildId = snowflake
    this.guild = {
      id: snowflake,
      members: [],
      name: "test guild",
    }
    this.guild.members.fetch = (user) => user
    this.channel = {
      id: simpleflake(),
      isThread: () => false,
      guildId: snowflake,
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
  }

  async reply(msg) {
    if (this.replied) return Promise.reject("cannot reply: interaction is already in replied state")
    this.replied = true
    return msg
  }

  async editReply(msg) {
    if (!this.replied) return Promise.reject("cannot editReply: interaction has no reply to edit")
    return msg
  }

  async deferUpdate() {
    if (this.replied) return Promise.reject("cannot defer: interaction is already in replied state")
    if (this.deferred) return Promise.reject("cannot defer: interaction is already in deferred state")
    return
  }

  async followUp(msg) {
    if (!this.replied) return Promise.reject("cannot followUp: interaction has no reply")
    return msg
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
  Interaction
}
