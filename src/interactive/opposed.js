const {
  TimestampStyles,
  userMention,
  time,
  MessageFlags,
  SectionBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  SeparatorBuilder,

  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js")

const { sendMessage, editMessage } = require("../services/api")
const { Opposed } = require("../db/interactive")
const { i18n } = require("../locales")
const { logger } = require("../util/logger")
const withdraw_button = require("../components/opposed/withdraw-challenge-button")

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

    // create participant records for attacker and defender
    // show initial prompt
    // store prompt as message record

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
        // relent button
        accessory: new ButtonBuilder({
          label: "Relent",
          customId: "opposed_relent",
          style: ButtonStyle.Secondary,
        }),
      }),
      new TextDisplayBuilder({
        content: t("advantages"),
      }),
      new ActionRowBuilder({
        components: [
          // advantage picker
          new StringSelectMenuBuilder({
            customId: "opposed_advantage_select",
            placeholder: "Select your advantages",
            // * :firecracker: I have bomb <Lets you throw Bomb in place of Paper>
            // * :neq: I have ties <You have an ability that lets you automatically win ties>
            // * :prohibited: I have cancels <You have some way to cancel retests besides an ability>
            options: [{
              label: "bomb",
              value: "bomb",
            }]
          }),
        ],
      }),
      new TextDisplayBuilder({
        content: t("ready"),
      }),
      new ActionRowBuilder({
        components: [
          // ready button
          new ButtonBuilder({
            customId: "opposed_ready",
            label: "Ready",
            style: ButtonStyle.Success,
          })
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
        // setTimeout(module.exports.opposedTimeout, MAX_DURATION, challenge_id)

        // opposed_db.addMessage({
        //   challenge_id,
        //   message_uid: reply_interaction.resource.message.id,
        // })
      })
      .catch((error) =>
        logger.error(
          {
            err: error,
            command: command,
            leader: leader_id,
            channel: interaction.channelId,
          },
          "Could not reply with initial teamwork prompt",
        ),
      )

    // on readied up, edit the message
    // {{attacker}} is challenging {{defender}} with {{an attribute}} test. This is a {{conditions}} attack. The named retest is {{retest}}.
    // {{attacker}} has {{bomb, ties}}.
    // {{defender}} has {{bomb}}.

    // on throw time
    // {{attacker}}, choose your throw:
    // [throw request picker]
    // {{defender}}, choose your throw:
    // [throw request picker]
    // Click the Go button when you're ready. Once both of you click it, the chop will be thrown.
    // [:dagger:][:shield:]

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
    // get challenge data
    // cleanup(challenge_id)
    // send timeout message
  },

  async cleanup(challenge_id) {
    // get challenge data
    // destroy challenge record
  }
}
