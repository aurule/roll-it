const { Collection } = require("discord.js")

const Chop = require("./chop")
const { compare } = require("../met-roller")

/**
 * Class for managing a single back-and-forth test as part of a larger challenge
 */
module.exports = class Test {
  /**
   * The participant who initiated the overall challenge
   * @type {Participant}
   */
  attacker

  /**
   * The participant who did not initiate the overall challenge
   * @type {Participant}
   */
  defender

  /**
   * Collection of chops for the participants in this test
   * @type {Collection<Chop>}
   */
  chops = new Collection()

  #_outcome
  #_leader

  /**
   * Create a new Test
   * @param  {Participant} attacker Attacking participant
   * @param  {Participant} defender Defending participant
   */
  constructor(attacker, defender) {
    this.attacker = attacker
    this.defender = defender
  }

  /**
   * Save the chop request for a user
   * @param  {Participant} participant Participant making the chop
   * @param  {str}         request     Chop request
   * @return {Chop}                    The new Chop object
   */
  chop(participant, request) {
    const chop = new Chop(request)
    this.chops.set(participant.id, chop)
    return chop
  }

  /**
   * Roll the result for a participant's chop
   * @param  {Participant} participant Participant to roll for
   * @return {str}                     The participant's result
   */
  roll(participant) {
    return this.chops.get(participant.id).roll()
  }

  /**
   * Roll all stored chops
   * @return {Collection<Chop>} Our chops collection
   */
  rollAll() {
    this.chops.forEach(c => c.roll())
    return this.chops
  }

  /**
   * Get a string describing this test
   *
   * All chops must have a result.
   *
   * @return {str} Explanation of the test
   */
  present() {
    return [
      this.explainLeader(),
      " (",
      this.explainChops(),
      this.explainTies(),
      ")",
    ].join("")
  }

  /**
   * Get a description of the test's leader
   *
   * All chops must have a result.
   *
   * @return {str} Name of the leader, or "tied"
   */
  explainLeader() {
    if (!this.leader) return "tied"
    return `${this.leader.mention} leads`
  }

  /**
   * Explain who leads if the chops are tied.
   *
   * This only matters when a single participant has `ties` true.
   *
   * @return {str} Explanation of win via having ties, or an empty string
   */
  explainTies() {
    if (this.leader && this.outcome === "tie") return `, ${this.leader.mention} has ties`
    return ""
  }

  /**
   * Show the chop results
   *
   * Always shows attacker result vs defender result, in that order.
   *
   * @return {str} Decorated chop results
   */
  explainChops() {
    return `${this.chops.get(this.attacker.id).present()} vs ${this.chops.get(this.defender.id).present()}`
  }

  /**
   * Get the raw outcome of the chops.
   *
   * This method does not take into account any properties on the participants.
   *
   * @type {str}
   */
  get outcome() {
    if (this.#_outcome === undefined) {
      this.#_outcome = compare(this.chops.get(this.attacker.id).result, this.chops.get(this.defender.id).result)
    }
    return this.#_outcome
  }

  /**
   * Get the leading participant
   *
   * This looks at our outcome, then falls back on the `ties` attribute of each participant to resolve a
   * winner in case of a tie. If that fails, then there is no leader and this will return null.
   *
   * @type {?Participant}
   */
  get leader() {
    if (this.#_leader === undefined) {
      switch (this.outcome) {
        case "win":
          this.#_leader = this.attacker
          break
        case "lose":
          this.#_leader = this.defender
          break
        case "tie":
          if (this.attacker.ties === this.defender.ties) this.#_leader = null
          else if (this.attacker.ties) this.#_leader = this.attacker
          else this.#_leader = this.defender
          break
      }
    }
    return this.#_leader
  }
}
