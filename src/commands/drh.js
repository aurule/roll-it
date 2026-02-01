import { Collection } from "discord.js"
import Joi from "joi"

import { LocalizedSlashCommandBuilder } from "../util/localized-command.js"
import { present } from "../presenters/results/drh-results-presenter.js"
import { descriptionOption, rollsOption, secretOption } from "../util/common-options.js"
import { descriptionSchema, rollsSchema, modifierSchema } from "../util/common-schemas.js"
import { injectMention } from "../util/formatters/inject-user.js.js"
import { DrhPool } from "../util/rolls/drh-pool.js"
import { i18n } from "../locales/index.js"

const command_name = "drh"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("discipline", (option) =>
        option.setRequired(true).setMinValue(1).setMaxValue(6),
      )
      .addLocalizedIntegerOption("pain", (option) =>
        option.setRequired(true).setMinValue(0).setMaxValue(100),
      )
      .addStringOption(descriptionOption)
      .addLocalizedIntegerOption("exhaustion", (option) => option.setMinValue(1).setMaxValue(6))
      .addLocalizedIntegerOption("madness", (option) => option.setMinValue(1))
      .addLocalizedStringOption("talent", (option) =>
        option.setLocalizedChoices("minor", "major", "madness"),
      )
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(rollsOption)
      .addBooleanOption(secretOption),
  savable: true,
  changeable: ["modifier", "exhaustion", "madness", "discipline", "pain"],
  schema: Joi.object({
    discipline: Joi.number().required().integer().min(1).max(6),
    pain: Joi.number().required().integer().min(1).max(100),
    exhaustion: Joi.number()
      .optional()
      .integer()
      .min(1)
      .max(6)
      .when("talent", {
        is: Joi.string().valid("minor", "major"),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    madness: Joi.number()
      .integer()
      .min(1)
      .max(8)
      .when("talent", {
        is: Joi.string().valid("madness"),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    talent: Joi.string().optional().valid("minor", "major", "madness").default("none").messages({
      "any.only": "Talent must be one of 'minor', 'major', or 'madness'.",
    }),
    description: descriptionSchema,
    rolls: rollsSchema,
    modifier: modifierSchema,
  }),
  perform({
    discipline,
    pain,
    exhaustion,
    madness,
    talent = "none",
    rolls = 1,
    description,
    modifier = 0,
    locale = "en-US",
  } = {}) {
    if (pain === 0) {
      const pool_options = new Collection([["discipline", discipline]])

      const tests = Array.from({ length: rolls }, () => {
        return pool_options.mapValues(DrhPool.fromPool).filter((pool) => pool !== undefined)
      })

      return present({
        helper: true,
        tests,
        description,
        rolls,
        locale,
      })
    }

    const pool_options = new Collection([
      ["discipline", discipline],
      ["pain", pain],
      ["exhaustion", exhaustion],
      ["madness", madness],
    ])

    const tests = Array.from({ length: rolls }, () => {
      return pool_options.mapValues(DrhPool.fromPool).filter((pool) => pool !== undefined)
    })

    return present({
      tests,
      description,
      talent,
      rolls,
      modifier,
      locale,
    })
  },
  execute(interaction) {
    const discipline = interaction.options.getInteger("discipline") ?? 3
    const pain = interaction.options.getInteger("pain") ?? 1
    const exhaustion = interaction.options.getInteger("exhaustion") ?? 0
    const madness = interaction.options.getInteger("madness") ?? 0
    const talent = interaction.options.getString("talent") ?? "none"
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "drh")

    if (pain === 0) {
      if (talent !== "none") {
        return interaction.whisper(t("response.helping.validation.talent"))
      }

      if (exhaustion || madness) {
        return interaction.whisper(t("response.helping.validation.pools"))
      }

      if (modifier) {
        return interaction.whisper(t("response.helping.validation.modifier"))
      }

      const partial_message = module.exports.perform({
        pain,
        rolls,
        discipline,
        description: roll_description,
        locale: interaction.locale,
      })
    }

    switch (talent) {
      case "minor":
      case "major":
        if (exhaustion === 0) {
          return interaction.whisper(t("options.talent.validation.exhaustion"))
        }
        break
      case "madness":
        if (madness === 0) {
          return interaction.whisper(t("options.talent.validation.madness"))
        }
        break
    }

    const partial_message = module.exports.perform({
      rolls,
      discipline,
      pain,
      exhaustion,
      madness,
      talent,
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
