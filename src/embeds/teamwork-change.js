const { EmbedBuilder, userMention } = require('discord.js');
const { Teamwork } = require("../db/interactive")
const { i18n } = require("../locales")
const { signed } = require("../util/formatters/signed")

module.exports = {
  name: "teamwork_change",
  data: (test) => {
    const teamwork_db = new Teamwork()
    const t = i18n.getFixedT(test.locale, "interactive", "teamwork.embeds.change")

    const embed = new EmbedBuilder()
      .setColor(0x03b199)
      .setTitle(t("title"))

    const desc_args = {
      leader: userMention(test.leader),
      description: test.description,
      context: test.description ? "description" : undefined,
    }
    embed.setDescription(t("body", desc_args))

    const helper_names = []
    const helper_bonuses = []
    for (const helper of teamwork_db.allHelpers(test.id)) {
      if (helper.user_uid === test.leader) continue

      helper_names.push(module.exports.name(helper, t))
      if (helper.dice === null) helper_bonuses.push("—")
      else helper_bonuses.push(signed(helper.dice))
    }

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
    return embed
  },

  /**
   * Get the correct string for the helper
   *
   * @param  {obj}    helper Helper data object
   * @param  {i18n.t} t      Localization translate function
   * @return {str}           User name with a status icon
   */
  name(helper, t) {
    const t_args = {
      mention: userMention(helper.user_uid),
    }
    if (helper.requested) {
      if (helper.dice !== null) t_args.context = "present"
      else t_args.context = "missing"
    } else {
      t_args.context = "normal"
    }
    return t("helper", t_args)
  },
}
