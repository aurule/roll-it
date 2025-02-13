const CommandNamePresenter = require("../../presenters/command-name-presenter")

module.exports = {
  name: "saved",
  help_data(locale) {
    const commands = require("../../commands")
    return {
      savable: CommandNamePresenter.list(commands.savable, locale),
    }
  },
}
