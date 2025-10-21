const { Collection } = require("discord.js")
const { i18n } = require("../locales")

/**
 * Split a name into chunks of numbers and non-numbers
 *
 * @param  {string}   name The string to split
 * @return {string[]}      Array of string components
 */
function splitter(name) {
  const re = /(\d+)/
  return name.split(re).filter((n) => n.length > 0)
}

/**
 * Normalize a command's name
 *
 * This ensures the name we use includes the parent name for subcommands, and is fully localized.
 *
 * @param  {Command} cmd Command object
 * @param  {i18n.t}  t   Translation function, scoped to the "commands" namespace
 * @return {string}      Normalized command name for sorting
 */
function normalize(cmd, t) {
  const t_id = cmd.i18nId ?? cmd.name
  if (cmd.parent === undefined) return t(`${t_id}.name`)

  const parent_name = t(`${cmd.parent}.name`)
  const child_name = t(`${cmd.parent}.${t_id}.name`)

  return `${parent_name} ${child_name}`
}

/**
 * Generate a full id for a command
 *
 * This uses the translation id for the command, combined with the translation id for its parent if it has one.
 *
 * @param  {Command} cmd Command object
 * @return {string}      Full command id
 */
function cache_id(cmd) {
  const base_id = cmd.i18nId ?? cmd.name
  if (cmd.parent === undefined) return base_id

  return `${cmd.parent} ${base_id}`
}

/**
 * Get a comparison function for sorting command names in the given locale
 *
 * @param  {string}   locale Locale code for the sorting
 * @return {function}        Compare function suitable for use in sorting arrays
 */
function comparator(locale) {
  const collator = new Intl.Collator(locale, { numeric: true })
  const name_cache = new Collection()
  const parts_cache = new Collection()
  const t = i18n.getFixedT(locale, "commands")

  /**
   * Sort function for the given locale
   *
   * @param  {Command} first_cmd  First command object to compare
   * @param  {Command} second_cmd Second command object to compare
   * @return {int}                -1 if first comes before second, 1 if second comes before first, and 0 if their names match
   */
  return (first_cmd, second_cmd) => {
    const first_id = cache_id(first_cmd)
    const first_name = name_cache.ensure(first_id, () => normalize(first_cmd, t))
    const first_parts = parts_cache.ensure(first_name, splitter)

    const second_id = cache_id(second_cmd)
    const second_name = name_cache.ensure(second_id, () => normalize(second_cmd, t))
    const second_parts = parts_cache.ensure(second_name, splitter)

    let idx = 0
    while (true) {
      const first_part = first_parts.at(idx)
      const second_part = second_parts.at(idx)
      if (first_part === undefined || second_part === undefined) return 0

      const compared = collator.compare(first_part, second_part)
      if (compared !== 0) return compared

      idx += 1
    }
  }
}

module.exports = {
  comparator,
  splitter,
  normalize,
  cache_id,
}
