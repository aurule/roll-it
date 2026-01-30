import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { roll } from "../services/base-roller.js"
import { present } from "../presenters/results/d20-results-presenter.js"
import { pickDice, strategies } from "../services/pick.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, modifierSchema, poolSchema, rollsSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { with_to_keep } from "../util/with-to-keep.js"

const command_name = "d20"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedStringOption("with", (option) =>
        option.setLocalizedChoices("advantage", "disadvantage"),
      )
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    modifier: modifierSchema,
    keep: Joi.string()
      .optional()
      .valid(...strategies)
      .messages({
        "any.only": "Keep must be one of 'all', 'highest', or 'lowest'.",
      }),
    with: Joi.string().optional().valid("advantage", "disadvantage"),
    rolls: rollsSchema,
    description: descriptionSchema,
  }).oxor("keep", "with"),
  judge(picked, locale) {
    const buckets = picked
      .reduce(
        (acc, cur) => {
          const bucket = Math.ceil(cur.results[0] / 4) - 1
          acc[bucket]++
          return acc
        },
        [0, 0, 0, 0, 0],
      )
      .reverse()

    const dominating = buckets.findIndex((b) => b >= picked.length / 2)
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
    keep = "all",
    rolls = 1,
    modifier = 0,
    locale = "en-US",
    description,
    ...others
  } = {}) {
    if (others.with) keep = with_to_keep(others.with)

    const pool = keep == "all" ? 1 : 2

    const raw_results = roll(pool, 20, rolls)
    const pick_results = pickDice(raw_results, 1, keep)

    const presented_result = present({
      rolls,
      modifier,
      description,
      keep,
      raw: raw_results,
      picked: pick_results,
      locale,
    })

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(pick_results, locale)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const keep = with_to_keep(interaction.options.getString("with"))
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      description: roll_description,
      keep,
      locale: interaction.locale,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
