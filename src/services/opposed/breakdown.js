/**
 * Describe the outcome of an opposed tests
 *
 * @param  {object}                  options
 * @param  {Participant|null}        options.leader       Participant who won the chop, or null
 * @param  {Chop[]}                  options.chops        Array of database Chop objects
 * @param  {Collection<Participant>} options.participants Collection of test participants
 * @param  {i18n.t}                  options.t            Localization function, scoped to the "opposed" namespace
 * @return {str}                                          String describing the outcome
 */
function makeBreakdown({ leader, chops, participants, t }) {
  if (leader === null) {
    return t("shared.breakdown.tied", {
      result: chops[0].result,
      traits: chops[0].traits,
      context: chops[0].traits >= 0 ? "bids" : undefined,
    })
  }

  if (chops[0].result === chops[1].result && chops[0].traits < 0) {
    return t("shared.breakdown.tiebreaker", {
      result: chops[0].result,
      leader: leader.mention,
    })
  }

  const leader_chop = chops.find((c) => c.participant_id === leader.id)
  const trailer = participants.find((p) => p.user_uid !== leader.user_uid)
  const trailer_chop = chops.find((c) => c.participant_id === trailer.id)

  const t_args = {
    leader: leader.mention,
    leader_result: leader_chop.result,
    trailer: trailer.mention,
    trailer_result: trailer_chop.result,
    context: leader_chop.traits >= 0 ? "bids" : undefined,
    leader_traits: leader_chop.traits,
    trailer_traits: trailer_chop.traits,
  }
  return t("shared.breakdown.winner", t_args)
}

module.exports = {
  makeBreakdown,
}
