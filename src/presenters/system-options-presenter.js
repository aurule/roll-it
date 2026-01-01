const { i18n } = require("../locales")

module.exports = {
  systemOptions(locale, selected = []) {
    const { systems } = require("../data")
    const t = i18n.getFixedT(locale, "translation", "systems")

    const defaults = new Set(selected)

    return systems.map(system => {
      return {
        value: system.name,
        label: t(`${system.name}.title`),
        description: t(`${system.name}.description`),
        default: defaults.has(system.name),
      }
    })
  }
}
