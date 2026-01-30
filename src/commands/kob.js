import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { rollExplode } from "../services/base-roller.js"
import { sum } from "../services/tally.js"
import { present } from "../presenters/results/kob-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"

const command_name = "kob"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("sides", (option) =>
        option
          .addChoices(
            { name: "4", value: 4 },
            { name: "6", value: 6 },
            { name: "8", value: 8 },
            { name: "10", value: 10 },
            { name: "12", value: 12 },
            { name: "20", value: 20 },
            { name: "100", value: 100 },
          )
          .setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    sides: Joi.number().required().integer().valid(4, 6, 8, 10, 12, 20, 100),
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  }),
  perform({ rolls = 1, modifier = 0, description, sides, locale = "en-US" } = {}) {
    const raw_results = rollExplode(1, sides, sides, rolls)

    return present({
      sides,
      rolls,
      modifier,
      description,
      raw: raw_results,
      summed: sum(raw_results),
      locale,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const sides = interaction.options.getInteger("sides") ?? 4
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
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
