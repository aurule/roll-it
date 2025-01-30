const { i18n } = require("../locales")

module.exports = {
  transform: (commands, locale, deployed = []) => {
    const t = i18n.getFixedT(locale, "commands")
    return commands.map(command => {
      const name = command.name
      return {
        label: t(`${name}.name`),
        description: t(`${name}.description`),
        value: name,
        default: deployed.includes(name),
      }
    })
  }
}
