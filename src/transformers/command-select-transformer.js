import { i18n } from "../locales/index.js"
import { present } from "../presenters/command-name-presenter.js"

/**
 * Transform commands into an array of Discord select widget options
 *
 * @param  {Collection} commands Collection of command objects to include
 * @param  {str}        locale   Name of the locale for localizing entry text
 * @param  {str[]}      deployed Array of command names to mark as selected
 * @return {obj[]}               Array of select option objects
 */
export function transform(commands, locale, deployed = []) {
  const t = i18n.getFixedT(locale, "commands")
  return commands.map((command) => {
    const cmd_id = command.i18nId ?? command.name
    return {
      label: present(command, locale, { unformatted: true }),
      description: t(`${cmd_id}.description`),
      value: command.name,
      default: deployed.includes(command.name),
    }
  })
}
