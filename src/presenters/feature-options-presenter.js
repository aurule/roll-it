import { i18n } from "../locales/index.js"
import { features } from "../data/features.js"

/**
 * Generate Discord string select menu options for our features
 *
 * @param  {string}                   locale   Locale code for translation
 * @param  {string[]}                 selected Array of pre-selected feature names
 * @return {StringSelectMenuOption[]}          Array of string select menu option objects
 */
export function featureOptions(locale, selected = []) {
  const t = i18n.getFixedT(locale, "translation", "features")

  const defaults = new Set(selected)

  return features.map((feature) => {
    return {
      value: feature.name,
      label: t(`${feature.name}.title`),
      description: t(`${feature.name}.description`),
      default: defaults.has(feature.name),
    }
  })
}
