const {
  TimestampStyles,
  userMention,
  time,
  MessageFlags,
  SectionBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  SeparatorBuilder,
} = require("discord.js")

const { sendMessage, editMessage } = require("../services/api")
const { Opposed, ParticipantRoles, ChallengeStates, FINAL_STATES } = require("../db/opposed")
const { i18n } = require("../locales")
const { logger } = require("../util/logger")
const advantages_message = require("../messages/opposed/advantages")
const expired_message = require("../messages/opposed/expired")

const MAX_DURATION = 1_200_000 // 20 minutes
const RETEST_DURATION_BONUS = 300_000 // 5 minutes

module.exports = {
  MAX_DURATION,
  RETEST_DURATION_BONUS,
  async opposedBegin({
    interaction,
    description,
    attackerId,
    defenderId,
    attribute,
    retest,
    allow_retests = true,
    carrier = false,
    altering = false,
    bomb = false,
    ties = false,
    cancels = false
  } = {}) {
    const locale = interaction.guild.locale ?? "en-US"
    const t = i18n.getFixedT(locale, "interactive", "opposed.prompt")
    const shared_t = i18n.getFixedT(locale, "interactive", "opposed.shared")

    const conditions = []
    if (carrier) conditions.push("carrier")
    if (altering) conditions.push("altering")
    if (!conditions.length) conditions.push("normal")

    const opposed_db = new Opposed()
    const challenge_id = opposed_db.addChallenge({
      locale,
      attacker_uid: attackerId,
      attribute,
      description,
      retests_allowed: allow_retests,
      retest_ability: retest,
      conditions,
      state: ChallengeStates.Advantages,
      channel_uid: interaction.channelId,
      timeout: MAX_DURATION / 1_000,
    }).lastInsertRowid

    const attacker_mention = userMention(attackerId)
    const defender_mention = userMention(defenderId)

    const advantages = []
    if (bomb) advantages.push("bomb")
    if (ties) advantages.push("ties")
    if (cancels) advantages.push("cancels")
    if (!advantages.length) advantages.push("none")

    opposed_db.addParticipant({
      user_uid: attackerId,
      mention: attacker_mention,
      advantages,
      role: ParticipantRoles.Attacker,
      challenge_id,
    })
    opposed_db.addParticipant({
      user_uid: defenderId,
      mention: defender_mention,
      advantages: ["none"],
      role: ParticipantRoles.Defender,
      challenge_id,
    })

    return interaction
      .ensure(
        "reply",
        advantages_message.data(challenge_id),
        {
          challenge_id,
          detail: "failed to send advantages prompt"
        }
      )
      .then((reply_result) => {
        setTimeout(module.exports.opposedTimeout, MAX_DURATION, challenge_id)

        // expect an InteractionCallbackResponse, but deal with a Message too
        const message_uid = reply_result.resource.message.id ?? reply_result.id

        opposed_db.addMessage({
          challenge_id,
          message_uid,
        })
      })

    // alternate status lines when actually tied
    // The challenge is tied. (:rock: rock *vs* :rock: rock)
    // {{attacker}} and {{defender}}: If you both decide to compare traits, the chops will end with no automatic winner.
    // [compare]

    // on retest
    // {{retester}} is retesting with {{reason}}. If this was an accident, you can withdraw the retest. [withdraw]
    // {{canceller}} may cancel.
    // [cancel with picker]
    // [cancel][proceed]

    // on retest with cancels
    // ...may cancel
    // -# You can cancel without using an ability, so you will see this prompt for every retest from {{retester.mention}}.
  },

  async opposedTimeout(challenge_id) {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)

    if (FINAL_STATES.has(challenge.state)) {
      logger.info({ challenge }, "Challenge is already finished")
      return
    }

    opposed_db.setChallengeState(challenge.id, ChallengStates.Expired)
    return api
      .sendMessage(challenge.channel_uid, expired_message.data(challenge_id))
      .then(message => opposed_db.addMessage({
        message_uid: message.id,
        challenge_id,
      }))
      .catch(err => logger.error(
        {
          err,
          channel: challenge.channel_uid,
          challenge,
        },
        "Unable to send opposed timeout message"
      ))
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
      context: challenge.description ? "description" : undefined
    }
    return editMessage(challenge.channel_uid, prompt_uid, {
      components: [
        new TextDisplayBuilder({
          content: t("prompt.done", t_args),
        })
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
  }
}
