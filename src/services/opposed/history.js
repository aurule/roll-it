const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")

function makeHistory(test) {
  const t = i18n.getFixedT(test.locale, "interactive", "opposed.shared.history")

  const opposed_db = new Opposed()
  const outcome_args = {
    leader: test.leader?.mention,
    context: test.leader ? "leader" : "tied",
    breakdown: test.breakdown,
  }
  const lines = [
    `1. ${t("outcome", outcome_args)}`
  ]
  if (test.retested) {
    const challenge = opposed_db.getChallenge(test.challenge_id)
    const ability = challenge.retest_ability
    lines.push(t(`retest.${test.retest_reason}`, {
      retester: test.retester.mention,
      ability,
    }))
  }
  if (test.cancelled) {
    lines.push(t("cancelled", { canceller: test.canceller.mention, reason: test.cancelled_with }))
  }
  return lines.join("\n\t- ")
}

module.exports = {
  makeHistory,
}
