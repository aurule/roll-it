const { i18n } = require("../locales")
const CommandNamePresenter = require("../presenters/command-name-presenter")

module.exports = {
  /**
   * Transform commands into an array of Discord select widget options
   *
   * @param  {Collection} commands Collection of command objects to include
   * @param  {str}        locale   Name of the locale for localizing entry text
   * @param  {str[]}      deployed Array of command names to mark as selected
   * @return {obj[]}               Array of select option objects
   */
  transform: (commands, locale, deployed = []) => {
    const t = i18n.getFixedT(locale, "commands")
    return commands.map((command) => {
      const name = command.name
      return {
        label: "/" + t(`${name}.name`),
        description: t(`${name}.description`),
        value: name,
        default: deployed.includes(name),
      }
    })
  },
}
