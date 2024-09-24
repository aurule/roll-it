const {
  time,
  TimestampStyles,
  hyperlink,
  Collection,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js")
const { oneLine } = require("common-tags")

const { throwOptions } = require("../util/met-throw-options")
const { messageLink } = require("../util/message-link")
const presenter = require("../presenters/met-opposed-presenter")
const Participant = require("./met-opposed/participant")
const TestRecorder = require("./met-opposed/test-recorder")

const STEP_TIMEOUT = 300_000 // 5 minute timeout per prompt

class MetOpposedManager {
  interaction
  attacker
  defender
  attribute
  retest_ability
  test_recorder
  prompt_ends_at
  description = ""
  allow_retests = true

  participants = new Collection()
  message_links = []

  constructor({interaction, attackerId, defenderId, attribute, retest_ability}) {
    this.interaction = interaction
    this.attacker = new Participant(attackerId)
    this.defender = new Participant(defenderId)
    this.participants.set(attackerId, this.attacker)
    this.participants.set(defenderId, this.defender)
    this.attribute = attribute
    this.retest_ability = retest_ability
    this.test_recorder = new TestRecorder(this.attacker, this.defender)

    this.test_recorder.addTest()
  }

  /**
   * Get the latest Test from our test recorder
   * @type {Test}
   */
  get current_test() {
    return this.test_recorder.latest
  }

  /**
   * Store a link to a message
   *
   * @param  {Message} message Discord message object
   * @return {str}             Markdown link to the message
   */
  add_message_link(message) {
    const link = messageLink(message)
    this.message_links.push(link)
    return link
  }

  /**
   * Get the latest saved message link
   * @type {str}
   */
  get last_message_link() {
    return this.message_links.at(-1)
  }

  /**
   * Generate and save a message response deadline timestamp
   * @return {Date} Date object for the response cutoff
   */
  updateDeadline() {
    this.prompt_ends_at = new Date(Date.now() + STEP_TIMEOUT)
    return this.prompt_ends_at
  }

  /**
   * Get whether a user ID is allowed to end the challenge
   *
   * False for non-participants. True when tied. Otherwise, only true for the participant who is not leading.
   *
   * @param  {str}  userId ID of the user to test
   * @return {bool}        True if the user is allowed to end the test, false if not
   */
  allowDone(userId) {
    if (!this.participants.has(userId)) return false

    const leader = this.current_test.leader
    return !(leader && userId === leader.id)
  }

  /**
   * Get whether an event interaction is from the defending participant
   *
   * @param  {Interaction} event Discord component interaction
   * @return {bool}              True if event is from the defender, false if not
   */
  fromDefender(event) {
    return event.user.id === this.defender.id
  }

  /**
   * Get whether an event interaction is from the attacking participant
   *
   * @param  {Interaction} event Discord component interaction
   * @return {bool}              True if event is from the attacker, false if not
   */
  fromAttacker(event) {
    return event.user.id === this.attacker.id
  }

  /**
   * Get whether an event interaction is from a participant
   *
   * @param  {Interaction} event Discord component interaction
   * @return {bool}              True if event is from a participant, false if not
   */
  fromParticipant(event) {
    return this.participants.has(event.user.id)
  }

  /**
   * Get the participant whose id does not match
   *
   * This assumes that the participantId passed matches one of the participants. If it does not, the result will be
   * a random participant.
   *
   * @param  {str}         participantId ID of the participant to avoid
   * @return {Participant}               Participant whose id does not match
   */
  opposition(participantId) {
    return this.participants.find(p => p.id !== participantId)
  }

  /**
   * Create the components for the first message
   *
   * @return {ActionRowBuilder[]} Array of action rows with components
   */
  initialComponents() {
    const rowAdvantages = new ActionRowBuilder()
    const bombButton = new ButtonBuilder()
      .setCustomId("bomb")
      .setLabel("I have Bomb")
      .setEmoji("⬛")
      .setStyle(ButtonStyle.Secondary)
    if (this.defender.bomb) bombButton.setEmoji("✅")
    rowAdvantages.addComponents(bombButton)
    const tiesButton = new ButtonBuilder()
      .setCustomId("ties")
      .setLabel("I have Ties")
      .setEmoji("⬛")
      .setStyle(ButtonStyle.Secondary)
    if (this.defender.ties) tiesButton.setEmoji("✅")
    rowAdvantages.addComponents(tiesButton)

    const rowResponse = new ActionRowBuilder()
    const responsePicker = new StringSelectMenuBuilder()
      .setCustomId("picker")
      .setPlaceholder("Respond with...")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...throwOptions(this.defender.bomb))
    rowResponse.addComponents(responsePicker)

    const rowActions = new ActionRowBuilder()
    const throwButton = new ButtonBuilder()
      .setCustomId("throw")
      .setLabel("Throw!")
      .setStyle(ButtonStyle.Primary)
    rowActions.addComponents(throwButton)
    const relentButton = new ButtonBuilder()
      .setCustomId("relent")
      .setLabel("Relent")
      .setStyle(ButtonStyle.Secondary)
    rowActions.addComponents(relentButton)
    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel Test")
      .setStyle(ButtonStyle.Danger)
    rowActions.addComponents(cancelButton)

    return [rowAdvantages, rowResponse, rowActions]
  }

  /**
   * Show the first message and handle user interactions
   *
   * @return {Interaction} Interaction response
   */
  async begin() {
    this.updateDeadline()
    const prompt = await this.interaction.reply({
      content: presenter.initialMessage(this),
      components: this.initialComponents(),
      allowedMentions: {users: [this.defender.id]},
      fetchReply: true,
    })
    this.add_message_link(prompt)

    const collector = prompt.createMessageComponentCollector({
      time: STEP_TIMEOUT,
    })
    collector.on(
      "collect",
      (event) => {
        switch (event.customId) {
          case "throw":
            if (!this.fromDefender(event)) {
              event.deferUpdate()
              break
            }

            if (!this.current_test.has(this.defender.id)) {
              event.update({
                content: presenter.initialMessage(this, "You must select a response before you can throw."),
              })
              break
            }

            collector.stop()
            this.current_test.rollAll()
            return event.update({
              content: presenter.initialMessageSummary(this),
              components: [],
            }).then(() => this.statusPrompt())
          case "relent":
            if (!this.fromDefender(event)) {
              event.deferUpdate()
              break
            }

            collector.stop()
            return event.update({
              content: presenter.initialMessageSummary(this),
              components: [],
            }).then(() => this.relentMessage())
          case "cancel":
            if (!this.fromAttacker(event)) {
              event.deferUpdate()
              break
            }

            collector.stop()
            return event.update({
              content: presenter.initialMessageSummary(this),
              components: [],
            }).then(() => this.cancelMessage())
          case "picker":
            event.deferUpdate()
            if (!this.fromDefender(event)) {
              break
            }
            this.current_test.chop(this.defender, event.values[0])
            break
          case "bomb":
            if (!this.fromDefender(event)) {
              event.deferUpdate()
              break
            }
            this.defender.bomb = !this.defender.bomb
            event.update({
              components: this.initialComponents()
            })
            break
          case "ties":
            if (!this.fromDefender(event)) {
              event.deferUpdate()
              break
            }
            this.defender.ties = !this.defender.ties
            event.update({
              components: this.initialComponents()
            })
            break
        }
      }
    )

    collector.on("end", (_, reason) => {
      if (reason === "time") return prompt.edit({
          content: presenter.initialMessageSummary(this),
          components: [],
        }).then(() => this.timeoutRelent())
    })
  }

  /**
   * Send the message for the defender relenting
   * @return {Interaction} Interaction response
   */
  async relentMessage() {
    return this.interaction.followUp(presenter.relentMessage(this))
  }

  /**
   * Send the message for the attacker cancelling
   * @return {Interaction} Interaction response
   */
  async cancelMessage() {
    return this.interaction.followUp(presenter.cancelMessage(this))
  }

  /**
   * Send the message for automatic relent on initial prompt timeout
   * @return {Interaction} Interaction response
   */
  async timeoutRelent() {
    return this.interaction.followUp(presenter.timeoutRelentMessage(this))
  }

  /**
   * Send the challenge status message and handle interactions
   * @return {Interaction} Interaction response
   */
  async statusPrompt() {
    this.updateDeadline()
    const leader = this.current_test.leader

    if (!this.allow_retests) {
      return this.interaction.followUp({
        content: presenter.statusSummary(this),
      }).then(() => this.resultMessage())
    }

    const rowRetest = new ActionRowBuilder()
    const reasonPicker = new StringSelectMenuBuilder()
      .setCustomId("picker")
      .setPlaceholder("Retest with...")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...presenter.retestOptions(this))
    rowRetest.addComponents(reasonPicker)

    const rowButtons = new ActionRowBuilder()
    const retestButton = new ButtonBuilder()
      .setCustomId("retest")
      .setLabel("Retest")
      .setEmoji("🔄")
      .setStyle(ButtonStyle.Secondary)
    rowButtons.addComponents(retestButton)
    const doneButton = new ButtonBuilder()
      .setCustomId("done")
      .setLabel("Concede")
      .setStyle(ButtonStyle.Primary)
    rowButtons.addComponents(doneButton)

    const prompt = await this.interaction.followUp({
      content: presenter.statusPrompt(this),
      components: [rowRetest, rowButtons],
      fetchReply: true,
    })
    this.add_message_link(prompt)

    let retest_reason
    const collector = prompt.createMessageComponentCollector({
      time: this.constructor.step_timeout,
    })
    collector.on(
      "collect",
      (event) => {
        switch (event.customId) {
          case "retest":
            if (!this.fromParticipant(event)) {
              event.deferUpdate()
              break
            }

            if (!retest_reason) {
              event.update({
                content: presenter.statusPrompt(this, "You have to pick what to retest with before you can retest.")
              })
              break
            }

            collector.stop()
            this.test_recorder.addRetest(this.participants.get(event.user.id), retest_reason)
            return event.update({
              components: [],
            }).then(() => this.retestCancelPrompt())
          case "done":
            if (!this.allowDone(event.user.id)) {
              event.deferUpdate()
              break
            }

            collector.stop()
            return event.update({
              content: presenter.statusSummary(this),
              components: [],
            }).then(() => this.resultMessage())
          case "picker":
            event.deferUpdate()
            if (!this.fromParticipant(event)) {
              break
            }
            retest_reason = event.values[0]
            break
        }
      }
    )

    collector.on("end", (_, reason) => {
      if (reason === "time") return prompt.edit({
          content: presenter.initialMessageSummary(this),
          components: [],
        }).then(() => this.timeoutResult())
    })
  }

  /**
   * Send the final results message
   * @return {Interaction} Interaction response
   */
  async resultMessage() {
    return this.interaction.followUp(presenter.resultMessage(this))
  }

  /**
   * Send the final results message due to status message interaction timeout
   * @return {Interaction} Interaction response
   */
  async timeoutResult() {
    return this.interaction.followUp(presenter.timeoutResultMessage(this))
  }

  /**
   * Send the prompt to cancel a retest and handle interactions
   * @return {Interaction} Interaction response
   */
  async retestCancelPrompt() {
    const retester = this.current_test.retester
    const non_retester = this.opposition(retester.id)

    const rowCancel = new ActionRowBuilder()
    const cancelPicker = new StringSelectMenuBuilder()
      .setCustomId("cancel-picker")
      .setPlaceholder("Cancel with...")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...presenter.cancelOptions)
    rowCancel.addComponents(cancelPicker)

    const rowButtonsCancel = new ActionRowBuilder()
    const continueButton = new ButtonBuilder()
      .setCustomId("continue")
      .setLabel("Do Retest")
      .setStyle(ButtonStyle.Success)
    rowButtonsCancel.addComponents(continueButton)
    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel Retest")
      .setEmoji("🚫")
      .setStyle(ButtonStyle.Secondary)
    rowButtonsCancel.addComponents(cancelButton)

    const prompt = await this.interaction.followUp({
      content: presenter.retestCancelPrompt(this),
      components: [rowCancel, rowButtonsCancel],
      fetchReply: true,
    })
    this.add_message_link(prompt)

    collector.on(
      "collect",
      (event) => {
        switch (event.customId) {
          case "cancel":
            if (event.user.id !== non_retester.id) {
              event.deferUpdate()
              break
            }

            if (!cancel_reason) {
              event.update({
                content: presenter.retestCancelPrompt(this, throws, "You have to pick what to cancel with before you can cancel")
              })
              break
            }

            collector.stop()
            this.current_test.cancel(this.participants.get(event.user.id), cancel_reason)
            return event.update({
              components: [],
            }).then(() => this.retestCancelMessage())
          case "continue":
            if (event.user.id !== non_retester.id) {
              event.deferUpdate()
              break
            }

            prompt.delete()
            return this.retestPrompt()
          case "cancel-picker":
            event.deferUpdate()
            if (event.user.id !== non_retester.id) {
              break
            }
            cancel_reason = event.values[0]
            break
        }
      }
    )

    collector.on("end", (_, reason) => {
      if (reason === "time") return prompt.edit({
          content: presenter.timeoutCancelRetestMessage(),
          components: [],
        }).then(() => this.retestPrompt())
    })
  }

  /**
   * Show the message when a retest is cancelled
   * @return {Interaction} Interaction response
   */
  retestCancelMessage() {
    return this.interaction.followUp(presenter.retestCancelMessage(this)).then(() => this.statusPrompt())
  }

  /**
   * Show the retest response prompt and handle interactions
   * @return {Interaction} Interaction response
   */
  async retestPrompt() {
    const retester = this.current_test.retester
    const non_retester = this.opposition(retester.id)

    const rowResponse = new ActionRowBuilder()
    const responsePicker = new StringSelectMenuBuilder()
      .setCustomId("throw-picker")
      .setPlaceholder("Choose what to throw")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...throwOptions(this.defender.bomb || this.attacker.bomb))
    rowResponse.addComponents(responsePicker)

    const rowButtonsGo = new ActionRowBuilder()
    const throwButton = new ButtonBuilder()
      .setCustomId("throw")
      .setLabel("Throw!")
      .setStyle(ButtonStyle.Success)
    rowButtonsGo.addComponents(throwButton)

    const prompt = await this.interaction.followUp({
      content: presenter.retestPrompt(this),
      components: [rowResponse, rowButtonsGo],
      fetchReply: true,
    })
    this.add_message_link(prompt)

    let throws = new Collection()
    let cancel_reason
    const collector = prompt.createMessageComponentCollector({
      time: this.constructor.step_timeout,
    })
    collector.on(
      "collect",
      (event) => {
        switch (event.customId) {
          case "throw":
            if (!this.fromParticipant(event)) {
              event.deferUpdate()
              break
            }

            if (!throws.has(event.user.id)) {
              event.update({
                content: presenter.retestPrompt(this, throws, "You have to choose what to throw before you can throw it")
              })
              break
            }

            if (throws.has(this.opposition(event.user.id).id)) {
              collector.stop()
              return event.update({
                content: presenter.retestPrompt(this, throws),
                components: [],
              }).then(() => {
                const retest = this.current_test
                retest.chop(this.attacker, throws.get(this.attacker.id))
                retest.chop(this.defender, throws.get(this.defender.id))
                retest.rollAll()
                return this.statusPrompt()
              })
            }

            event.update({
              content: presenter.retestPrompt(this, throws)
            })
            break
          case "throw-picker":
            event.deferUpdate()
            if (!this.fromParticipant(event)) {
              break
            }

            const request = event.values[0]
            const participant = this.participants.get(event.user.id)

            if (request.contains("bomb") && !participant.bomb) break

            throws.set(participant.id, request)
            break
        }
      }
    )

    collector.on("end", (_, reason) => {
      if (reason === "time") return prompt.edit({
          components: [],
        }).then(() => this.timeoutRetest())
    })
  }

  /**
   * Show the retest timeout message
   *
   * Unlike other timeouts, this shows the status prompt again instead of ending the challenge.
   *
   * @return {Interaction} Interaction response
   */
  timeoutRetest() {
    return this.interaction.followUp(presenter.retestTimeoutMessage(this)).then(() => this.statusPrompt())
  }
}

module.exports = {
  MetOpposedManager,
}
