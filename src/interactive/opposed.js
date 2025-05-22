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
const { Opposed, ParticipantRoles } = require("../db/interactive")
const { i18n } = require("../locales")
const { logger } = require("../util/logger")
const withdraw_button = require("../components/opposed/withdraw-challenge-button")
const relent_button = require("../components/opposed/relent-button")
const advantage_picker = require("../components/opposed/advantage-picker")
const ready_button = require("../components/opposed/ready-button")

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
      role: ParticipantRoles.Defender,
      challenge_id,
    })

    const components = [
      new TextDisplayBuilder({
        content: t("summary", {
          attacker: attacker_mention,
          defender: defender_mention,
          description,
          context: description ? "description" : undefined,
          attribute: shared_t(`attributes.${attribute}`),
          conditions: conditions.map(c => shared_t(`conditions.${c}`)),
          retest,
          advantages: advantages.map(c => shared_t(`advantages.${c}`)),
        }),
      }),
      new SectionBuilder({
        components: [
          new TextDisplayBuilder({
            content: t("withdraw", {
              attacker: attacker_mention,
            }),
          }),
        ],
        accessory: withdraw_button.data(locale),
      }),
      new SeparatorBuilder(),
      new SectionBuilder({
        components: [
          new TextDisplayBuilder({
            content: t("relent", {
              defender: defender_mention,
              attacker: attacker_mention,
            }),
          }),
        ],
        accessory: relent_button.data(locale),
      }),
      new TextDisplayBuilder({
        content: t("advantages"),
      }),
      new ActionRowBuilder({
        components: [
          advantage_picker.data(locale),
        ],
      }),
      new TextDisplayBuilder({
        content: t("ready"),
      }),
      new ActionRowBuilder({
        components: [
          ready_button.data(locale),
        ],
      }),
    ]

    return interaction
      .reply({
        components,
        withResponse: true,
        flags: MessageFlags.IsComponentsV2,
      })
      .then((reply_interaction) => {
        setTimeout(module.exports.opposedTimeout, MAX_DURATION, challenge_id)

        opposed_db.addMessage({
          challenge_id,
          message_uid: reply_interaction.resource.message.id,
        })
      })
      .catch((error) =>
        logger.error(
          {
            err: error,
            challenge_id,
            channel: interaction.channelId,
          },
          "Could not reply with initial opposed prompt",
        ),
      )

    // status and summary
    // {{leader}} is currently winning! (:rock: rock *vs* :scissors: scissors)
    //   {{leader}} is currently winning! (:rock: rock *vs* :rock: rock, {{leader}} has ties)
    // {{trailer}}: If you are out of retests, you can concede to {{leader}}. [concede]
    // Either of you may retest for a new result:
    // [retest reason]
    // [retest]
    // --separator--
    // {{attacker}} is challenging {{defender}} to {{an attribute}} test. This is a {{condisions}} attack. The named retest is {{retest}}.
    // {{attacker}} has {{bomb, ties}}.
    // {{defender}} has {{bomb}}.
    // Test history:
    // * {{leader}} leads (:rock: rock *vs* {{trailer}}'s :scissors: scissors')

    // alternate status lines when actually tied
    // The challenge is tied. (:rock: rock *vs* :rock: rock)
    // {{attacker}} and {{defender}}: If you both decide to compare traits, the chops will end with no automatic winner. [compare]

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

    if (test === undefined) {
      logger.info({
        challenge_id,
      },
      "Opposed challenge completed before timeout")
      return
    }

    module.exports.cleanup(challenge_id)

    const t = i18n.getFixedT(test.locale, "interactive", "opposed")

    // with no results
    // The challenge from {{attacker}} against {{defender}} ?(for "{{description}}") ran out of time and was automatically withdrawn.

    // with attacker leading
    // The challenge from {{attacker}} against {{defender}} ?(for "{{description}}") ran out of time and has automatically ended. At the time, {{attacker}} was winning (:rock: rock *vs* :scissors: scissors).
    // {{history}}

    // with defender leading
    // The challenge from {{attacker}} against {{defender}} ?(for "{{description}}") ran out of time and has automatically ended. At the time, {{defender}} was winning (:rock: rock *vs* :scissors: scissors).
    // {{history}}

    // with tied outcome
    // The challenge from {{attacker}} against {{defender}} ?(for "{{description}}") ran out of time and has automatically ended. At the time, both were tied (:rock: rock *vs* :rock: rock).
    // {{history}}
  },

  async cleanup(challenge_id) {
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
