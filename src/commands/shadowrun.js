import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { rollUntil } from "../services/until-roller.js"
import { rollExplode } from "../services/base-roller.js"
import { successes } from "../services/tally.js"
import { ShadowrunPresenter, present } from "../presenters/results/shadowrun-results-presenter.js"
import { teamworkBegin } from "../interactive/teamwork.js"
import { descriptionOption, rollsOption, teamworkOption, secretOption } from "../util/common-options.js"
import { poolSchema, rollsSchema, untilSchema, descriptionSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import { i18n } from "../locales/index.js"
import * as sacrifice from "../services/easter-eggs/sacrifice.js"

const command_name = "shadowrun"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("pool", (option) =>
        option.setMinValue(1).setMaxValue(1000).setRequired(true),
      )
      .addStringOption(descriptionOption)
      .addLocalizedBooleanOption("edge")
      .addIntegerOption(rollsOption)
      .addBooleanOption(teamworkOption)
      .addLocalizedIntegerOption("until", (option) => option.setMinValue(1))
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["pool"],
  schema: Joi.object({
    pool: poolSchema,
    edge: Joi.boolean().optional(),
    rolls: rollsSchema,
    until: untilSchema,
    description: descriptionSchema,
  }),
  teamwork: {
    roller: (final_pool, { explode }) => rollExplode(final_pool, 6, explode, 1),
    summer: (raw_results) => successes(raw_results, 5),
    presenter: (final_pool, raw_results, summed_results, locale, { edge, description }) =>
      present({
        rolls: 1,
        pool: final_pool,
        edge,
        until: 0,
        description,
        raw: raw_results,
        summed: summed_results,
        locale,
      }),
  },
  judge(presenter) {
    const buckets = [0, 0, 0, 0, 0]
    const expected = Math.round(presenter.pool / 3)

    for (const rollNum of presenter.summed.keys()) {
      const result = presenter.summed[rollNum]
      switch (true) {
        case presenter.glitch(rollNum) && result === 0:
          buckets[4]++
          break
        case presenter.glitch(rollNum):
          buckets[3]++
          break
        case result >= expected * 2:
          buckets[0]++
          break
        case result > expected:
          buckets[1]++
          break
        default:
        case result >= expected / 2:
          buckets[2]++
          break
      }
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
  perform({ pool, edge, rolls = 1, until, description, locale = "en-US" } = {}) {
    let raw_results
    let summed_results

    const explode = edge ? 6 : 7

    if (until) {
      ;({ raw_results, summed_results } = rollUntil({
        roll: () => rollExplode(pool, 6, explode),
        tally: (currentResult) => successes(currentResult, 5),
        max: rolls === 1 ? 0 : rolls,
        target: until,
      }))
    } else {
      raw_results = rollExplode(pool, 6, explode, rolls)
      summed_results = successes(raw_results, 5)
    }

    const presenter = new ShadowrunPresenter({
      rolls,
      pool,
      edge,
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
    const edge = interaction.options.getBoolean("edge") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const until = interaction.options.getInteger("until") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false
    const is_teamwork = interaction.options.getBoolean("teamwork") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "shadowrun")

    const userFlake = interaction.user.id

    if (is_teamwork) {
      if (rolls > 1 || until > 0 || secret) {
        return interaction.whisper(t("options.teamwork.validation.conflict"))
      }

      const explode = edge ? 6 : 7
      const teamwork_options = {
        roller: { explode },
        summer: {},
        presenter: { edge, description },
      }

      return teamworkBegin({
        interaction,
        description,
        command: command_name,
        options: teamwork_options,
        pool,
      })
    }

    const partial_message = module.exports.perform({
      rolls,
      pool,
      edge,
      until,
      description,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, userFlake)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
