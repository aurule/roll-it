import { all_choices } from "../commands/index.js"

/**
 * Completer for looking up commands
 *
 * @param  {str} partialText The user's typed text
 * @return {obj[]}           Array of choice objects
 */
export function all(partialText) {
  const search = partialText.normalize().toLowerCase()

  return all_choices
    .filter((c) => c.name.normalize().toLowerCase().startsWith(search))
    .slice(0, 25)
}
