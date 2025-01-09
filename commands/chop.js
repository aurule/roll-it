const { SlashCommandBuilder, inlineCode, subtext, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const metStatic = require("./met/static")
const { i18n } = require("../locales")

module.exports = {
  name: "chop",
  description: "Make a rock-paper-scissors roll",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addBooleanOption((option) =>
        option
          .setName("static")
          .setDescription("Display win-tie-lose against a random opponent, for static challenges"),
      )
      .addBooleanOption((option) =>
        option.setName("bomb").setDescription("Replace paper with the special bomb result"),
      )
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
  help({ command_name, ...opts }) {
    return [
      oneLine`
        ${command_name} rolls a single round of rock-paper-scissors. The results are normally displayed using
        emoji and a word describing your throw, like "\:rock: rock". The ${opts.static} option adds a virtual
        opponent and displays the outcome as a win, tie, or fail.
      `,
      "",
      oneLine`
        By default, ${command_name} picks one of rock, paper, or scissors for you. The ${opts.bomb} option
        replaces the paper symbol with bomb, which wins against rock ${italic("and")} paper. The virtual
        opponent from ${opts.static} always picks from rock, paper, or scissors, never bomb.
      `,
      "",
      oneLine`
        ${command_name} is a shortcut for the more powerful ${inlineCode("/met static")} command. Use that
        one to pick your thrown symbol and make static tests against an opponent who can throw bomb.
      `,
    ].join("\n")
  },
}
