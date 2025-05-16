const { TextDisplayBuilder, SeparatorBuilder, ActionRowBuilder, MessageFlags } = require("discord.js")
const { i18n } = require("../../locales")

module.exports = {
  data: ({ challenge, attacker, defender }) => {
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed.throws")
    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t("request", { participant: attacker.mention })
        }),
        new SeparatorBuilder(),
        // attacker throw picker
        new TextDisplayBuilder({
          content: t("request", { participant: defender.mention })
        }),
        new SeparatorBuilder(),
        // defender throw picker
        new TextDisplayBuilder({
          content: t("cta")
        }),
        // go button
      ],
    }
  }
}


    // on throw time
    // {{attacker}}, choose your throw:
    // [throw request picker]
    // {{defender}}, choose your throw:
    // [throw request picker]
    // Click the Go button when you're ready. Once both of you click it, the chop will be thrown.
    // [:dagger:][:shield:]
