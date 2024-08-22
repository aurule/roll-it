const { SlashCommandBuilder, inlineCode, hideLinkEmbed, hyperlink, italic } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/roll-formula-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { longReply } = require("../util/long-reply")
const { injectMention } = require("../util/inject-user")
const { added } = require("../presenters/addition-presenter")

module.exports = {
  name: "roll-formula",
  description: "Roll a combination of dice and complex modifiers",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .addStringOption((option) =>
        option
          .setName("formula")
          .setDescription("The formula of dice to roll and operations to apply")
          .setMinLength(3)
          .setMaxLength(1500)
          .setRequired(true),
      )
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    formula: Joi.string().required().trim().min(3).max(1500),
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
    description: commonSchemas.description,
  }),
  perform({ formula, rolls = 1, modifier = 0, description } = {}) {
    const results = []
    const labels = []

    for (roll_idx in Array.from({ length: rolls }, (i) => i)) {
      const raw_pools = []
      const raw_results = []
      const summed_results = []

      let rolled_formula = formula.replace(
        /(\d+)d(\d+)(?:"(.*?)")?/g,
        (match, pool, sides, label, _offset, _wholeString) => {
          raw_pools.push(`${pool}d${sides}`)
          let raw = roll(pool, sides)
          raw_results.push(raw[0])
          let summed = sum(raw)
          summed_results.push(summed)
          if (roll_idx == 0) labels.push(label)
          return summed
        },
      )
      rolled_formula += added(modifier)
      results.push({
        rolledFormula: rolled_formula,
        pools: raw_pools,
        raw: raw_results,
        summed: summed_results,
        labels,
      })
    }

    return present({
      rolls,
      formula,
      description,
      results,
    })
  },
  async execute(interaction) {
    const formula = interaction.options.getString("formula")
    const roll_description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      formula,
      rolls,
      description: roll_description,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  help({ command_name }) {
    return [
      oneLine`
        ${command_name} rolls multiple pools of dice at once and can apply complex modifiers to the die results.
        Each formula should include at least one pool of dice, written as
        ${inlineCode("pool")}d${inlineCode("sides")}. All dice pools are rolled, then the math of the formula
        is applied.
      `,
      "",
      oneLine`
        ${command_name} is best used when you need to add multiple different dice pools together, like for
        weapon damage rolls in D&D. In order to keep track of which pool means what, you can also add a label
        to each pool by putting some text in quotes right after the pool, like
        ${inlineCode('2d4 + 1d6"poison" + 3')}. Here are some formula examples:
      `,
      "",
      oneLine`
        * A magical weapon damage roll might look like ${inlineCode('2d4 + 1d6"fire" + 6')}. ${command_name}
        will roll 2d4 and 1d6, add them together, then add 6. The result will include the label "fire" next to
        the result of the 1d6.
      `,
      oneLine`
        * A crafting roll could be ${inlineCode("(1d20 + 16) * 20")}. ${command_name} will roll 1d20 and add
        16, then multiply that total by 20.
      `,
      oneLine`
        * A crit damage roll in D&D 5e might look like ${inlineCode('(1d8 + 4) * 2 + 1d6"holy"')}.
        ${command_name} will roll 1d8 and add 4, multiply that result by 2, then add 1d6. The result will show
        "holy" next to the result of the 1d6.
      `,
      "",
      oneLine`
        When used as a saved roll, ${command_name} accepts a hidden ${inlineCode("modifier")} so that you can
        add a bonus to the formula with ${inlineCode("/saved roll")}.
      `,
      "",
      oneLine`
        ${command_name} uses ${hyperlink("math.js", hideLinkEmbed("https://mathjs.org"))} under the
        hood to do the calculations, so it respects proper order of operations and can do all sorts of fancy
        math. Read up on its ${hyperlink("syntax guide", hideLinkEmbed("https://mathjs.org/docs/expressions/syntax.html"))}
        and ${hyperlink("supported functions", hideLinkEmbed("https://mathjs.org/docs/reference/functions.html"))}
        if there's something really wild you want to try. Keep in mind that ${command_name} resolves all dice
        pools ${italic("before")} any other operation is evaluated.
      `,
    ].join("\n")
  },
}
