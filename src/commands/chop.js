const { subtext } = require("discord.js")
const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const metStatic = require("./met/static")
const { i18n } = require("../locales")

const command_name = "chop"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedBooleanOption("static")
      .addLocalizedBooleanOption("bomb")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  schema: Joi.object({
    bomb: Joi.boolean().optional(),
    description: commonSchemas.description,
    rolls: commonSchemas.rolls,
    static_test: Joi.boolean().optional(),
  }),
  perform({ static_test, bomb, rolls, description, locale = "en-US" } = {}) {
    const throw_request = bomb ? "rand-bomb" : "rand"
    const vs_request = static_test ? "rand" : "none"

    return metStatic.perform({
      throw_request,
      vs_request,
      rolls,
      description,
      locale,
    })
  },
  execute(interaction) {
    const static_test = interaction.options.getBoolean("static") ?? false
    const bomb = interaction.options.getBoolean("bomb") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "chop")

    const partial_message = module.exports.perform({
      rolls,
      static_test,
      bomb,
      description: roll_description,
      locale: interaction.locale,
    })

    let full_text = injectMention(partial_message, interaction.user.id)
    full_text += "\n" + subtext(t("response.shortcut"))
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
}
