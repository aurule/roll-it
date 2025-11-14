const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")

const command_name = "attack"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedIntegerOption("modifier", (option) => option.setRequired(true))
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("crit")
      .addLocalizedIntegerOption("ac")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  perform({} = {}) {
    //
  },
  async execute(interaction) {
    //
  }
}
