const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const throw_picker = require("../../components/opposed/throw-picker")
const go_button = require("../../components/opposed/go-button")

module.exports = {
  state: "summary",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.summary")
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: "summary time!"
        }),
      ],
    }
  }
}
