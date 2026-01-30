import Joi from "joi"

import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { injectMention } from "../../util/formatters/inject-user.js.js"
import { roll } from "../../services/base-roller.js"
import { presentSave } from "../../presenters/results/dnd-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../../util/common-options.js"
import { modifierSchema, descriptionSchema, rollsSchema } from "../../util/common-schemas.js"

const command_name = "save"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("dc", (option) => option.setMinValue(1))
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier", "dc"],
  schema: Joi.object({
    modifier: modifierSchema,
    description: descriptionSchema,
    dc: Joi.number().optional().integer().min(1).messages({
      "number.integer": "DC must be a whole number.",
      "number.min": "DC must be 1 or more.",
    }),
    rolls: rollsSchema,
  }),
  perform({ modifier = 0, dc = 0, description = "", rolls = 1, locale = "en-US" } = {}) {
    const raw_results = roll(1, 20, rolls)
    const presented_results = presentSave({
      raw: raw_results,
      modifier,
      dc,
      rolls,
      description,
      locale,
    })

    // this space reserved for easter eggs

    return presented_results
  },
  async execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const dc = interaction.options.getInteger("dc") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      modifier,
      dc,
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
