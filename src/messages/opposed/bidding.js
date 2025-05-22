const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { Opposed } = require("../../db/interactive")
const { i18n } = require("../../locales")
const throw_picker = require("../../components/opposed/throw-picker")
const go_button = require("../../components/opposed/go-button")

module.exports = {
  data: (test_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.findChallengeByTest(test_id)

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
