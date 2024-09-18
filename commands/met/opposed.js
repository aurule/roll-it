const { SlashCommandSubcommandBuilder } = require("discord.js")
const { longReply } = require("../../util/long-reply")

const commonOpts = require("../../util/common-options")
const { throwChoices } = require("../../util/met-throw-options")

module.exports = {
  name: "opposed",
  parent: "met",
  description: "Start an interactive MET rock-paper-scissors challenge",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addUserOption((option) =>
        option
          .setName("opponent")
          .setDescription("The user you are challenging")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("attribute")
          .setDescription("The type of attribute this test uses")
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
          .setDescription("The standard ability to use for a retest")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("throw")
          .setDescription("Choose what symbol you use")
          .setChoices(...throwChoices(true))
          .setRequired(true),
      )
      .addBooleanOption(option =>
        option
          .setName("bomb")
          .setDescription("Whether you can throw Bomb. Defaults to false.")
      )
      .addBooleanOption(option =>
        option
          .setName("ties")
          .setDescription("Whether you win on ties. Defaults to false.")
      )
      .addStringOption(commonOpts.description),
  async execute(interaction) {
    // prompt opponent to respond
    //  update with bomb and ties if clicked
    // on timeout
    //  simple message
    // on Cancel
    //  ensure clicked by user, remove message
    // on Throw
    //  enter.... THE LOOP
    //
    //
    // Status message
    // on timeout
    //  show Complete message
    // on Done
    //  only for losing party
    //  show Complete message
    // on Retest
    //  show Retest prompt
    //
    // Retest message
    // on timeout
    //  show Status message
    // on Cancel
    //  only for non-retest-initiator
    //  show Status message
    // on Throw
    //  show Status message
    //
    //
    // Complete message
    //  show summary
    return interaction.reply("WIP")
  },
  help({ command_name }) {
    return `undefined`
  },
}
