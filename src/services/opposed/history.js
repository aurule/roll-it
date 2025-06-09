const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")

function makeHistory(test) {
  const t = i18n.getFixedT(test.locale, "interactive", "opposed.shared.history")

  const opposed_db = new Opposed()
  const leader = opposed_db.getParticipant(test.leader_id)
  const outcome_args = {
    leader: leader?.mention,
    context: leader ? "leader" : "tied",
    breakdown: test.breakdown,
  }
  const lines = [
    `1. ${t("outcome", outcome_args)}`
  ]
  if (test.retester_id) {
    const retester = opposed_db.getParticipant(test.retester_id)
    const reason = test.retest_reason
    const challenge = opposed_db.getChallenge(test.challenge_id)
    const ability = challenge.retest_ability
    lines.push(t(`retest.${reason}`, {
      retester: retester.mention,
      ability,
    }))
  }
  if (test.cancelled_with) {
    const canceller = opposed_db.getParticipant(test.canceller_id)
    lines.push(t("cancelled", { canceller: canceller.mention, reason: test.cancelled_with }))
  }
  return lines.join("\n\t- ")
}

module.exports = {
  makeHistory,
}
