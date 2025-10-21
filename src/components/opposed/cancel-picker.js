const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")

/**
 * Select control for picking the retest cancel reason
 */
module.exports = {
  name: "opposed_cancel_select",
  valid_states: ["cancelling"],
  data: (challenge) => {
    const t = i18n.getFixedT(
      challenge.locale,
      "opposed",
      "cancelling.components.picker",
    )
    return new StringSelectMenuBuilder()
      .setCustomId("opposed_cancel_select")
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { returnObjects: true }))
      .setMinValues(1)
      .setMaxValues(1)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.canceller.user_uid)

    opposed_db.setTestCancelledWith(test.id, interaction.values[0])

    return interaction.deferUpdate()
  },
}
