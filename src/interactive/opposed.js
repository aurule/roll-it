const {
  userMention,
  TextDisplayBuilder,
} = require("discord.js")

const { editMessage } = require("../services/api")
const { Opposed } = require("../db/opposed")
const { Challenge } = require("../db/opposed/challenge")
const { Participant } = require("../db/opposed/participant")
const { i18n } = require("../locales")
const { logger } = require("../util/logger")
const advantages_attacker_message = require("../messages/opposed/advantages-attacker")
const expired_message = require("../messages/opposed/expired")

/**
 * How long the challenge is allowed to be active, in seconds
 * @type {int}
 */
const MAX_DURATION = 7_200 // 2 hours

module.exports = {
  MAX_DURATION,
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
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id,
          message_uid,
        })
      })
  },

  async opposedTimeout(challenge_id) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)

    if (Challenge.FinalStates.has(challenge.state)) {
      logger.info({ challenge }, "Challenge is already finished")
      return
    }

    opposed_db.setChallengeState(challenge.id, ChallengStates.Expired)
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

  async cleanup(challenge_id) {
    // this should no longer be called most of the time
    // instead, put the challenge in a finished state and leave it for a while
    // this allows time for users to ask for a retry of the final result message
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const prompt_uid = opposed_db.getPromptUid(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    opposed_db.destroy(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const t_args = {
      attacker: attacker.mention,
      defender: defender.mention,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }
    return editMessage(challenge.channel_uid, prompt_uid, {
      components: [
        new TextDisplayBuilder({
          content: t("prompt.done", t_args),
        }),
      ],
      allowedMentions: { parse: [] },
    }).catch((error) =>
      logger.warning(
        {
          err: error,
          channel: challenge.channel_uid,
          prompt: prompt_uid,
        },
        "Unable to edit prompt message",
      ),
    )
  },
}
