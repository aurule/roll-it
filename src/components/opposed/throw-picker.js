import { StringSelectMenuBuilder } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { OpposedComponent } from "../opposed-component.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Select control to pick a participant's symbols request during a test
 */
export default new OpposedComponent("throw_symbol_picker", data, execute, Challenge.States.Throwing)

export function data(locale, participant) {
  const t = i18n.getFixedT(locale, "opposed", "throws.components.symbols")
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
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const test = opposed_db.findTestByMessage(interaction.message.id)
  const participant_id = parseInt(interaction.customId.match(/_(\d+)/)[1])
  const allowed_participant = opposed_db.getParticipant(participant_id)

  interaction.authorize(allowed_participant.user_uid)

  opposed_db.addChopRequest({
    request: interaction.values[0],
    test_id: test.id,
    participant_id,
  })

  return interaction.deferUpdate()
}
