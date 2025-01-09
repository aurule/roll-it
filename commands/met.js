const { SlashCommandBuilder, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const { loadSubcommands, dispatch } = require("../util/subcommands")
const { i18n } = require("../locales")

const subcommands = loadSubcommands("met")

module.exports = {
  name: "met",
  description: i18n.t("commands:met.description"),
  subcommands,
  data() {
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addSubcommand(subcommands.get("static").data())
      .addSubcommand(subcommands.get("opposed").data())
  },
  async execute(interaction) {
    return dispatch(interaction, module.exports.subcommands)
  },
  async autocomplete(interaction) {
    return dispatch(interaction, module.exports.subcommands, "autocomplete")
  },
  help({ command_name }) {
    return [
      oneLine`
        The ${command_name} commands let you play the MET version of rock-paper-scissors against Roll It or
        a chosen opponent. You can use ${inlineCode("/met static")} to make static and simple tests against a
        random outcome, and ${inlineCode("/met opposed")} lets you start an interactive challenge against
        another user.
      `,
    ].join("\n")
  },
}
