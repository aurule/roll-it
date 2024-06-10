const { inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")
const commandNamePresenter = require("../presenters/command-name-presenter")
const commands = require("../commands")

module.exports = {
  name: "commands",
  title: "Commands",
  description: "How to use slash commands and what's available",
  help() {
    return [
      oneLine`
        Roll It uses slash commands to roll dice using different built-in dice mechanics. Slash commands are
        started by typing a ${inlineCode("/")} character and then the name of the command. Discord will suggest
        commands as you type. To accept a suggestion, click it from the list that pops up or hit the
        ${inlineCode("Tab")} key.
      `,
      "",
      oneLine`
        Commands usually accept one or more arguments. These are used to pass information to the command, like
        the size of a dice pool. Once you've selected a command, Discord will let you fill in
        its required arguments. When you're done with an argument, press ${inlineCode("Tab")} to move to the
        next one. After the required arguments have been filled out, Discord will show you the command's
        optional arguments in a list, like it did for the command names. Hit ${inlineCode("Tab")} or select
        the argument name to begin filling it in.
      `,
      "",
      oneLine`
        Server managers can set which roll commands are available. See the help for the
        ${inlineCode("/roll-chooser")} command for more.
      `,
      "",
      "Here are all of the slash commands that Roll It knows:",
      commands
        .filter((c) => c.type !== "menu")
        .map((c) => `• ${commandNamePresenter.present(c)} - ${c.description}`)
        .join("\n"),
    ].join("\n")
  },
}
