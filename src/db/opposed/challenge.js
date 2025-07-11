/**
 * Class for representing challenge records
 */
class Challenge {
  /**
   * Internal ID of the associated challenge record
   * @type {int}
   */
  id

  /**
   * Locale code for translations
   * @type {string}
   */
  locale

  /**
   * Discord ID of the attacking participant
   * @type {Snowflake}
   */
  attacker_uid

  /**
   * Name of the attribute group for the challenge
   *
   * Almost always one of "mental", "physical", or "social".
   *
   * @type {string}
   */
  attribute

  /**
   * Description for the challenge
   * @type {string?}
   */
  description

  /**
   * Name of the ability expected to be used for retesting outcomes
   * @type {string}
   */
  retest_ability

  /**
   * List of condition keywords for the challenge
   * @type {string[]}
   */
  conditions

  /**
   * Generated summary of the challenge
   * @type {string?}
   */
  summary

  /**
   * State the challenge is in
   * @type {string}
   */
  state

  /**
   * Discord ID of the channel where the challenge was initiated
   * @type {Snowflake}
   */
  channel_uid

  /**
   * Number of seconds until the challenge expires
   * @type {int}
   */
  timeout

  /**
   * Whether the challenge has passed its timeout at the time of retrieval
   * @type {boolean}
   */
  expired

  /**
   * Enum of valid challenge states
   * @type {Record<string, string>}
   */
  static States = Object.freeze({
    AdvantagesAttacker: "advantages-attacker",
    AdvantagesDefender: "advantages-defender",
    Relented: "relented",
    Withdrawn: "withdrawn",
    Throwing: "throwing",
    BiddingAttacker: "bidding-attacker",
    BiddingDefender: "bidding-defender",
    Winning: "winning",
    Tying: "tying",
    Conceded: "conceded",
    Accepted: "accepted",
    Cancelling: "cancelling",
    Expired: "expired",
  })

  /**
   * Set of states which are considered final
   * @type {Set<string>}
   */
  static FinalStates = Object.freeze(
    new Set(["relented", "withdrawn", "conceded", "accepted", "expired"]),
  )

  /**
   * Database expression for use in a `WHERE state IN` clause
   *
   * @see Opposed.challengeFromMessageIsFinalized
   * @type {string}
   */
  static FinalStatesExpr = Object.freeze(
    Array.from(Challenge.FinalStates)
      .map((s) => `'${s}'`)
      .join(","),
  )

  /**
   * Enum of valid condition keywords
   * @type {Record<string, string>}
   */
  static Conditions = Object.freeze({
    Carrier: "carrier",
    Altering: "altering",
  })

  /**
   *
   * @param  {object}    options
   * @param  {int}       options.id             Internal ID of the Challenge record
   * @param  {string}    options.locale         Locale code
   * @param  {string}    options.attacker_uid   Discord ID of the initiating user
   * @param  {string}    options.attribute      Name of the attribute related to the test
   * @param  {string}    options.description    Description given for the challenge
   * @param  {string}    options.retest_ability Name of the ability for retests
   * @param  {string}    options.conditions     JSON formatted array of condition keywords
   * @param  {string}    options.summary        Generated summary of the challenge
   * @param  {string}    options.state          State of the challenge
   * @param  {string}    options.channel_uid    Discord ID of the channel where the challenge was initiated
   * @param  {int}       options.timeout        Number of seconds until the challenge expires
   * @param  {number}    options.expired        Whether the challenge is past its timeout at time of retrieval
   * @return {Challenge}                        New Challenge object
   */
  constructor({
    id,
    locale,
    attacker_uid,
    attribute,
    description,
    retest_ability,
    conditions = "[]",
    summary,
    state,
    channel_uid,
    timeout,
    expired,
} = {}) {
    this.id = id
    this.locale = locale
    this.attacker_uid = attacker_uid
    this.attribute = attribute
    this.description = description
    this.retest_ability = retest_ability
    this.conditions = JSON.parse(conditions)
    this.summary = summary
    this.state = state
    this.channel_uid = channel_uid
    this.timeout = timeout
    this.expired = !!expired
  }
}

module.exports = {
  Challenge,
}
