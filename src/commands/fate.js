import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { roll } from "../services/base-roller.js"
import { present } from "../presenters/results/fate-results-presenter.js"
import { fudge } from "../services/tally.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { rollsSchema, modifierSchema, descriptionSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"

const command_name = "fate"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    rolls: rollsSchema,
    modifier: modifierSchema,
    description: descriptionSchema,
  }),
  judge(results, locale) {
    const buckets = [0, 0, 0, 0, 0]
    for (const result of results) {
      switch (true) {
        case result == 4:
          buckets[0]++
          break
        case result >= 2:
          buckets[1]++
          break
        default:
        case result >= -1:
          buckets[2]++
          break
        case result >= -3:
          buckets[3]++
          break
        case result == -4:
          buckets[4]++
          break
      }
    }

    const dominating = buckets.findIndex((b) => b >= results.length / 2)
    switch (dominating) {
      case 0:
        return sacrifice.great(locale)
      case 1:
        return sacrifice.good(locale)
      case 2:
      default:
        return sacrifice.neutral(locale)
      case 3:
        return sacrifice.bad(locale)
      case 4:
        return sacrifice.awful(locale)
    }
  },
  perform({ rolls = 1, modifier = 0, description, locale = "en-US" } = {}) {
    const raw_results = roll(4, 3, rolls)
    const summed_results = fudge(raw_results)

    const presented_result = present({
      rolls,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
    })

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(summed_results, locale)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
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
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
