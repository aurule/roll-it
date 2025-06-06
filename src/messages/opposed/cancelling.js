const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")

module.exports = {
  state: "accepted",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    // todo make cancelling prompt

    const t_args = {
      summary: challenge.summary,
    }
    return {
      withResponse: true,
      content: "cancel time"
    }
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    // todo show cancelling summary with no controls

    const t_args = {
      summary: challenge.summary,
    }
    return {
      withResponse: true,
      content: "done cancellin'"
    }
  }
}
