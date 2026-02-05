import { subtext } from "discord.js"
import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, rollsSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js"
const metStatic = require("./met/static")
import { i18n } from "../locales/index.js"

const command_name = "chop"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(descriptionOption)
      .addLocalizedBooleanOption("static")
      .addLocalizedBooleanOption("bomb")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  schema: Joi.object({
    bomb: Joi.boolean().optional(),
    description: descriptionSchema,
    rolls: rollsSchema,
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
      secret,
    })
  },
}
