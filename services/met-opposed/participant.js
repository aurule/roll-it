const { userMention } = require("discord.js")

/**
 * Class to track the advantages of a given user in the opposed challenge
 */
module.exports = class Participant {
  /**
   * Discord ID of the user this object represents
   * @type str
   */
  id

  /**
   * Discord mention string for our user
   * @type str
   */
  mention

  /**
   * Whether we have the bomb advantage
   * @type {Boolean}
   * @default false
   */
  bomb = false

  /**
   * Whether we win on ties
   * @type {Boolean}
   * @default false
   */
  ties = false

  /**
   * Whether we can cancel retests outside the normal ability cancel rules
   * @type {Boolean}
   * @default false
   */
  cancels = false

  /**
   * Create a new Participant
   *
   * Saves the ID and a static user mention string for later use
   *
   * @param  {str} userId Discord ID of the participating user
   */
  constructor(userId) {
    this.id = userId
    this.mention = userMention(userId)
  }
}
