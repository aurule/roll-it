const { StringSelectMenuBuilder } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")

/**
 * Select control to pick the retest reason
 */
module.exports = {
  name: "opposed_retest_select",
  data: (challenge) => {
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.shared.retest.picker")
    return new StringSelectMenuBuilder()
      .setCustomId("opposed_retest_select")
      .setPlaceholder(t("placeholder"))
      .setOptions(t("options", { ability: challenge.retest_ability, returnObjects: true }))
      .setMinValues(1)
      .setMaxValues(1)
  },
  async execute(interaction) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByMessage(interaction.message.id)
    const test = opposed_db.getLatestTest(challenge.id)
    const participants = opposed_db.getParticipants(challenge.id)

    interaction.authorize(...participants.map((p) => p.user_uid))

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    interaction.deferUpdate()

    const current_participant = participants.find((p) => p.user_uid === interaction.user.id)

    const reason = interaction.values[0]
    if (reason in ["named", "ability"] && current_participant.ability_used) {
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
  },
}
