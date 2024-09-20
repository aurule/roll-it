const { SlashCommandSubcommandBuilder } = require("discord.js")
const { longReply } = require("../../util/long-reply")

const commonOpts = require("../../util/common-options")
const { throwChoices } = require("../../util/met-throw-options")
const { MetOpposedManager } = require("../../services/met-opposed-manager")

module.exports = {
  name: "opposed",
  parent: "met",
  description: "Start an interactive, opposed MET rock-paper-scissors test",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addUserOption((option) =>
        option
          .setName("opponent")
          .setDescription("User you are challenging")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("attribute")
          .setDescription("Type of attribute this test uses")
          .setChoices(
            { name: "Mental", value: "mental" },
            { name: "Social", value: "social" },
            { name: "Physical", value: "physical" },
          )
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("retest")
          .setDescription("Ability to use for a retest")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("throw")
          .setDescription("The symbol you want to use for the first chop")
          .setChoices(...throwChoices(true))
          .setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addBooleanOption(option =>
        option
          .setName("bomb")
          .setDescription("Whether you can throw Bomb. Defaults to false.")
      )
      .addBooleanOption(option =>
        option
          .setName("ties")
          .setDescription("Whether you win on ties. Defaults to false.")
      ),
  async execute(interaction) {
    const manager = new MetOpposedManager({
      interaction,
      attackerId: interaction.user.id,
      defenderId: interaction.options.getUser("opponent").id,
      attribute: interaction.options.getString("attribute"),
      retest_ability: interaction.options.getString("retest"),
      description: interaction.options.getString("description")
    })
    manager.attacker.bomb = interaction.options.getBoolean("bomb") ?? false
    manager.attacker.ties = interaction.options.getBoolean("ties") ?? false
    manager.current_test.chop(manager.attacker, interaction.options.getString("throw"))

    return manager.begin()
  },
  help({ command_name }) {
    return `undefined`
  },
}
