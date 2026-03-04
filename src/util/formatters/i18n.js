/**
 * Formatter functions that work with i18next
 *
 * Every function here will automatically be loaded during i18next setup. See locales/index.js.
 */

import { unorderedList } from "discord.js"
import { operator } from "./signed.js"
export { signed } from "./signed.js"

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
 * @param  {any[]}  value Array to transform
 * @return {string}       String of the markdown list
 */
export function ul(value) {
  return unorderedList(value)
}

/**
 * Turn an array into a markdown ordered list
 *
 * Unlike the `orderedList()` helper from discord.js, this method prefixes each line with the accurate item
 * number. This allows the list to be rendered correctly when paginated.
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
 * @param  {any[]}  value Array to transform
 * @return {string}       String of the markdown list
 */
export function ol(value) {
  return value.map((val, idx) => `${idx + 1}. ${val}`).join("\n")
}

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
 * @param  {any[]}  value Array to transform
 * @return {string}       String of the indented text
 */
export function indented(value) {
  return `\t${value.join("\n\t")}`
}

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
 * // "first second third"
 * ```
 *
 * @param  {any[]} value Array to transform
 * @return {string}      String of the joined text
 */
export function spaced(value) {
  return value.join(" ")
}

/**
 * Convert an array of numbers to an arithmetic string
 *
 * Sign and value are separated by one space.
 *
 * @example
 * ```js
 * arithmetic([1])
 * // returns
 * // "1"
 * ```
 *
 * @example
 * ```js
 * arithmetic([-1])
 * // returns
 * // "-1"
 * ```
 *
 * @example
 * ```js
 * arithmetic([-1, 5])
 * // returns
 * // "-1 + 5"
 * ```
 *
 * @param  {number[]} value Array to transform
 * @return {string}         String of array items as a math expression
 */
export function arithmetic(value) {
  return value
    .filter((v) => v !== 0)
    .map((v, idx) => {
      if (idx === 0) return v
      return operator(v)
    })
    .join("")
}
