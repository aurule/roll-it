const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const withdraw_button = require("../../components/opposed/withdraw-challenge-button")
const condition_picker = require("../../components/opposed/condition-picker")
const advantage_picker = require("../../components/opposed/advantage-picker")
const ready_button = require("../../components/opposed/ready-button")
const build = require("../../util/message-builders")

module.exports = {
  state: "advantages-attacker",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.advantages-attacker")
    const shared_t = i18n.getFixedT(challenge.locale, "interactive", "opposed.shared")

    const components = [
      build.text(
        t("summary", {
          attacker: attacker.mention,
          defender: defender.mention,
          description: challenge.description,
          context: challenge.description ? "description" : undefined,
          attribute: shared_t(`attributes.${challenge.attribute}`),
          retest: challenge.retest,
        }),
      ),
      build.section(t("withdraw"), withdraw_button.data(challenge.locale)),
      build.separator(),
      build.text(t("conditions")),
      build.actions(condition_picker.data(challenge.locale)),
      build.text(t("advantages")),
      build.actions(advantage_picker.data(challenge.locale, attacker)),
      build.text(t("ready")),
      build.actions(ready_button.data(challenge.locale, attacker)),
    ]

    return build.message(components, {
      withResponse: true,
      allowedMentions: { users: [attacker.user_uid] },
    })
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.advantages-attacker")
    const shared_t = i18n.getFixedT(challenge.locale, "interactive", "opposed.shared")

    return build.textMessage(
      t("inert", {
        attacker: attacker.mention,
        defender: defender.mention,
        description: challenge.description,
        context: challenge.description ? "description" : undefined,
        attribute: shared_t(`attributes.${challenge.attribute}`),
        conditions: challenge.conditions.map((c) => shared_t(`conditions.${c}`)),
        retest: challenge.retest,
        advantages: attacker.advantages.map((c) => shared_t(`advantages.${c}`)),
      }),
      {
        withResponse: true,
        allowedMentions: { parse: [] },
      },
    )
  },
}
