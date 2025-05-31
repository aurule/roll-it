const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/opposed")
const throw_picker = require("../../components/opposed/throw-picker")
const go_button = require("../../components/opposed/go-button")

module.exports = {
  state: "throwing",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const attacker = participants.get("attacker")
    const defender = participants.get("defender")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.throws")

    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t("request", { participant: attacker.mention })
        }),
        new ActionRowBuilder({
          components: [
            throw_picker.data(challenge, attacker),
          ]
        }),
        new TextDisplayBuilder({
          content: t("disclaimer", { participant: attacker.mention })
        }),
        new SeparatorBuilder(),
        new TextDisplayBuilder({
          content: t("request", { participant: defender.mention })
        }),
        new ActionRowBuilder({
          components: [
            throw_picker.data(challenge, defender),
          ]
        }),
        new TextDisplayBuilder({
          content: t("disclaimer", { participant: attacker.mention })
        }),
        new SeparatorBuilder(),
        new TextDisplayBuilder({
          content: t("cta")
        }),
        new ActionRowBuilder({
          components: [
            go_button.data(challenge.locale)
          ],
        }),
      ],
    }
  },
  retryFollowup: (message) => {
    // get test
  }
}
