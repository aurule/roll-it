const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const throw_picker = require("../../components/opposed/throw-picker")
const go_button = require("../../components/opposed/go-button")
const build = require("../../util/message-builders")

module.exports = {
  state: "throwing",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.throws")

    const components = [
      build.text(t("request", { participant: attacker.mention })),
      build.actions(throw_picker.data(locale, attacker)),
      build.text(t("disclaimer")),
      build.separator(),
      build.text(t("request", { participant: defender.mention })),
      build.actions(throw_picker.data(locale, defender)),
      build.text(t("disclaimer")),
      build.separator(),
      build.text(t("cta")),
      build.actions(go_button.data(challenge.locale))
    ]
    return build.message(components, { withResponse: true })
  },
  afterRetry: async (message) => {
    const opposed_db = new Opposed()
    const test = opposed_db.findTestByMessage(message.id)
    const participants = opposed_db.getParticipants(test.challenge_id)

    if (opposed_db.didParticipantChop(participants.get("attacker").id, test.id)) {
      await message.react("🗡️").catch((err) => {
        logger.warn(
          {
            err,
            test,
          },
          "Could not react with attacker emoji",
        )
      })
    }
    if (opposed_db.didParticipantChop(participants.get("defender").id, test.id)) {
      await message.react("🛡️").catch((err) => {
        logger.warn(
          {
            err,
            test,
          },
          "Could not react with defender emoji",
        )
      })
    }
  },
}
