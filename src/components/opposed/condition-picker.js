const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const { valuesOrDefault } = require("../../util/values-or-default")

module.exports = {
  name: "opposed_condition_select",
  data: (locale) => {
    const t = i18n.getFixedT(
      locale,
      "interactive",
      "opposed.advantages-attacker.components.conditions",
    )
    return new StringSelectMenuBuilder()
      .setCustomId("opposed_condition_select")
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { returnObjects: true }))
      .setMinValues(0)
      .setMaxValues(2)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const participants = opposed_db.getParticipants(challenge.id)

    interaction.authorize(participants.get("attacker").user_uid)

    interaction.deferUpdate()

    const values = valuesOrDefault(interaction, ["normal"])

    opposed_db.setChallengeConditions(challenge.id, values)
  },
}
