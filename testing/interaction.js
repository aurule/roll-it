import { simpleflake } from "simpleflakes"
import { PermissionFlagsBits, Collection } from "discord.js"
import { User } from "./user.js"
import { Message } from "./message.js"

class MockOptions {
  interaction

  /**
   * Create a new MockOptions object
   *
   * The passed interaction _must_ be a testing interaction, not a real one!
   *
   * @param  {Interaction} interaction Our parent interaction
   * @return {MockOptions}             New MockOptions object
   */
  constructor(interaction) {
    this.interaction = interaction
  }

  /**
   * Get data in the format presented by the normal Interaction object
   *
   * @return {object[]} Array of options data objects
   */
  get data() {
    const option_objects = []
    for (const key in this.interaction.command_options) {
      option_objects.push({
        name: key,
        value: this.interaction.command_options[key]
      })
    }
    return option_objects
  }

  set data(command_options) {
    for (const key in command_options) {
      this.interaction.command_options[key] = command_options[key]
    }
  }

  getString(key) {
    return this.interaction.command_options[key]?.toString()
  }

  getBoolean(key) {
    return !!this.interaction.command_options[key]
  }

  getChannel(key) {
    return this.interaction.command_options[key]
  }

  getInteger(key) {
    return this.interaction.command_options[key]
  }

  getUser(key) {
    return this.interaction.command_options[key]
  }

  getAttachment(key) {
    return this.interaction.command_options[key]
  }

  getFocused(be_obj = false) {
    if (be_obj) {
      return {
        name: this.focused_option,
        value: this.partial_text,
      }
    }

    return this.partial_text
  }

  getSubcommand() {
    return this.interaction.command_options.subcommand_name
  }
}

/**
 * Fake interaction class for testing
 *
 * This mimics the structure and behavior of a Discord Interaction object, but not perfectly.
 *
 * To test against the output of a command, you can use the `replyContent` property, which aggregates all text
 * from simple calls to reply() and friends.
 */
export class Interaction {
  constructor(guildId = null, member_flake = null) {
    let member_snowflake = member_flake ?? simpleflake()

    this.id = simpleflake()
    this.command_options = {}
    this.partial_text = "partial"
    this.focused_option = "test"
    this.locale = "en-US"
    this.options = new MockOptions(this)

    this.guildId = guildId ?? simpleflake()
    this.guild = {
      id: this.guildId,
      members: [],
      name: "test guild",
      locale: "en-US",
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
    this.message.interaction = this

    this.user = new User(member_snowflake)
    this.member = {
      id: member_snowflake,
      permissions: PermissionFlagsBits.Defaults,
      user: this.user,
    }
    this.client = {
      commands: new Collection(),
      modals: new Collection(),
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

  get author() {
    return this.user
  }

  get reference() {
    return {
      messageId: this.message.id,
    }
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

  get channelId() {
    return this.channel.id
  }

  async edit(msg) {
    const message_opts = this.normalizeMessage(msg)
    this.message.addReply(message_opts)
    return this.message
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
    this.replied = true
    return
  }

  async update(msg) {
    if (this.deferred) return Promise.reject("cannot update: interaction has been deferred")
    if (this.replied) return Promise.reject("cannot update: interaction has already been replied")
    const message_opts = this.normalizeMessage(msg)
    this.message.addReply(message_opts)
    this.replied = true
    return this.message
  }

  async followUp(msg) {
    if (!this.deferred && !this.replied)
      return Promise.reject("cannot followUp: interaction has no reply")
    const message_opts = this.normalizeMessage(msg)
    this.message.addReply(message_opts)
    this.replied = true
    return this.message
  }

  async showModal(modal) {
    if (this.replied || this.deferred)
      return Promise.reject("cannot showModal: must be the first response")
    this.replied = true
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

import { patch as patchEnsure } from "../src/patches/ensure.js"
import { patch as patchPaginate } from "../src/patches/paginate.js"
import { patch as patchRollReply } from "../src/patches/roll-reply.js"
import { patch as patchAuthorize } from "../src/patches/authorize.js"
import { patch as patchWhisper } from "../src/patches/whisper.js"

patchEnsure(Interaction)
patchPaginate(Interaction)
patchRollReply(Interaction)
patchAuthorize(Interaction)
patchWhisper(Interaction)

export class ComponentInteraction extends Interaction {
  customId
  values

  constructor({ customId, values = [], message, guildId = null, member_flake = null } = {}) {
    super(guildId, member_flake)
    this.customId = customId
    this.values = values
    this.message = message
  }
}
