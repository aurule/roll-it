const { SlashCommandSubcommandBuilder } = require("discord.js")
const { oneLine } = require("common-tags")

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
        option.setName("opponent").setDescription("User you are challenging").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("attribute")
          .setDescription("Type of attribute this test uses")
          .setChoices(
            { name: "Mental", value: "mental" },
            { name: "Social", value: "social" },
            { name: "Physical", value: "physical" },
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("rt-ability")
          .setDescription("Named ability to use for a retest")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("throw")
          .setDescription("The symbol you want to use for the first chop")
          .setChoices(...throwChoices(true))
          .setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addBooleanOption((option) =>
        option.setName("bomb").setDescription("Whether you can throw Bomb. Defaults to false."),
      )
      .addBooleanOption((option) =>
        option.setName("ties").setDescription("Whether you win on ties. Defaults to false."),
      )
      .addBooleanOption((option) =>
        option
          .setName("one-throw")
          .setDescription(
            "Whether to limit the test to a single opposed throw with no retests. Defaults to false.",
          ),
      ),
  async execute(interaction) {
    const manager = new MetOpposedManager({
      interaction,
      attackerId: interaction.user.id,
      defenderId: interaction.options.getUser("opponent").id,
      attribute: interaction.options.getString("attribute"),
      retest_ability: interaction.options.getString("rt-ability"),
    })
    manager.description = interaction.options.getString("description") ?? ""
    manager.allow_retests = !interaction.options.getBoolean("one-throw")
    manager.allow_retests = interaction.options.getBoolean("ret")
    manager.attacker.bomb = interaction.options.getBoolean("bomb") ?? false
    manager.attacker.ties = interaction.options.getBoolean("ties") ?? false
    manager.current_test.chop(manager.attacker, interaction.options.getString("throw"))

    return manager.begin()
  },
  help({ command_name, ...opts }) {
    return [
      oneLine`
        ${command_name} starts an interactive challenge by prompting ${opts.opponent} with the details of the
        challenge: the given ${opts.attribute} and your declared ${opts.bomb} and ${opts.ties}. They have the
        option to set their own ${opts.bomb} and ${opts.ties} before picking the symbol to use against your
        ${opts.throw}. They can also relent without contesting the challenge.
      `,
      "",
      oneLine`
        As the one who started the test, you can cancel it before your ${opts.opponent} responds. This lets
        you quickly clear the challenge in case you tagged the wrong person, or realize the challenge isn't
        necessary.
      `,
      "",
      oneLine`
        Once your opponent responds, the symbols you both threw will be shown along with the current winner.
        Roll It will show the entire history of the chops so you always know what's been thrown so far.
        The currently losing player at this point can try a retest, which lets you both choose a new symbol.
        The currently winning player can cancel that retest, if appropriate, before each picks a new symbol.
      `,
      "",
      oneLine`
        ${command_name} takes into account whether either of you has ${opts.ties}, i.e. a power that declares
        you win tied tests automatically. If neither of you has ties (or both of you have ties), then you'll
        have to compare bids on your own. Once you have, either player can retest or concede the test as
        appropriate.
      `,
    ].join("\n")
  },
}
