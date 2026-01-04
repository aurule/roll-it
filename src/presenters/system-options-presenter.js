const { i18n } = require("../locales")

module.exports = {
  /**
   * Generate Discord string select menu options for our systems
   *
   * @param  {string}                   locale   Locale code for translation
   * @param  {string[]}                 selected Array of pre-selected system names
   * @return {StringSelectMenuOption[]}          Array of string select menu option objects
   */
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
