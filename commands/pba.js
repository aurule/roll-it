const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const d6 = require("./d6")

const command_name = "pba"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
  }),
  perform({ rolls = 1, modifier = 0, description } = {}) {
    return d6.perform({
      rolls,
      pool: 2,
      modifier,
      description,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      description: roll_description,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
}
