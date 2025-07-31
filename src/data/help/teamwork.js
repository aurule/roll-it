const CommandNamePresenter = require("../../presenters/command-name-presenter")

module.exports = {
  name: "teamwork",
  help_data(locale) {
    const commands = require("../../commands").sorted.teamworkable.get(locale)
    return {
      teamworkable: CommandNamePresenter.list(commands, locale),
    }
  },
}
