const { Collection } = require("discord.js")

/**
 * Special class for handling opposed test records
 *
 * The main feature is that this class will lazy-load and pouplate the various related participant records.
 *
 * @class
 */
class OpTest {
  id
  challenge_id
  locale
  retester_id = null
  retest_reason = null
  retested = false
  canceller_id = null
  cancelled_with = null
  cancelled = false
  history = null
  breakdown = null
  leader_id = null

  opposed_db
  records

  constructor({
    id,
    challenge_id,
    locale,
    retester_id = null,
    retest_reason = null,
    canceller_id = null,
    cancelled_with = null,
    history = null,
    breakdown = null,
    leader_id = null,
    opposed_db,
  } = {}) {
    this.id = id
    this.challenge_id = challenge_id
    this.locale = locale
    this.retester_id = retester_id
    this.retest_reason = retest_reason
    this.retested = !!retested
    this.canceller_id = canceller_id
    this.cancelled_with = cancelled_with
    this.cancelled = !!cancelled
    this.history = history
    this.breakdown = breakdown
    this.leader_id = leader_id

    this.opposed_db = opposed_db

    this.records = new Collection()
  }

  populateParticipants(key) {
    const { ParticipantRoles } = require("../opposed")
    const participants = this.opposed_db.getParticipants(this.challenge_id, true)
    this.records.set("leader", participants.get(this.leader_id))
    this.records.set("trailer", participants.find(p => p.id != this.leader_id))
    this.records.set("retester", participants.get(this.retester_id))
    this.records.set("canceller", participants.get(this.canceller_id))
    this.records.set("attacker", participants.find(p => p.role === ParticipantRoles.Attacker))
    this.records.set("defender", participants.find(p => p.role === ParticipantRoles.Defender))
    return this.records.get(key)
  }

  get leader() {
    return this.records.ensure("leader", this.populateParticipants)
  }

  get trailer() {
    return this.records.ensure("trailer", this.populateParticipants)
  }

  get retester() {
    return this.records.ensure("retester", this.populateParticipants)
  }

  get canceller() {
    return this.records.ensure("canceller", this.populateParticipants)
  }

  get attacker() {
    return this.records.ensure("attacker", this.populateParticipants)
  }

  get defender() {
    return this.records.ensure("defender", this.populateParticipants)
  }

  get challenge() {
    return this.records.ensure("challenge", () => this.opposed_db.getChallenge(this.challenge_id))
  }
}

module.exports = {
  OpTest,
}
