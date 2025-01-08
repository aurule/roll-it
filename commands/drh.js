const {
  SlashCommandBuilder,
  inlineCode,
  italic,
  Collection,
  orderedList,
  unorderedList,
} = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/drh-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { DrhPool } = require("../util/rolls/drh-pool")
const { i18n } = require("../locales")

module.exports = {
  name: "drh",
  description: "Roll pools of d6s for Don't Rest Your Head",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addIntegerOption((option) =>
        option
          .setName("discipline")
          .setDescription("Dice in your Dicipline pool")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(6),
      )
      .addIntegerOption((option) =>
        option
          .setName("pain")
          .setDescription("Dice in the Pain pool")
          .setRequired(true)
          .setMinValue(1),
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("exhaustion")
          .setDescription("Dice in your Exhaustion pool")
          .setMinValue(1)
          .setMaxValue(6),
      )
      .addIntegerOption((option) =>
        option.setName("madness").setDescription("Dice in your Madness pool").setMinValue(1),
      )
      .addStringOption((option) =>
        option
          .setName("talent")
          .setDescription("A talent you're using for this roll")
          .setChoices([
            { name: "Minor Exhaustion", value: "minor" },
            { name: "Major Exhaustion", value: "major" },
            { name: "Madness", value: "madness" },
          ]),
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
  perform({ discipline, pain, exhaustion, madness, talent = "none", rolls = 1, description, locale = "en-US" } = {}) {
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
          return interaction.whisper(
            t("options.talent.validation.exhaustion")
          )
        }
        break;
      case "madness":
        if (madness === 0) {
          return interaction.whisper(
            t("options.talent.validation.madness")
          )
        }
        break;
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
      ephemeral: secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      `The dice mechanics for ${command_name} break down like this:`,
      orderedList([
        oneLine`
          All four pools (${opts.discipline}, ${opts.madness}, ${opts.exhaustion}, and ${opts.pain}) are
          rolled separately.
        `,
        `A die that rolls at or below 3 adds a success to its pool.`,
        oneLine`
          The successes from the ${opts.discipline}, ${opts.madness}, and ${opts.exhaustion} pools are added
          up and compared against the successes from the ${opts.pain} pool. When ${opts.pain} has more, you
          fail. When it has fewer or equal successes, you succeed.
        `,
        oneLine`
          The die results of each pool are compared again, this time from highest to lowest. The pool with the
          highest number on a die ${italic("dominates")} the roll. If pools are tied for highest, then the
          next highest number is compared. If all pools are identical, then ${opts.discipline} beats
          ${opts.madness}, ${opts.madness} beats ${opts.exhaustion}, and ${opts.exhaustion} beats
          ${opts.pain}.
        `,
      ]),
      "",
      `Tip: The printed results not only show what dominated the roll, but underline the reason why it did so.`,
      "",
      `The ${opts.talent} can modify the number of successes you compare against the ${opts.pain} result:`,
      unorderedList([
        oneLine`
          Minor Exhaustion prevents you from getting fewer successes than your ${opts.exhaustion} pool.
          ${opts.exhaustion} has to be at least 1.
        `,
        oneLine`
          Major Exhaustion adds one success to your result per die of ${opts.exhaustion}. ${opts.exhaustion}
          has to be at least 1.
        `,
        oneLine`
          Madness is required to do magic. It does not change your successes, but does require ${opts.madness}
          to be at least 1.
        `,
      ]),
      "",
      oneLine`
        When used for a saved roll, ${command_name} will apply the ${inlineCode("bonus")} from
        ${inlineCode("/saved roll")} to the ${opts.exhaustion} pool by default.
      `,
    ].join("\n")
  },
}
