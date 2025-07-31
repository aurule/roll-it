const CommandNamePresenter = require("../../presenters/command-name-presenter")

module.exports = {
  name: "commands",
  help_data(locale) {
    const commands = require("../../commands").sorted.get(locale)
    return {
      commands: CommandNamePresenter.list(commands, locale),
    }
  },
}
