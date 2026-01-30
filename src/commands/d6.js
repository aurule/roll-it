import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { roll } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/roll-results-presenter.js"
import { descriptionOption, poolOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, modifierSchema, poolSchema, rollsSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"

const command_name = "d6"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(poolOption)
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    description: descriptionSchema,
    modifier: modifierSchema,
    pool: poolSchema,
    rolls: rollsSchema,
  }),
  perform({ rolls = 1, modifier = 0, pool = 1, description, locale = "en-US" } = {}) {
    const raw_results = roll(pool, 6, rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls,
      pool,
      sides: 6,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const pool = interaction.options.getInteger("pool") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      pool,
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
