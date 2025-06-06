const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")

function makeHistory(test, breakdown) {
  const t = i18n.getFixedT(test.locale, "interactive", "opposed.shared.history")

  const opposed_db = new Opposed()
  const leader = opposed_db.getParticipant(test.leader_id)
  const outcome_args = {
    leader: leader?.mention,
    context: leader ? "leader" : "tied",
    breakdown,
  }
  const lines = [
    `1. ${t("outcome", outcome_args)}`
  ]
  if (test.retester_id) {
    const retester = opposed_db.getParticipant(test.retester_id)
    lines.push(t("retest", { retester: retester.mention, reason: test.retest_reason }))
  }
  if (test.canceller_id) {
    const canceller = opposed_db.getParticipant(test.canceller_id)
    lines.push(t("cancelled", { canceller: canceller.mention, reason: test.cancelled_with }))
  }
  return lines.join("\n\t- ")
}

module.exports = {
  makeHistory,
}
