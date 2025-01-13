const { inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { loadSubcommands, dispatch } = require("../util/subcommands")
const CommandNamePresenter = require("../presenters/command-name-presenter")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "saved"
const subcommands = loadSubcommands(command_name)

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  global: true,
  subcommands,
  data() {
    return new LocalizedSlashCommandBuilder("saved")
      .setDMPermission(false)
      .addSubcommand(subcommands.get("roll").data())
      .addSubcommand(subcommands.get("grow").data())
      .addSubcommand(subcommands.get("list").data())
      .addSubcommand(subcommands.get("set").data())
      .addSubcommand(subcommands.get("manage").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help({ command_name }) {
    const savable_commands = require("./index").savable
    return [
      oneLine`
        The ${command_name} commands let you save commonly used rolls and easily re-use them. Each subcommand
        has its own help entry you can read for more details.
      `,
      "",
      oneLine`
        In general, you'll use ${inlineCode("/saved set")} and ${italic("Save this roll")} to save some rolls
        and their options. Then, ${inlineCode("/saved roll")} to use one of them. Check out the help for
        ${inlineCode("/saved set")} and ${italic("Save this roll")} to learn more about how they work
        together.
      `,
      "",
      `You can use ${inlineCode("/saved list")} to see the rolls you've saved on this server.`,
      "",
      oneLine`
        ${inlineCode("/saved manage")} lets you see the details of a saved roll, update it, and remove it from
        the server. For small changes, you can use ${inlineCode("/saved grow")} instead.
      `,
      "",
      "Not all commands can be saved. Here is a list of the ones which can be used:",
      CommandNamePresenter.list(savable_commands),
    ].join("\n")
  },
}
