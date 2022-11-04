const {
  SlashCommandBuilder,
  userMention,
  inlineCode,
  hideLinkEmbed,
  hyperlink,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/fate-results-presenter")
const { fate } = require("../services/tally")

module.exports = {
  name: "fate",
  description: "Make a FATE roll of four fudge dice",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addIntegerOption((option) =>
        option
          .setName("modifier")
          .setDescription(
            "A number to add to the result after adding up the rolled dice"
          )
      )
      .addIntegerOption((option) =>
        option
          .setName("rolls")
          .setDescription(
            "Roll the entire dice pool this many times (default 1)"
          )
          .setMinValue(1)
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
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const raw_results = roll(4, 3, rolls)
    const summed_results = fate(raw_results)

    return interaction.reply({
      content: present({
        rolls,
        modifier,
        summed: summed_results,
        description: roll_description,
        raw: raw_results,
        userFlake: interaction.user.id,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return [
      oneLine`
        ${command_name} rolls four fudge dice for the FATE system
      `,
      "",
      stripIndent`
        Args:
            \`modifier\`: A number to add to the result after adding up the rolled dice
            \`rolls\`: Number of times to roll this dice pool (defaults to 1)
            \`description\`: A word or two about the roll
            \`secret\`: Whether to hide the roll results from everyone but you
      `,
      "",
      oneLine`
        ${command_name} rolls four fudge dice whose sides are -1, 0, and +1, then adds them up. The result
        is displayed using the FATE
        ${hyperlink(
          "ladder",
          hideLinkEmbed(
            "https://fate-srd.com/fate-core/taking-action-dice-ladder#the-ladder"
          )
        )}.
      `,
    ].join("\n")
  },
}
