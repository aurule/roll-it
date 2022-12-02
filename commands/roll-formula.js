const {
  SlashCommandBuilder,
  inlineCode,
  hideLinkEmbed,
  hyperlink,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/roll-formula-results-presenter")

module.exports = {
  name: "roll-formula",
  description: "Roll a combination of dice and complex modifiers",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("formula")
          .setDescription("The formula of dice to roll and operations to apply")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("A word or two about this roll")
      )
      .addBooleanOption((option) =>
        option
          .setName("secret")
          .setDescription("Hide the roll results from everyone but you")
      ),
  async execute(interaction) {
    const formula = interaction.options.getString("formula")
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    let raw_pools = []
    let raw_results = []
    let summed_results = []

    const rolled_formula = formula.replace(
      /(\d+)d(\d+)/g,
      (match, pool, sides, _offset, _wholeString) => {
        raw_pools.push(match)
        let raw = roll(pool, sides)
        raw_results.push(raw[0])
        let summed = sum(raw)
        summed_results.push(summed)
        return summed
      }
    )

    return interaction.reply({
      content: present({
        formula,
        rolledFormula: rolled_formula,
        pools: raw_pools,
        raw: raw_results,
        summed: summed_results,
        description: roll_description,
        userFlake: interaction.user.id,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return [
      oneLine`
        ${command_name} rolls multiple pools of dice at once and can apply complex modifiers to the die results.
        Each formula should include at least one set of dice, written as ${inlineCode("pool")}d${inlineCode("sides")}.
        All sets of dice are rolled, then the math of the formula is applied. ${command_name} is best used
        when you need to add multiple different dice pools together, like for weapon damage rolls in D&D.
        Here are some formula examples:
      `,
      "",
      oneLine`
        * A magical weapon damage roll might look like ${inlineCode("2d4 + 1d6 + 6")}. ${command_name} will
        roll 2d4 and 1d6, add them together, then add 6.
      `,
      oneLine`
        * A crafting roll could be ${inlineCode("(1d20 + 16) * 20")}. ${command_name} will roll
        1d20 and add 16, then multiply that total by 20.
      `,
      oneLine`
        * A crit damage roll might look like ${inlineCode("(1d8 + 4) * 2 + 1d6")}. ${command_name} will roll
        1d8 and add 4, multiply that result by 2, then add 1d6.
      `,
      "",
      oneLine`
        ${command_name} uses ${hyperlink("math.js", hideLinkEmbed("https://mathjs.org/index.html"))} under the
        hood to do the calculations, so it respects proper order of operations and can do all sorts of fancy
        math.
      `,
    ].join("\n")
  },
}
