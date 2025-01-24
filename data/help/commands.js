const commandNamePresenter = require("../../presenters/command-name-presenter")

module.exports = {
  name: "commands",
  help_data(locale) {
    const commands = require("../../commands")
    return {
      commands: commandNamePresenter.list(commands, locale)
    }
  }
}
