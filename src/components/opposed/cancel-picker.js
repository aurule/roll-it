import { StringSelectMenuBuilder } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { OpposedComponent } from "../opposed-component.js"

/**
 * Select control for picking the retest cancel reason
 */
export default new OpposedComponent("opposed_cancel_select", data, execute, Challenge.States.Cancelling)

export function data(challenge) {
  const t = i18n.getFixedT(challenge.locale, "opposed", "cancelling.components.picker")
  return new StringSelectMenuBuilder()
    .setCustomId("opposed_cancel_select")
    .setPlaceholder(t("placeholder"))
    .setOptions(t("options", { returnObjects: true }))
    .setMinValues(1)
    .setMaxValues(1)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(interaction.message.id)

  interaction.authorize(test.canceller.user_uid)

  opposed_db.setTestCancelledWith(test.id, interaction.values[0])

  return interaction.deferUpdate()
}
