import Joi from "joi"

import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { injectMention } from "../../util/formatters/inject-user.js.js"
import { DndAttack } from "../../util/rolls/dnd-attack.js"
import { presentAttack } from "../../presenters/results/dnd-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../../util/common-options.js"
import { modifierSchema, descriptionSchema, rollsSchema } from "../../util/common-schemas.js"

const command_name = "attack"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedIntegerOption("modifier", (option) => option.setRequired(true))
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("crit", (option) => option.setMinValue(0).setMaxValue(20))
      .addLocalizedIntegerOption("ac", (option) => option.setMinValue(1))
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier", "ac", "crit"],
  schema: Joi.object({
    modifier: modifierSchema,
    description: descriptionSchema,
    crit: Joi.number().optional().integer().min(0).max(20).messages({
      "number.integer": "Crit must be a whole number.",
      "number.min": "crit must be between 0 and 20.",
      "number.max": "crit must be between 0 and 20.",
    }),
    ac: Joi.number().optional().integer().min(1).messages({
      "number.integer": "AC must be a whole number.",
      "number.min": "AC must be 1 or more.",
    }),
    rolls: rollsSchema,
  }),
  perform({ modifier = 0, crit = 20, ac = 0, description = "", rolls = 1, locale = "en-US" } = {}) {
    const attacks = Array.from({ length: rolls }, () => new DndAttack(modifier, crit))

    const presented_results = presentAttack({
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
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const crit = interaction.options.getInteger("crit") ?? 20
    const ac = interaction.options.getInteger("ac") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
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
