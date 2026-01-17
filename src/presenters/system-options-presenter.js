import { i18n } from "../locales/index.js"
import { systems } from "../data/systems.js"

/**
 * Generate Discord string select menu options for our systems
 *
 * @param  {string}                   locale   Locale code for translation
 * @param  {string[]}                 selected Array of pre-selected system names
 * @return {StringSelectMenuOption[]}          Array of string select menu option objects
 */
export function systemOptions(locale, selected = []) {
  const t = i18n.getFixedT(locale, "translation", "systems")

  const defaults = new Set(selected)

  return systems.map((system) => {
    return {
      value: system.name,
      label: t(`${system.name}.title`),
      description: t(`${system.name}.description`),
      default: defaults.has(system.name),
    }
  })
}
