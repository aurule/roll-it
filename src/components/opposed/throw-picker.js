const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { logger } = require("../../util/logger")

module.exports = {
  name: "throw_symbol_picker",
  data: (challenge, participant) => {
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.throws.components.symbols")
    const t_args = {
      returnObjects: true,
      context: participant.advantages.includes("bomb") ? "bomb" : undefined,
    }
    return new StringSelectMenuBuilder()
      .setCustomId(`throw_symbol_picker_${participant.id}`)
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", t_args))
      .setMinValues(1)
      .setMaxValues(1)
  },
  async execute(interaction) {
    const t = i18n.getFixedT(interaction.guild.locale, "interactive", "opposed")

    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)
    const participant_id = parseInt(interaction.customId.match(/_(\d+)/)[1])
    const allowed_participant = opposed_db.getParticipant(participant_id)

    if (false) {
    // if (allowed_participant.user_uid !== interaction.user.id) {
      return interaction
        .ensure(
          "whisper",
          t("unauthorized", { participants: [allowed_participant.mention] }),
          {
            user: interaction.user.id,
            component: "opposed_ready",
            detail: `Failed to whisper about unauthorized usage from ${interaction.user.id}`
          }
        )
    }

    opposed_db.addChopRequest({
      request: interaction.values[0],
      test_id: test.id,
      participant_id,
    })

    return interaction.deferUpdate()
  },
}
