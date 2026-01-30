import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { poolSchema, rollsSchema, untilSchema, descriptionSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import { i18n } from "../locales.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"
import { roll } from "../services/base-roller.js"
import { rollUntil } from "../services/until-roller.js"
import { riskSuccesses } from "../services/tally.js"
import {
  ShadowrunAnarchyPresenter,
} from "../presenters/results/shadowrun-anarchy-results-presenter.js"

const command_name = "sra"

/**
 * Convert the `with` keyword into a success threshold
 * @param  {string} keyword Keyword. One of "advantage", "disadvantage", or anything else.
 * @return {number}         4 for "advantage", 6 for "disadvantage", and 5 for other.
 */
function make_threshold(keyword) {
  switch (keyword) {
    case "advantage":
      return 4
    case "disadvantage":
      return 6
    default:
      return 5
  }
}

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("risk")
      .addLocalizedStringOption("with", (option) =>
        option.setLocalizedChoices("advantage", "disadvantage"),
      )
      .addIntegerOption(rollsOption)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["pool", "risk"],
  schema: Joi.object({
    pool: poolSchema,
    risk: Joi.number().optional().integer().min(1).max(1000),
    with: Joi.string().optional().valid("advantage", "disadvantage"),
    rolls: rollsSchema,
    until: untilSchema,
    description: descriptionSchema,
  }),
  judge(presenter) {
    const buckets = [0, 0, 0, 0, 0]
    let divisor = 3

    switch (presenter.threshold) {
      case 4:
        divisor = 2
        break
      case 6:
        divisor = 6
        break
    }
    let expected = Math.round(presenter.pool / divisor)

    if (presenter.risk) {
      expected = expected + expected * Math.round(presenter.risk / presenter.pool)
    }

    for (const [rollNum, result] of presenter.summed.entries()) {
      let bucket_idx
      switch (true) {
        case result >= expected * 2:
          bucket_idx = 0
          break
        case result > expected:
          bucket_idx = 1
          break
        default:
        case result === expected:
          bucket_idx = 2
          break
        case result >= expected / 2:
          bucket_idx = 3
          break
        case result < expected / 2:
          bucket_idx = 4
          break
      }
      const glitch = presenter.glitches[rollNum]
      const final = Math.min(bucket_idx + glitch, 4)
      buckets[final] += 1
    }

    const dominating = buckets.findIndex((b) => b >= presenter.summed.length / 2)
    switch (dominating) {
      case 0:
        return sacrifice.great(presenter.locale)
      case 1:
        return sacrifice.good(presenter.locale)
      case 2:
      default:
        return sacrifice.neutral(presenter.locale)
      case 3:
        return sacrifice.bad(presenter.locale)
      case 4:
        return sacrifice.awful(presenter.locale)
    }
  },
  perform({ pool, risk, advantage, rolls = 1, until, description, locale = "en-US" } = {}) {
    let raw_results
    let summed_results

    const threshold = make_threshold(advantage)

    if (until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => roll(pool, 6),
        tally: (currentResult) => riskSuccesses(currentResult, threshold, risk),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = roll(pool, 6, rolls)
      summed_results = riskSuccesses(raw_results, threshold, risk)
    }

    const presenter = new ShadowrunAnarchyPresenter({
      pool,
      threshold,
      risk,
      rolls,
      until,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })

    const result_lines = [presenter.presentResults()]

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(presenter)
      result_lines.push(`-# ${sacrifice_message}`)
    }

    return result_lines.join("\n")
  },
  async execute(interaction) {
    const pool = interaction.options.getInteger("pool")
    const risk = interaction.options.getInteger("risk") ?? 0
    const advantage = interaction.options.getString("with") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "sra")
    const userFlake = interaction.user.id

    if (risk > pool) {
      return interaction.ensure("whisper", t("options.risk.validation.collision"), {
        detail: "Could not whisper about invalid risk",
      })
    }

    const partial_message = module.exports.perform({
      pool,
      risk,
      advantage,
      rolls,
      until,
      description,
    })
    const full_text = injectMention(partial_message, userFlake)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
