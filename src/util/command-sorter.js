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
 * Get a comparison function for sorting command names in the given locale
 *
 * @param  {string}   locale Locale code for the sorting
 * @return {function}        Compare function suitable for use in sorting arrays
 */
function comparator(locale) {
  const collator = new Intl.Collator(locale, { numeric: true })
  const name_cache = new Collection()
  const t = i18n.getFixedT(locale, "commands")

  /**
   * Sort function for the given locale
   *
   * @param  {Command} first_cmd  First command object to compare
   * @param  {Command} second_cmd Second command object to compare
   * @return {int}                -1 if first comes before second, 1 if second comes before first, and 0 if their names match
   */
  return (first_cmd, second_cmd) => {
    const first_id = first_cmd.i18nId ?? first_cmd.name
    const first_name = t(`${first_id}.name`)
    const first_parts = name_cache.ensure(first_name, splitter)

    const second_id = second_cmd.i18nId ?? second_cmd.name
    const second_name = t(`${second_id}.name`)
    const second_parts = name_cache.ensure(second_name, splitter)

    let idx = 0
    while(true) {
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
}
