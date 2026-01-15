/**
 * Format a positive or negative number as an addition operation
 *
 * @param  {int} number The number to format
 * @return {str}        A string with + num or - num, or empty if zero
 */
export function operator(number) {
  if (number > 0) return ` + ${number}`
  if (number < 0) return ` - ${-1 * number}`
  return ""
}

/**
 * Format a number to show its positive or negative sign
 *
 * - Positive numbers are shown with a plus.
 * - Negative numbers are shown with a minus.
 * - Zero is not given a sign.
 *
 * @example
 * ```js
 * signed(5)
 * // returns
 * // "+5"
 * ```
 *
 * @example
 * ```js
 * signed(-3)
 * // returns
 * // "-3"
 * ```
 *
 * @param  {int} number The number to format
 * @return {str}        A string with +num or -num, or 0 if zero
 */
export function signed(number) {
  if (number > 0) return `+${number}`
  return `${number}`
}
