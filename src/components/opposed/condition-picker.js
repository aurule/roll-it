import { StringSelectMenuBuilder } from "discord.js"

import { OpposedComponent } from "../opposed-component.js"
import { i18n } from "../../locales/index.js"
import { Opposed } from "../../db/opposed.js"
import { valuesOrDefault } from "../../util/values-or-default.js"
import { Challenge } from "../../db/opposed/challenge"

/**
 * Selector to pick challenge conditions
 * @type OpposedComponent
 */
export default new OpposedComponent("opposed_condition_select", data, execute, Challenge.States.AdvantagesAttacker)

/**
 * Build the data for this component
 * @param  {string}                  locale Locale string
 * @return {StringSelectMenuBuilder}        Builder object
 */
export function data(locale) {
  const t = i18n.getFixedT(locale, "opposed", "advantages-attacker.components.conditions")
  return new StringSelectMenuBuilder()
    .setCustomId("opposed_condition_select")
    .setPlaceholder(t("placeholder"))
    .setOptions(t("options", { returnObjects: true }))
    .setMinValues(0)
    .setMaxValues(2)
}

/**
 * Handle user interactions with this component
 * @param  {Interaction} interaction Interaction object
 */
export function execute(interaction) {
  const opposed_db = new Opposed()
  const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
  const participants = opposed_db.getParticipants(challenge.id)

  interaction.authorize(participants.get("attacker").user_uid)

  interaction.deferUpdate()

  const values = valuesOrDefault(interaction, ["normal"])

  opposed_db.setChallengeConditions(challenge.id, values)
}
