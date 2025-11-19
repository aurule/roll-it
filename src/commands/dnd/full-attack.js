const Joi = require("joi")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { injectMention } = require("../../util/formatters")
const { DndAttack } = require("../../util/rolls/dnd-attack")
const { presentFullAttack } = require("../../presenters/results/dnd-results-presenter")
const commonSchemas = require("../../util/common-schemas")

const command_name = "full-attack"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedIntegerOption("swings", (option) => option.setRequired(true).setMinValue(1))
      .addLocalizedIntegerOption("modifier", (option) => option.setRequired(true))
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("crit", (option) => option.setMinValue(0).setMaxValue(21))
      .addLocalizedIntegerOption("ac", (option) => option.setMinValue(1))
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier", "ac", "swings", "crit"],
  schema: Joi.object({
    swings: Joi.number().required().integer().min(1).messages({
      "number.integer": "Swings must be a whole number.",
      "number.min": "Swings must be 1 or more.",
    }),
    modifier: commonSchemas.modifier,
    description: commonSchemas.description,
    crit: Joi.number().optional().integer().min(0).max(20).messages({
      "number.integer": "Crit must be a whole number.",
      "number.min": "crit must be between 0 and 20.",
      "number.max": "crit must be between 0 and 20.",
    }),
    ac: Joi.number().optional().integer().min(1).messages({
      "number.integer": "AC must be a whole number.",
      "number.min": "AC must be 1 or more.",
    }),
    rolls: commonSchemas.rolls,
  }),
  perform({ swings = 1, modifier = 0, crit = 20, ac = 0, description = "", rolls = 1, locale = "en-US" } = {}) {
    const attacks = Array.from({ length: rolls }, () => {
      return Array.from({ length: swings }, (_v, idx) => new DndAttack(modifier - (5*idx), crit))
    })

    const presented_results = presentFullAttack({
      swings,
      attacks,
      modifier,
      crit,
      ac,
      rolls,
      description,
      locale,
    })

    // this space reserved for easter eggs

    return presented_results
  },
  async execute(interaction) {
    const swings = interaction.options.getInteger("swings") ?? 1
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const crit = interaction.options.getInteger("crit") ?? 20
    const ac = interaction.options.getInteger("ac") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      swings,
      modifier,
      crit,
      ac,
      description,
      rolls,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
