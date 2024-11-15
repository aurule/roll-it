const exceptions = new Map([
  ["die", "dice"],
  ["it", "they"],
  ["is", "are"],
  ["does", "do"],
])

module.exports = {
  exceptions,

  /**
   * Convert a singular word to its plural
   *
   * This is an extremely basic function. It adds "s" for most words, and uses a list of exceptions for
   * others. It works well enough for internal use in english, but should be replaced if we need more
   * complexity.
   *
   * @param  {str} word   The word to pluralize
   * @param  {int} number Number for pluralization
   * @return {str}        Pluralized word
   */
  pluralize(word, number) {
    if (Math.abs(number) === 1) return word
    if (exceptions.has(word)) return exceptions.get(word)
    return word + "s"
  },
}
