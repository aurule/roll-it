const { i18n } = require("../locales")

module.exports = {
  /**
   * Transform commands into an array of Discord select widget options
   *
   * @param  {Collection} systems  Collection of system objects to include
   * @param  {str}        locale   Name of the locale for localizing entry text
   * @param  {str[]}      deployed Array of command names to mark as selected
   * @return {obj[]}               Array of select option objects
   */
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
