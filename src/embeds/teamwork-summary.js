const { EmbedBuilder, userMention } = require('discord.js');
const { Teamwork } = require("../db/interactive")
const { i18n } = require("../locales")
const { signed } = require("../util/formatters/signed")

module.exports = {
  name: "teamwork_summary",
  data: (test) => {
    const teamwork_db = new Teamwork()
    const t = i18n.getFixedT(test.locale, "interactive", "teamwork.embeds.summary")

    const embed = new EmbedBuilder()
      .setColor(0x03b199)
      .setTitle(t("title"))

    const desc_args = {
      leader: userMention(test.leader),
      description: test.description,
      context: test.description ? "description" : undefined,
    }
    embed.setDescription(t("body", desc_args))

    const leader_field = {
      name: t("fields.leader.title"),
    }
    const helper_names = []
    const helper_bonuses = []
    for (const helper of teamwork_db.realHelpers(test.id)) {
      if (helper.user_uid === test.leader) {
        leader_field.value = t("fields.leader.body", { leader: userMention(helper.user_uid), count: helper.dice })
        continue
      }
      helper_names.push(userMention(helper.user_uid))
      if (helper.dice === null) helper_bonuses.push("")
      else helper_bonuses.push(signed(helper.dice))
    }

    embed.addFields(leader_field)

    if (helper_names.length > 0) {
      const helper_name_field = {
        name: t("fields.helper-name.title"),
        inline: true,
        value: helper_names.join("\n")
      }
      const helper_bonus_field = {
        name: t("fields.helper-bonus.title"),
        inline: true,
        value: helper_bonuses.join("\n")
      }
      embed.addFields(helper_name_field, helper_bonus_field)
    }

    return embed
  },
}
