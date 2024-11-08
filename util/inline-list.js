module.exports = {
  /**
   * Format a list for inline display
   *
   * Separates all but the last element with a comma and space. The final element is appended after a comma
   * and the word 'and'.
   *
   * @example
   * ```js
   * inline(["first", "second", "third"])
   * // returns "first, second, and third"
   * ```
   *
   * @param  {str[]} arr Array of printable elements
   * @return {str}       Inline string representation of the array
   */
  inline(arr) {
    const length = arr.length

    if (!length) return ""
    if (length === 1) return arr[0]
    if (length === 2) return arr.join(" and ")

    let content = arr.slice(0, length - 1).join(", ")
    content += ", and "
    content += arr.at(-1)
    return content
  },
}
