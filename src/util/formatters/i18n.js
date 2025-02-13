const { unorderedList } = require("discord.js")
const { operator } = require("./signed")

/**
 * Formatter functions that work with i18next
 *
 * Every function here will automatically be loaded during i18next setup. See locales/index.js.
 */
module.exports = {
  /**
   * Turn an array into a markdown unordered list
   *
   * Able to handle nested arrays
   *
   * @example
   * ```js
   * ul(["first", "second", "third"])
   * // returns
   * //
   * // * first
   * // * second
   * // * third
   * ```
   *
   * @param  {any[]} value Array to transform
   * @return {str}         String of the markdown list
   */
  ul: (value) => unorderedList(value),

  /**
   * Turn an array into a markdown ordere list
   *
   * Unlike the `orderedList()` helper from discord.js, this method prefixes each line with the accurate item
   * number. This allows the list to be rendered correctly when broken by a message boundary.
   *
   * Cannot handle nested arrays.
   *
   * @example
   * ```js
   * ol(["first", "second", "third"])
   * // returns
   * //
   * // 1. first
   * // 2. second
   * // 3. third
   * ```
   *
   * @param  {any[]} value Array to transform
   * @return {str}         String of the markdown list
   */
  ol: (value) => value.map((val, idx) => `${idx + 1}. ${val}`).join("\n"),

  /**
   * Turn an array into a series of indented lines
   *
   * Cannot handle nested arrays.
   *
   * @example
   * ```js
   * indented(["first", "second", "third"])
   * // returns
   * //
   * //     first
   * //     second
   * //     third
   * ```
   *
   * @param  {any[]} value Array to transform
   * @return {str}         String of the indented text
   */
  indented: (value) => `\t${value.join("\n\t")}`,

  /**
   * Turn an array into a space-separated inline list
   *
   * This kind of spacing is appropriate for joining arithmetic operations, not for linguistic lists.
   *
   * Cannot handle nested arrays.
   *
   * @example
   * ```js
   * spaced(["first", "second", "third"])
   * // returns
   * // first second third
   * ```
   *
   * @param  {any[]} value Array to transform
   * @return {str}         String of the joined text
   */
  spaced: (value) => value.join(" "),

  /**
   * Convert an array of numbers to an arethmetic string
   *
   * Sign and value are separated by one space.
   *
   * @example
   * ```js
   * arithmetic([1])
   * // returns
   * // 1
   * ```
   *
   * @example
   * ```js
   * arithmetic([-1])
   * // returns
   * // -1
   * ```
   *
   * @example
   * ```js
   * arithmetic([-1, 5])
   * // returns
   * // -1 + 5
   * ```
   *
   * @param  {number} value Value to transform
   * @return {str}          String of the value with its sign
   */
  arithmetic: (value) =>
    value
      .filter((v) => v !== 0)
      .map((v, idx) => {
        if (idx === 0) return v
        return operator(v)
      })
      .join(""),
}
