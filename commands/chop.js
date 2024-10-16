const { SlashCommandBuilder, inlineCode, subtext } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/chop-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/inject-user")

module.exports = {
  name: "chop",
  replacement: "met",
  description: "Make a rock-paper-scissors roll",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addBooleanOption((option) =>
        option
          .setName("static")
          .setDescription("Display results as pass-tie-fail, for static challenges"),
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
  perform({ static_test, bomb, rolls, description }) {
    const raw_results = roll(1, 3, rolls)

    return present({
      rolls,
      static_test,
      bomb,
      description,
      raw: raw_results,
    })
  },
  execute(interaction) {
    const static_test = interaction.options.getBoolean("static") ?? false
    const bomb = interaction.options.getBoolean("bomb") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      static_test,
      bomb,
      description: roll_description,
    })

    let full_text = injectMention(partial_message, interaction.user.id)
    full_text +=
      "\n" + subtext(`This command is being replaced. Use ${inlineCode("/met static")} instead.`)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      ephemeral: secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      `:warning: ${command_name} is deprecated. Please use ${inlineCode("/met static")} instead.`,
      "",
      oneLine`
        ${command_name} rolls a single round of rock-paper-scissors. The results are normally displayed using
        emoji and a word describing the outcome, like "\:rock: rock". The ${opts.static} option changes this to
        display ${inlineCode("pass")}, ${inlineCode("tie")}, or ${inlineCode("fail")}, to make it easier to
        interpret the result of an uncontested challenge. The ${opts.bomb} option replaces the paper result with
        bomb, which wins against rock and paper. Setting both ${opts.static} and ${opts.bomb} will change the
        ${inlineCode("tie")} result to ${inlineCode("pass")}, as the bomb result wins against the assumed paper
        result of the static opponent.
      `,
    ].join("\n")
  },
}
