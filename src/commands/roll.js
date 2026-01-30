import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { roll } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/roll-results-presenter.js"
import { poolOption, descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { poolSchema, descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"

const command_name = "roll"

module.exports = {
  name: command_name,
  global: true,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addIntegerOption((opt) => poolOption(opt).setRequired(true))
      .addLocalizedIntegerOption("sides", (option) => option.setMinValue(2).setRequired(true))
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier", "pool"],
  schema: Joi.object({
    pool: poolSchema,
    sides: Joi.number().required().integer().min(2).max(100000),
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  }),
  perform({ pool, sides, description, modifier = 0, rolls = 1, locale = "en-US" } = {}) {
    const raw_results = roll(pool, sides, rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls,
      pool,
      sides,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })
  },
  execute(interaction) {
    const pool = interaction.options.getInteger("pool")
    const sides = interaction.options.getInteger("sides")
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      pool,
      sides,
      modifier,
      description: roll_description,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
