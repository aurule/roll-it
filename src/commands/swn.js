import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { roll } from "../services/swn-roller.js"
import { present } from "../presenters/results/swn-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { poolSchema, descriptionSchema, modifierSchema, rollsSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import { pickDice } from "../services/pick.js"
import { pickedSum } from "../services/tally.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"

const command_name = "swn"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("pool", (option) => option.setMinValue(2))
      .addIntegerOption(rollsOption)
      .addLocalizedBooleanOption("reroll-1s")
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier", "pool"],
  schema: Joi.object({
    pool: poolSchema.min(2),
    description: descriptionSchema,
    modifier: modifierSchema,
    rolls: rollsSchema,
  }),
  judge(results, locale) {
    const buckets = [0, 0, 0, 0, 0]
    for (const result of results) {
      switch (true) {
        case result >= 11:
          buckets[0]++
          break
        case result >= 9:
          buckets[1]++
          break
        default:
        case result >= 6:
          buckets[2]++
          break
        case result >= 4:
          buckets[3]++
          break
        case result >= 2:
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
  perform({
    pool = 2,
    rolls = 1,
    modifier = 0,
    reroll = false,
    description,
    locale = "en-US",
  } = {}) {
    const raw_results = roll(pool, rolls, reroll)
    const pick_results = pickDice(raw_results, 2, "highest")
    const summed_results = pickedSum(raw_results, pick_results)

    const presented_result = present({
      pool,
      rolls,
      reroll,
      modifier,
      description,
      raw: raw_results,
      picked: pick_results,
      summed: summed_results,
      locale,
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
    const pool = interaction.options.getInteger("pool") ?? 2
    const reroll = interaction.options.getBoolean("reroll-1s") ?? false
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      pool,
      rolls,
      modifier,
      reroll,
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
