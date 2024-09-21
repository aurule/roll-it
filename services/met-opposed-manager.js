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
  description
  test_recorder

  participants = new Collection()
  message_links = []

  constructor({interaction, attackerId, defenderId, attribute, retest_ability, description}) {
    this.interaction = interaction
    this.attacker = new Participant(attackerId)
    this.defender = new Participant(defenderId)
    this.participants.set(attackerId, this.attacker)
    this.participants.set(defenderId, this.defender)
    this.attribute = attribute
    this.retest_ability = retest_ability
    this.description = description
    this.test_recorder = new TestRecorder(this.attacker, this.defender)
    this.prompt_ends_at = new Date(Date.now() + STEP_TIMEOUT)

    this.test_recorder.addTest()
  }

  get current_test() {
    return this.test_recorder.latest
  }

  get last_message_link() {
    return this.message_links.at(-1)
  }

  add_message_link(message) {
    const link = messageLink(message)
    this.message_links.push(link)
    return link
  }

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

  async begin() {
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
              break
            }

            if (!this.current_test.has(this.defender.id)) {
              event.update({
                content: presenter.initialMessage(this, "You must select a response before you can throw."),
                allowedMentions: {},
              })
              break
            }

            collector.stop()
            this.current_test.rollAll()
            return event.update({
              content: presenter.initialMessageSummary(this),
              components: [],
              allowedMentions: {},
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
              allowedMentions: {},
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
              allowedMentions: {},
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
      if (reason === "time") return event.update({
          content: presenter.initialMessageSummary(this),
          components: [],
          allowedMentions: {},
        }).then(() => this.timeoutRelent())
    })
  }

  async relentMessage() {
    return this.interaction.followUp(presenter.relentMessage(this))
  }

  async cancelMessage() {
    return this.interaction.followUp(presenter.cancelMessage(this))
  }

  async timeoutRelent() {
    return this.interaction.followUp(presenter.timeoutRelentMessage(this))
  }

  allowDone(userId) {
    if (!this.participants.has(userId)) return false

    const leader = this.current_test.leader
    return !(leader && userId === leader.id)
  }

  fromDefender(event) {
    return event.user.id === this.defender.id
  }

  fromAttacker(event) {
    return event.user.id === this.attacker.id
  }

  fromParticipant(event) {
    return this.participants.has(event.user.id)
  }

  async statusPrompt() {
    const leader = this.current_test.leader

    const rowRetest = new ActionRowBuilder()
    const reasonPicker = new StringSelectMenuBuilder()
      .setCustomId("picker")
      .setPlaceholder("Retest with...")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions({label: this.retest_ability, value: this.retest_ability, description: "Named retest"})
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
      .setLabel("Done")
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
            // update prompt
            // return retestPrompt() with retest user and their selection
            collector.stop()
            break
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
            if (!this.fromParticipant(event)) {
              event.deferUpdate()
              break
            }
            event.deferUpdate()
            retest_reason = event.values[0]
            break
        }
      }
    )

    collector.on("end", (_, reason) => {
      switch(reason) {
        case "time":
          // update prompt
          // return finalResult()
          break;
      }
    })
  }

  async resultMessage() {
    return this.interaction.followUp(presenter.resultMessage(this))
  }

  async timeoutMessage() {
    return this.interaction.followUp("timed out")
  }

  async retestPrompt(retester, reason) {
    // create action rows
    const rowResponse = new ActionRowBuilder()
    const responsePicker = new StringSelectMenuBuilder()
      .setCustomId("picker")
      .setPlaceholder("Select your response")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(...throwOptions(this.defender.bomb || this.attacker.bomb))
    rowResponse.addComponents(responsePicker)
    const rowCancel = new ActionRowBuilder()
    const rowButtons = new ActionRowBuilder()

    const prompt = await interaction.followUp({
      content: "roll again",
      // components: [rowResponse, rowCancel, rowButtons],
    })

    const collector = prompt.createMessageComponentCollector({
      time: this.constructor.step_timeout,
    })
    collector.on(
      "collect",
      (event) => {
        switch (event.customId) {
          case "throw":
            // update prompt with participant readiness
            // if both ready...
            //  update prompt
            //  return resultPrompt()
            collector.stop()
            break
          case "cancel":
            // only ok from non-retester
            // update prompt
            // return resultPrompt()
            collector.stop()
            break
          case "throw-picker":
            // update respective user's participant object
            break
          case "cancel-picker":
            // only ok from non-retester
            // store cancel reason
            break
        }
      }
    )

    collector.on("end", (_, reason) => {
      switch(reason) {
        case "time":
          // update prompt
          // return resultPrompt()
          break;
      }
    })
  }
}

module.exports = {
  MetOpposedManager,
}
