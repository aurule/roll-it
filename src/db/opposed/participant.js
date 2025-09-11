/**
 * Class for representing participant records
 */
class Participant {
  /**
   * Internal ID of the participant record
   * @type {int}
   */
  id

  /**
   * Discord ID of the participating user
   * @type {Snowflake}
   */
  user_uid

  /**
   * Generated discord mention string for the user
   * @type {string}
   */
  mention

  /**
   * Array of advantage keywords
   * @type {string[]}
   */
  advantages

  /**
   * Whether this participant wins tied chops for this challenge
   *
   * This flag is calculated by comparing the presence of the "ties" advantage on both participants.
   *
   * @type {boolean}
   */
  tie_winner

  /**
   * Whether this participant has used an ability on this challenge
   * @type {boolean}
   */
  ability_used

  /**
   * The role of this user in the challenge
   * @type {int}
   */
  role

  /**
   * Internal ID of the challenge this user is participating in
   * @type {int}
   */
  challenge_id

  /**
   * Enum of valid advantage keywords
   * @type {Record<string, string>}
   */
  static Advantages = Object.freeze({
    None: "none",
    Bomb: "bomb",
    Ties: "ties",
    Cancels: "cancels",
  })

  /**
   * Enum of valid role values
   * @type {Record<string, int>}
   */
  static Roles = Object.freeze({
    Attacker: 1,
    Defender: 2,
  })

  /**
   * Create a new Participant object
   *
   * @param {object}    options
   * @param {int}       options.id           Internal ID of the record
   * @param {Snowflake} options.user_uid     Discord ID of the participating user
   * @param {string}    options.mention      Mention string for including in messages
   * @param {string}    options.advantages   JSON formatted array of advantage keywords
   * @param {number}    options.tie_winner   Whether this participant wins ties against its partner
   * @param {number}    options.ability_used Whether this participant has used an ability on the current challenge
   * @param {int}       options.role         Role identifier for attacker or defender
   * @param {int}       options.challenge_id Internal ID of the challenge they're participating in
   * @return {Participant} New Participant object
   */
  constructor({
    id,
    user_uid,
    mention,
    advantages = "[]",
    tie_winner = 0,
    ability_used = 0,
    role,
    challenge_id,
  } = {}) {
    this.id = id
    this.user_uid = user_uid
    this.mention = mention
    this.advantages = JSON.parse(advantages)
    this.tie_winner = !!tie_winner
    this.ability_used = !!ability_used
    this.role = role
    this.challenge_id = challenge_id
  }
}

module.exports = {
  Participant,
}
