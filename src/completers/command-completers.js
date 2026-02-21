import { all_choices } from "../commands/index.js"

/**
 * Completer for looking up commands
 *
 * @param  {string}    partialText The user's typed text
 * @param  {object[]?} override    Optional array of choices to use
 * @return {object[]}              Array of choice objects
 */
export function all(partialText, override) {
  const choices = override ?? all_choices
  const search = partialText.normalize().toLowerCase()

  return choices
    .filter((c) => c.name.normalize().toLowerCase().startsWith(search))
    .slice(0, 25)
}
