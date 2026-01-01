const { i18n } = require("../locales")

module.exports = {
  featureOptions(locale, selected = []) {
    const { features } = require("../data")
    const t = i18n.getFixedT(locale, "translation", "features")

    const defaults = new Set(selected)

    return features.map(feature => {
      return {
        value: feature.name,
        label: t(`${feature.name}.title`),
        description: t(`${feature.name}.description`),
        default: defaults.has(feature.name),
      }
    })
  }
}
