const {
  Collection,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js")

const { throwOptions } = require("../util/met-throw-options")
const { messageLink } = require("../util/formatters")
const presenter = require("../presenters/met-opposed-presenter")
const Participant = require("./met-opposed/participant")
const TestRecorder = require("./met-opposed/test-recorder")
const { i18n } = require("../locales")

const STEP_TIMEOUT = 600_000 // 10 minute timeout per prompt

/**
 * Class to manage the state of an opposed challenge
 */
class MetOpposedManager {
  /**
   * Active interaction object
   *
   * This object is overwritten as the participants respond to prompts. This should always be an Interaction
   * that can still accept followUp calls.
   *
   * @type {Interaction}
   */
  interaction

  /**
   * Participant who initiated the challenge
   *
   * @type {Participant}
   */
  attacker

  /**
   * Participant who was challenged
   *
   * @type {Participant}
   */
  defender

  /**
   * Name of the attribute type to use for determining total traits
   *
   * This is purely informational and is not used programmatically.
   *
   * @type {str}
   */
  attribute

  /**
   * Name of the ability most likely used for starting a retest
   *
   * @type {str}
   */
  retest_ability

  /**
   * Test recorder object to keep track of individual tests
   *
   * @type {TestRecorder}
   */
  test_recorder

  /**
   * Timestamp used to store the deadline at which message component interactions will be disabled
   *
   * @type {DateTime}
   */
  prompt_ends_at

  /**
   * Link to the first message of the challenge
   *
   * @type {String}
   */
  initial_message_link

  /**
   * Locale name
   * @type {str}
   */
  locale

  /**
   * Translation function
   * @type {i18n.t}
   */
  t

  /**
   * Description of the challenge
   *
   * @type {String}
   */
  description = ""

  /**
   * Whether or not retests are being allowed at all
   *
   * @type {Boolean}
   */
  allow_retests = true

  /**
   * Collection of participants who are part of the challenge
   *
   * @type {Collection<Participant>}
   */
  participants = new Collection()

  /**
   * Create a new MetOpposedManager
   *
   * @param  {Interaction} interaction    The initial interaction that started the challenge
   * @param  {str}         attackerId     Discord user ID of the user who initiated the challenge
   * @param  {str}         defenderId     Discord user ID of the user who was challenged
   * @param  {str}         attribute      Name of the gross attribute used to determine trait totals for the challenge. Informational only.
   * @param  {str}         retest_ability Name of the game ability most likely to be used to retest an outcome
   */
  constructor({ interaction, attackerId, defenderId, attribute, retest_ability }) {
    this.interaction = interaction
    this.attacker = new Participant(attackerId)
    this.defender = new Participant(defenderId)
    this.participants.set(attackerId, this.attacker)
    this.participants.set(defenderId, this.defender)
    this.attribute = attribute
    this.retest_ability = retest_ability
    this.test_recorder = new TestRecorder(this.attacker, this.defender)

    this.locale = interaction?.locale ?? "en-US"
    this.t = i18n.getFixedT(this.locale, "opposed")

    this.test_recorder.addTest()
  }

  /**
   * Get the latest Test from our test recorder
   *
   * @type {Test}
   */
  get current_test() {
    return this.test_recorder.latest
  }

  /**
   * Generate and save a message response deadline timestamp
   *
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
    return this.participants.find((p) => p.id !== participantId)
  }

  /**
   * Get whether a non-retester can cancel a retest
   *
   * If the non-retesting user has cancels, they can always cancel a retest. Otherwise, they can only cancel
   * if all conditions are met:
   * * The retest uses the named retest ability or the other ability option
   * * The canceller has not used the named retest ability or the other ability option to initiate a retest
   * * The canceller has not cancelled another retest using an ability
   *
   * @param  {Retest} retest The retest to check
   * @return {bool}          True if the retest's non-initiator can cancel that retest, false if not
   */
  canCancel(retest) {
    const canceller = this.opposition(retest.retester.id)
    if (canceller.cancels) return true

    return (
      (retest.reason.includes("ability") || retest.reason.includes(this.retest_ability)) &&
      !this.test_recorder.tests.find(
        (t) =>
          (t.canceller === canceller && t.cancelled_with.includes("ability")) ||
          (t.retester === canceller &&
            (t.reason.includes("ability") || t.reason.includes(this.retest_ability))),
      )
    )
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
      .setLabel(this.t("state.initial.buttons.bomb"))
      .setEmoji("⬛")
      .setStyle(ButtonStyle.Secondary)
    if (this.defender.bomb) bombButton.setEmoji("✅")
    rowAdvantages.addComponents(bombButton)

    const tiesButton = new ButtonBuilder()
      .setCustomId("ties")
      .setLabel(this.t("state.initial.buttons.ties"))
      .setEmoji("⬛")
      .setStyle(ButtonStyle.Secondary)
    if (this.defender.ties) tiesButton.setEmoji("✅")
    rowAdvantages.addComponents(tiesButton)

    if (this.allow_retests) {
      const cancelsButton = new ButtonBuilder()
        .setCustomId("cancels")
        .setLabel(this.t("state.initial.buttons.cancels"))
        .setEmoji("⬛")
        .setStyle(ButtonStyle.Secondary)
      if (this.defender.cancels) cancelsButton.setEmoji("✅")
      rowAdvantages.addComponents(cancelsButton)
    }

    const rowResponse = new ActionRowBuilder()
    const responsePicker = new StringSelectMenuBuilder()
      .setCustomId("picker")
      .setPlaceholder(this.t("state.initial.picker"))
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...throwOptions(this.locale, this.defender.bomb))
    rowResponse.addComponents(responsePicker)

    const rowActions = new ActionRowBuilder()
    const throwButton = new ButtonBuilder()
      .setCustomId("throw")
      .setLabel(this.t("state.initial.buttons.throw"))
      .setStyle(ButtonStyle.Primary)
    rowActions.addComponents(throwButton)
    const relentButton = new ButtonBuilder()
      .setCustomId("relent")
      .setLabel(this.t("state.initial.buttons.relent"))
      .setStyle(ButtonStyle.Secondary)
    rowActions.addComponents(relentButton)
    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(this.t("state.initial.buttons.cancel"))
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
      allowedMentions: { users: [this.defender.id] },
      withResponse: true,
    })
    this.initial_message_link = messageLink(prompt)

    const collector = prompt.resource.message.createMessageComponentCollector({
      time: STEP_TIMEOUT,
    })
    collector.on("collect", (event) => {
      switch (event.customId) {
        case "throw":
          if (!this.fromDefender(event)) {
            event.deferUpdate()
            break
          }

          if (!this.current_test.has(this.defender.id)) {
            event.update({
              content: presenter.initialMessage(this, this.t("state.initial.validation.response")),
            })
            break
          }

          collector.stop()
          this.current_test.rollAll()
          const update = event.update({
            content: presenter.initialMessageSummary(this),
            components: [],
          })

          if (this.allow_retests) return update.then(() => this.statusPrompt())
          return update.then(() => this.resultMessage())
        case "relent":
          if (!this.fromDefender(event)) {
            event.deferUpdate()
            break
          }

          collector.stop()
          return event
            .update({
              content: presenter.initialMessageSummary(this),
              components: [],
            })
            .then(() => this.relentMessage())
        case "cancel":
          if (!this.fromAttacker(event)) {
            event.deferUpdate()
            break
          }

          collector.stop()
          return event
            .update({
              content: presenter.initialMessageSummary(this),
              components: [],
            })
            .then(() => this.cancelMessage())
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
            components: this.initialComponents(),
          })
          break
        case "cancels":
          if (!this.fromDefender(event)) {
            event.deferUpdate()
            break
          }
          this.defender.cancels = !this.defender.cancels
          event.update({
            components: this.initialComponents(),
          })
          break
        case "ties":
          if (!this.fromDefender(event)) {
            event.deferUpdate()
            break
          }
          this.defender.ties = !this.defender.ties
          event.update({
            components: this.initialComponents(),
          })
          break
      }
    })

    collector.on("end", (_, reason) => {
      if (reason === "time")
        return prompt
          .edit({
            content: presenter.initialMessageSummary(this),
            components: [],
          })
          .then(() => this.timeoutRelent())
    })
  }

  /**
   * Send the message for the defender relenting
   *
   * @return {Interaction} Interaction response
   */
  async relentMessage() {
    return this.interaction.followUp(presenter.relentMessage(this))
  }

  /**
   * Send the message for the attacker cancelling the entire challenge
   *
   * @return {Interaction} Interaction response
   */
  async cancelMessage() {
    return this.interaction.followUp(presenter.cancelMessage(this))
  }

  /**
   * Send the message for automatic relent on initial prompt timeout
   *
   * @return {Interaction} Interaction response
   */
  async timeoutRelent() {
    return this.interaction.followUp(presenter.timeoutRelentMessage(this))
  }

  /**
   * Send the challenge status message and handle interactions
   *
   * @return {Interaction} Interaction response
   */
  async statusPrompt() {
    this.updateDeadline()

    if (!this.allow_retests) {
      return this.interaction
        .followUp({
          content: presenter.statusSummary(this),
        })
        .then(() => this.resultMessage())
    }

    const rowRetest = new ActionRowBuilder()
    const reasonPicker = new StringSelectMenuBuilder()
      .setCustomId("picker")
      .setPlaceholder(this.t("state.status.picker"))
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        ...this.t("state.status.retests", { returnObjects: true, ability: this.retest_ability }),
      )
    rowRetest.addComponents(reasonPicker)

    const rowButtons = new ActionRowBuilder()
    const retestButton = new ButtonBuilder()
      .setCustomId("retest")
      .setLabel(this.t("state.status.buttons.retest"))
      .setEmoji("🔄")
      .setStyle(ButtonStyle.Secondary)
    rowButtons.addComponents(retestButton)
    const doneButton = new ButtonBuilder()
      .setCustomId("done")
      .setLabel(this.t("state.status.buttons.concede"))
      .setStyle(ButtonStyle.Primary)
    rowButtons.addComponents(doneButton)

    const prompt = await this.interaction.followUp({
      content: presenter.statusPrompt(this),
      components: [rowRetest, rowButtons],
      withResponse: true,
    })

    let retest_reason = new Collection()
    const collector = prompt.resource.message.createMessageComponentCollector({
      time: STEP_TIMEOUT,
    })
    collector.on("collect", (event) => {
      switch (event.customId) {
        case "retest":
          if (!this.fromParticipant(event)) {
            event.deferUpdate()
            break
          }

          if (!retest_reason.has(event.user.id)) {
            event.update({
              content: presenter.statusPrompt(this, this.t("state.status.validation.reason")),
            })
            break
          }

          collector.stop()
          const retester = this.participants.get(event.user.id)
          const retest = this.test_recorder.addRetest(retester, retest_reason.get(event.user.id))
          this.interaction = event
          return event
            .update({
              components: [],
            })
            .then(() => {
              if (this.canCancel(retest)) return this.retestCancelPrompt()
              else return this.retestPrompt()
            })
        case "done":
          if (!this.allowDone(event.user.id)) {
            event.deferUpdate()
            break
          }

          collector.stop()
          this.interaction = event
          return event
            .update({
              content: presenter.statusSummary(this),
              components: [],
            })
            .then(() => this.resultMessage())
        case "picker":
          event.deferUpdate()
          if (!this.fromParticipant(event)) {
            break
          }
          retest_reason.set(event.user.id, event.values[0])
          break
      }
    })

    collector.on("end", (_, reason) => {
      if (reason === "time")
        return prompt
          .edit({
            content: presenter.initialMessageSummary(this),
            components: [],
          })
          .then(() => this.timeoutResult())
    })
  }

  /**
   * Send the final results message
   *
   * @return {Interaction} Interaction response
   */
  async resultMessage() {
    return this.interaction.followUp(presenter.resultMessage(this))
  }

  /**
   * Send the final results message due to status message interaction timeout
   *
   * @return {Interaction} Interaction response
   */
  async timeoutResult() {
    return this.interaction.followUp(presenter.timeoutResultMessage(this))
  }

  /**
   * Send the prompt to cancel a retest and handle interactions
   *
   * @return {Interaction} Interaction response
   */
  async retestCancelPrompt() {
    this.updateDeadline()
    const retester = this.current_test.retester
    const non_retester = this.opposition(retester.id)

    const rowCancel = new ActionRowBuilder()
    const cancelPicker = new StringSelectMenuBuilder()
      .setCustomId("cancel-picker")
      .setPlaceholder(this.t("state.cancel.picker"))
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...this.t("state.cancel.options", { returnObjects: true }))
    rowCancel.addComponents(cancelPicker)

    const rowButtonsCancel = new ActionRowBuilder()
    const continueButton = new ButtonBuilder()
      .setCustomId("continue")
      .setLabel(this.t("state.cancel.buttons.continue"))
      .setStyle(ButtonStyle.Success)
    rowButtonsCancel.addComponents(continueButton)
    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(this.t("state.cancel.buttons.cancel"))
      .setEmoji("🚫")
      .setStyle(ButtonStyle.Secondary)
    rowButtonsCancel.addComponents(cancelButton)
    const withdrawButton = new ButtonBuilder()
      .setCustomId("withdraw")
      .setLabel(this.t("state.cancel.buttons.withdraw"))
      .setStyle(ButtonStyle.Secondary)
    rowButtonsCancel.addComponents(withdrawButton)

    const prompt = await this.interaction.followUp({
      content: presenter.retestCancelPrompt(this),
      components: [rowCancel, rowButtonsCancel],
      withResponse: true,
    })

    let cancel_reason
    const collector = prompt.resource.message.createMessageComponentCollector({
      time: STEP_TIMEOUT,
    })
    collector.on("collect", (event) => {
      switch (event.customId) {
        case "cancel":
          if (event.user.id !== non_retester.id) {
            event.deferUpdate()
            break
          }

          if (!cancel_reason) {
            event.update({
              content: presenter.retestCancelPrompt(this, this.t("state.cancel.validation.reason")),
            })
            break
          }

          collector.stop()
          this.current_test.cancel(this.participants.get(event.user.id), cancel_reason)
          this.interaction = event
          return event
            .update({
              components: [],
            })
            .then(() => this.retestCancelMessage())
        case "continue":
          if (event.user.id !== non_retester.id) {
            event.deferUpdate()
            break
          }

          collector.stop()
          return event
            .update({
              content: presenter.retestContinueMessage(this),
              components: [],
            })
            .then(() => this.retestPrompt())
        case "withdraw":
          if (event.user.id !== retester.id) {
            event.deferUpdate()
            break
          }

          collector.stop()
          this.interaction = event
          return event
            .update({
              content: presenter.retestWithdrawMessage(this),
              components: [],
            })
            .then(() => {
              this.test_recorder.tests.pop()
              return this.statusPrompt()
            })
        case "cancel-picker":
          event.deferUpdate()
          if (event.user.id !== non_retester.id) {
            break
          }
          cancel_reason = event.values[0]
          break
      }
    })

    collector.on("end", (_, reason) => {
      if (reason === "time")
        return prompt
          .edit({
            content: presenter.timeoutCancelRetestMessage(),
            components: [],
          })
          .then(() => this.retestPrompt())
    })
  }

  /**
   * Show the message when a retest is cancelled
   *
   * @return {Interaction} Interaction response
   */
  retestCancelMessage() {
    return this.interaction
      .followUp(presenter.retestCancelMessage(this))
      .then(() => this.statusPrompt())
  }

  /**
   * Show the retest response prompt and handle interactions
   *
   * @return {Interaction} Interaction response
   */
  async retestPrompt() {
    this.updateDeadline()
    const retester = this.current_test.retester

    const rowResponse = new ActionRowBuilder()
    const responsePicker = new StringSelectMenuBuilder()
      .setCustomId("throw-picker")
      .setPlaceholder(this.t("state.retest.picker"))
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...throwOptions(this.locale, this.defender.bomb || this.attacker.bomb))
    rowResponse.addComponents(responsePicker)

    const rowButtonsGo = new ActionRowBuilder()
    const throwButton = new ButtonBuilder()
      .setCustomId("throw")
      .setLabel(this.t("state.retest.buttons.throw"))
      .setStyle(ButtonStyle.Success)
    rowButtonsGo.addComponents(throwButton)
    const withdrawButton = new ButtonBuilder()
      .setCustomId("withdraw")
      .setLabel(this.t("state.retest.buttons.withdraw"))
      .setStyle(ButtonStyle.Secondary)
    rowButtonsGo.addComponents(withdrawButton)

    const responses = new Collection()
    const prompt = await this.interaction.followUp({
      content: presenter.retestPrompt(this, responses),
      components: [rowResponse, rowButtonsGo],
      withResponse: true,
    })

    const throws = new Collection()
    const collector = prompt.resource.message.createMessageComponentCollector({
      time: STEP_TIMEOUT,
    })
    collector.on("collect", (event) => {
      switch (event.customId) {
        case "throw":
          if (!this.fromParticipant(event)) {
            event.deferUpdate()
            break
          }

          if (!throws.has(event.user.id)) {
            event.update({
              content: presenter.retestPrompt(
                this,
                throws,
                this.t("state.retest.validation.throw"),
              ),
            })
            break
          }

          responses.set(event.user.id, "commit")
          if (
            responses.hasAll(event.user.id, this.opposition(event.user.id).id) &&
            responses.every((r) => r === "commit")
          ) {
            collector.stop()
            this.interaction = event
            return event
              .update({
                content: presenter.retestPrompt(this, responses),
                components: [],
              })
              .then(() => {
                const retest = this.current_test
                retest.chop(this.attacker, throws.get(this.attacker.id))
                retest.chop(this.defender, throws.get(this.defender.id))
                retest.rollAll()
                return this.statusPrompt()
              })
          }

          event.update({
            content: presenter.retestPrompt(this, responses),
          })
          break
        case "withdraw":
          if (event.user.id !== retester.id) {
            event.deferUpdate()
            break
          }

          collector.stop()
          this.interaction = event
          return event
            .update({
              content: presenter.retestWithdrawMessage(this),
              components: [],
            })
            .then(() => {
              this.test_recorder.tests.pop()
              return this.statusPrompt()
            })
        case "throw-picker":
          if (!this.fromParticipant(event)) {
            event.deferUpdate()
            break
          }

          const request = event.values[0]
          const participant = this.participants.get(event.user.id)

          if (request.includes("bomb") && !participant.bomb) break

          throws.set(participant.id, request)
          responses.set(participant.id, "choice")
          event.update({ content: presenter.retestPrompt(this, responses) })
          break
      }
    })

    collector.on("end", (_, reason) => {
      if (reason === "time") {
        this.current_test.cancel(null, "time")
        return prompt
          .edit({
            components: [],
          })
          .then(() => this.timeoutRetest())
      }
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
    return this.interaction
      .followUp(presenter.retestTimeoutMessage(this))
      .then(() => this.statusPrompt())
  }
}

module.exports = {
  MetOpposedManager,
}
