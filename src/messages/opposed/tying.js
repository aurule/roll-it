const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const accept_button = require("../../components/opposed/accept-button")
const retest_picker = require("../../components/opposed/retest-picker")
const retest_button = require("../../components/opposed/retest-button")

module.exports = {
  state: "tying",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t("tying.headline", {
            leader: test.leader.mention,
            breakdown: test.breakdown,
          }),
        }),
        new TextDisplayBuilder({
          content: t("tying.cta", {
            leader: test.leader.mention,
            trailer: test.trailer.mention,
          }),
        }),
        new ActionRowBuilder({
          components: [
            accept_button.data(challenge.locale),
          ]
        }),
        new TextDisplayBuilder({
          content: t("shared.retest.cta"),
        }),
        new ActionRowBuilder({
          components: [
            retest_picker.data(challenge),
          ]
        }),
        new ActionRowBuilder({
          components: [
            retest_button.data(challenge.locale),
          ]
        }),
        new SeparatorBuilder(),
        new TextDisplayBuilder({
          content: challenge.summary,
        }),
        new TextDisplayBuilder({
          content: t("shared.history.header"),
        }),
        new TextDisplayBuilder({
          content: history.join("\n"),
        }),
      ],
    }
  }
}
