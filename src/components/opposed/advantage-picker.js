import { StringSelectMenuBuilder } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { valuesOrDefault } from "../../util/values-or-default.js"
import { OpposedComponent } from "../opposed-component.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Select control for selecting a participant's advantages
 */
export default new OpposedComponent(
  "opposed_advantage_select",
  data,
  execute,
  Challenge.States.AdvantagesAttacker,
  Challenge.States.AdvantagesDefender,
)

export function data(locale, participant) {
  const t = i18n.getFixedT(locale, "opposed", "shared.advantages-picker")
  return new StringSelectMenuBuilder()
    .setCustomId(`opposed_advantage_select_${participant.id}`)
    .setPlaceholder(t("placeholder"))
    .setOptions(t("options", { returnObjects: true }))
    .setMinValues(0)
    .setMaxValues(3)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const participant_id = parseInt(interaction.customId.match(/_(\d+)/)[1])
  const allowed_participant = opposed_db.getParticipant(participant_id)

  interaction.authorize(allowed_participant.user_uid)

  interaction.deferUpdate()

  const values = valuesOrDefault(interaction, ["none"])

  opposed_db.setParticipantAdvantages(allowed_participant.id, values)
}
