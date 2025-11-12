const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { FfrpgPresenter } = require("../presenters/results/ffrpg-results-presenter")
const { i18n } = require("../locales")
const sacrifice = require("../services/easter-eggs/sacrifice")

const command_name = "ffrpg"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedIntegerOption("base", (option) => option.setRequired(true))
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("intrinsic")
      .addLocalizedIntegerOption("conditional")
      .addLocalizedIntegerOption("avoid")
      .addLocalizedIntegerOption("crit", (option) => option.setMinValue(0).setMaxValue(100))
      .addLocalizedIntegerOption("botch", (option) => option.setMinValue(0).setMaxValue(100))
      .addLocalizedBooleanOption("flat")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  schema: Joi.object({
    base: Joi.number().integer().required(),
    intrinsic: Joi.number().optional().integer(),
    conditional: Joi.number().optional().integer(),
    avoid: Joi.number().optional().integer(),
    crit: Joi.number().optional().integer().min(0).max(100),
    botch: Joi.number().optional().integer().min(0).max(100).greater(Joi.ref("crit")),
    description: commonSchemas.description,
    rolls: commonSchemas.rolls,
  }),
  judge(presenter, locale) {
    const buckets = [0, 0, 0, 0]

    for (let idx = 0; idx < presenter.raw.length; idx++) {
      switch (presenter.rollResult(idx)) {
        case "result.rule10":
        case "result.crit":
          buckets[0]++
          break
        case "result.simple":
          buckets[1]++
          break
        case "result.fail":
          buckets[2]++
          break
        case "result.botch":
          buckets[3]++
          break
      }

      const dominating = buckets.findIndex((b) => b >= presenter.raw.length / 2)
      switch (dominating) {
        case 0:
          return sacrifice.great(locale)
        case 1:
          return sacrifice.good(locale)
        case 3:
          return sacrifice.bad(locale)
        case 4:
          return sacrifice.awful(locale)
        default:
          return sacrifice.neutral(locale)
      }
    }
  },
  perform({
    base,
    intrinsic = 0,
    conditional = 0,
    avoid = 0,
    crit = 10,
    botch = 95,
    flat = false,
    rolls = 1,
    description,
    locale = "en-US",
  } = {}) {
    const raw_results = roll(1, 100, rolls)

    const presenter = new FfrpgPresenter({
      raw: raw_results,
      base,
      intrinsic,
      conditional,
      avoid,
      crit,
      botch,
      flat,
      rolls,
      description,
      locale,
    })

    const presented_result = presenter.presentResults()

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(presenter, locale)
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  },
  execute(interaction) {
    const base = interaction.options.getInteger("base") ?? 0
    const intrinsic = interaction.options.getInteger("intrinsic") ?? 0
    const conditional = interaction.options.getInteger("conditional") ?? 0
    const avoid = interaction.options.getInteger("avoid") ?? 0
    let crit = interaction.options.getInteger("crit") ?? 10
    let botch = interaction.options.getInteger("botch") ?? 95
    const flat = interaction.options.getBoolean("flat") ?? false
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const t = i18n.getFixedT(interaction.locale, "commands", command_name)

    if (flat) {
      if (intrinsic + conditional + avoid) {
        return interaction.whisper(t("validation.flat.disallowed"))
      }

      crit = 0
      botch = 0
    }

    if (crit && botch && crit >= botch) {
      return interaction.whisper(t("validation.crit.collision"))
    }

    const partial_message = module.exports.perform({
      rolls,
      description: roll_description,
      locale: interaction.locale,
      base,
      intrinsic,
      conditional,
      avoid,
      crit,
      botch,
      flat,
    })

    let full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
