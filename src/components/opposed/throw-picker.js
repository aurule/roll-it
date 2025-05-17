const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/interactive")
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
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)
    const { attacker, defender } = opposed_db.getParticipants(test.challenge_id)
    const allowed_users = new Set(attacker.user_uid, defender.user_uid)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    if (!allowed_users.has(interaction.user.id)) {
      return interaction
        .whisper(t("unauthorized", { participants: [attacker.mention, defender.mention] }))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: "throw_symbol_picker" },
            `Could not whisper about unauthorized usage from ${interaction.user.id}`,
          ),
        )
    }

    // set request on test_chops
    // react with appropriate symbol: dagger for attacker, shield for defender

    interaction.deferUpdate()
  },
}
