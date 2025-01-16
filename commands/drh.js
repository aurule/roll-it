const { Collection } = require("discord.js")
const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/drh-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { DrhPool } = require("../util/rolls/drh-pool")
const { i18n } = require("../locales")
const { canonical, mapped } = require("../locales/helpers")

const command_name = "drh"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("discipline", (option) =>
        option.setRequired(true).setMinValue(1).setMaxValue(6),
      )
      .addLocalizedIntegerOption("pain", (option) => option.setRequired(true).setMinValue(1))
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("exhaustion", (option) => option.setMinValue(1).setMaxValue(6))
      .addLocalizedIntegerOption("madness", (option) => option.setMinValue(1))
      .addLocalizedStringOption("talent", (option) =>
        option.setLocalizedChoices("minor", "major", "madness"),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["exhaustion", "madness", "discipline", "pain"],
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
    description: commonSchemas.description,
    rolls: commonSchemas.rolls,
    modifier: commonSchemas.modifier,
  }),
  roll_pool(pool, pool_name) {
    if (!pool) return undefined

    const raw = roll(pool, 6)

    return new DrhPool(pool_name, raw)
  },
  perform({
    discipline,
    pain,
    exhaustion,
    madness,
    talent = "none",
    rolls = 1,
    description,
    locale = "en-US",
  } = {}) {
    const pool_options = new Collection([
      ["discipline", discipline],
      ["pain", pain],
      ["exhaustion", exhaustion],
      ["madness", madness],
    ])

    const tests = Array.from({ length: rolls }, () => {
      return pool_options.mapValues(module.exports.roll_pool).filter((pool) => pool !== undefined)
    })

    return present({
      tests,
      description,
      talent,
      rolls,
      locale,
    })
  },
  execute(interaction) {
    const discipline = interaction.options.getInteger("discipline") ?? 3
    const pain = interaction.options.getInteger("pain") ?? 1
    const exhaustion = interaction.options.getInteger("exhaustion") ?? 0
    const madness = interaction.options.getInteger("madness") ?? 0
    const talent = interaction.options.getString("talent") ?? "none"
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", "drh")

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
      description: roll_description,
      locale: interaction.locale,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
}
