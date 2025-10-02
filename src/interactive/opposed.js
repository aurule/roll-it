const { userMention } = require("discord.js")

const { Opposed } = require("../db/opposed")
const { Challenge } = require("../db/opposed/challenge")
const { Participant } = require("../db/opposed/participant")
const { logger } = require("../util/logger")
const api = require("../services/api")
const advantages_attacker_message = require("../messages/opposed/advantages-attacker")
const expired_message = require("../messages/opposed/expired")

/**
 * How long the challenge is allowed to be active, in seconds
 * @type {int}
 */
const MAX_DURATION = 7_200 // 2 hours

module.exports = {
  MAX_DURATION,
  /**
   * Begin an opposed challenge
   *
   * @param  {object}      options
   * @param  {Interaction} options.interaction Discord command interaction
   * @param  {string}      options.description String describing the challenge
   * @param  {Snowflake}   options.attackerId  Discord ID of the attacking user
   * @param  {Snowflake}   options.defenderId  Discord ID of the defending user
   * @param  {string}      options.attribute   Name of the attribute for the test
   * @param  {string}      options.retest      Name of the ability for retesting chop results
   * @return {Promise}                         Promise
   */
  async opposedBegin({ interaction, description, attackerId, defenderId, attribute, retest } = {}) {
    const locale = interaction.guild.locale ?? "en-US"

    const opposed_db = new Opposed()
    const challenge_id = opposed_db.addChallenge({
      locale,
      attacker_uid: attackerId,
      attribute,
      description,
      retest_ability: retest,
      conditions: ["normal"],
      state: Challenge.States.AdvantagesAttacker,
      channel_uid: interaction.channelId,
      timeout: MAX_DURATION,
    }).lastInsertRowid

    const attacker_mention = userMention(attackerId)
    const defender_mention = userMention(defenderId)

    opposed_db.addParticipant({
      user_uid: attackerId,
      mention: attacker_mention,
      advantages: ["none"],
      role: Participant.Roles.Attacker,
      challenge_id,
    })
    opposed_db.addParticipant({
      user_uid: defenderId,
      mention: defender_mention,
      advantages: ["none"],
      role: Participant.Roles.Defender,
      challenge_id,
    })

    return interaction
      .ensure("reply", advantages_attacker_message.data(challenge_id), {
        challenge_id,
        detail: "failed to send advantages prompt",
      })
      .then((reply_result) => {
        setTimeout(module.exports.opposedTimeout, MAX_DURATION * 1_000, challenge_id)

        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result?.resource?.message?.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id,
          message_uid,
        })
      })
  },

  /**
   * Handle the challenge timeout
   *
   * If the test is not finished, it is put into the timeout state and a summary message is sent.
   *
   * @param  {int}     challenge_id Internal ID of the challenge
   * @return {Promise}              Promise
   */
  async opposedTimeout(challenge_id) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)

    if (challenge.finished) {
      logger.info({ challenge }, "Challenge is already finished")
      return
    }

    opposed_db.setChallengeState(challenge.id, Challenge.States.Expired)
    return api
      .sendMessage(challenge.channel_uid, expired_message.data(challenge_id))
      .then((message) =>
        opposed_db.addMessage({
          message_uid: message.id,
          challenge_id,
        }),
      )
      .catch((err) =>
        logger.error(
          {
            err,
            channel: challenge.channel_uid,
            challenge,
          },
          "Unable to send opposed timeout message",
        ),
      )
  },
}
