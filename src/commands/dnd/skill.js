const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")

const command_name = "skill"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("dc")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  perform({} = {}) {
    //
  },
  async execute(interaction) {
    //
  }
}
