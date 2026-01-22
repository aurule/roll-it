import { StringSelectMenuBuilder } from "discord.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { OpposedComponent } from "../opposed-component.js"
import { Challenge } from "../../db/opposed/challenge.js"

/**
 * Select control to pick the retest reason
 */
export default new OpposedComponent("opposed_retest_select", data, execute, Challenge.States.Winning, Challenge.States.Tying)

export function data(locale, retest_ability) {
  const t = i18n.getFixedT(locale, "opposed", "shared.retest.picker")
  return new StringSelectMenuBuilder()
    .setCustomId("opposed_retest_select")
    .setPlaceholder(t("placeholder"))
    .setOptions(t("options", { ability: retest_ability, returnObjects: true }))
    .setMinValues(1)
    .setMaxValues(1)
}

export async function execute(interaction) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
  const test = opposed_db.getLatestTest(challenge.id)
  const participants = opposed_db.getParticipants(challenge.id)

  interaction.authorize(...participants.map((p) => p.user_uid))

  const t = i18n.getFixedT(challenge.locale, "opposed")

  const current_participant = participants.find((p) => p.user_uid === interaction.user.id)

  const reason = interaction.values[0]
  if (["named", "ability"].includes(reason) && current_participant.ability_used) {
    return interaction.ensure("whisper", t("shared.retest.invalid"), {
      component: "opposed_retest_select",
      user: current_participant,
      detail: "could not whisper about ability already used",
    })
  }

  const other_participant = participants.find((p) => p.user_uid !== interaction.user.id)
  opposed_db.setRetest({
    test_id: test.id,
    retester_id: current_participant.id,
    reason,
    canceller_id: other_participant.id,
  })

  return interaction.deferUpdate()
}
