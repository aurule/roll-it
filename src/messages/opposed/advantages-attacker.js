const {
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const withdraw_button = require("../../components/opposed/withdraw-challenge-button")
const condition_picker = require("../../components/opposed/condition-picker")
const advantage_picker = require("../../components/opposed/advantage-picker")
const ready_button = require("../../components/opposed/ready-button")

module.exports = {
  state: "advantages",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.advantages-attacker")
    const shared_t = i18n.getFixedT(challenge.locale, "interactive", "opposed.shared")

    const components = [
      new TextDisplayBuilder({
        content: t("summary", {
          attacker: attacker.mention,
          defender: defender.mention,
          description: challenge.description,
          context: challenge.description ? "description" : undefined,
          attribute: shared_t(`attributes.${challenge.attribute}`),
          retest: challenge.retest,
        }),
      }),
      new SectionBuilder({
        components: [
          new TextDisplayBuilder({
            content: t("withdraw"),
          }),
        ],
        accessory: withdraw_button.data(challenge.locale),
      }),
      new SeparatorBuilder(),
      new TextDisplayBuilder({
        content: t("conditions"),
      }),
      new ActionRowBuilder({
        components: [condition_picker.data(challenge.locale)],
      }),
      new TextDisplayBuilder({
        content: t("advantages"),
      }),
      new ActionRowBuilder({
        components: [advantage_picker.data(challenge.locale, attacker)],
      }),
      new TextDisplayBuilder({
        content: t("ready"),
      }),
      new ActionRowBuilder({
        components: [ready_button.data(challenge.locale)],
      }),
    ]

    return {
      components,
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { users: [attacker.user_uid] },
    }
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.advantages-attacker")
    const shared_t = i18n.getFixedT(challenge.locale, "interactive", "opposed.shared")

    const components = [
      new TextDisplayBuilder({
        content: t("inert", {
          attacker: attacker.mention,
          defender: defender.mention,
          description: challenge.description,
          context: challenge.description ? "description" : undefined,
          attribute: shared_t(`attributes.${challenge.attribute}`),
          conditions: challenge.conditions.map((c) => shared_t(`conditions.${c}`)),
          retest: challenge.retest,
          advantages: attacker.advantages.map((c) => shared_t(`advantages.${c}`)),
        }),
      }),
    ]

    return {
      components,
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    }
  },
}
