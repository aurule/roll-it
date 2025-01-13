const { oneLine } = require("common-tags")
const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { rollExplode } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/results/kob-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "kob"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
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
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    sides: Joi.number().required().integer().valid(4, 6, 8, 10, 12, 20, 100),
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
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
      split_on: "\n\t",
      secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      oneLine`
      If a die rolls its highest number, it explodes and adds another die to the pool. Since Roll It doesn't
      know the difficulty of the test, ${command_name} will keep exploding indefinitely. This is technically a
      break from the Kids On Bikes rules, where dice stop exploding once a roll succeeds.
    `,
      "",
      oneLine`
      ${opts.sides} allows the standard polyhedral dice (4, 6, 8, 10, 12, and 20), as well as the percentile
      die (d100).
    `,
    ].join("\n")
  },
}
