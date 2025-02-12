const { inlineCode } = require("discord.js")

const { present } = require("../../presenters/command-name-presenter")
const { i18n } = require("../../locales")

module.exports = {
  name: "systems",
  help_data(locale) {
    const commands = require("../../commands")
    const all_systems = require("../index").systems

    const t = i18n.getFixedT(locale, "translation", "systems")
    const cmd_t = i18n.getFixedT(locale, "commands")

    return {
      systems: all_systems.map(system => {
        const details = t(system.name, { returnObjects: true })
        details.commands = system.commands.required.map(command_name => {
          const command = commands.get(command_name)
          return present(command, locale)
        })
        return t("listing", details)
      }),
    }
  },
}
