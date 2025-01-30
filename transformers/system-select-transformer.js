const { i18n } = require("../locales")

module.exports = {
  transform: (systems, locale, deployed = []) => {
    const t = i18n.getFixedT(locale)
    return systems.map(system => {
      const name = system.name
      return {
        label: t(`systems.${name}.title`),
        description: t(`systems.${name}.description`),
        value: name,
        default: deployed.includes(name),
      }
    })
  }
}
