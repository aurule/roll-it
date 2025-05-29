const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")

module.exports = {
  state: "bidding",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.bidding")
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: "bid some traits!"
        }),
      ],
    }
  }
}
