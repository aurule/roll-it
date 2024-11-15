const vowels = Array.from("aeiouy")

module.exports = {
  /**
   * Turn a word into an indeterminate version preceeded by "a" or "an"
   *
   * This is an extremely basic function. It adds "an" if the word starts with a vowel, and "a" otherwise.
   * It's good enough for internal use in english, but should probably be replaced if more complexity is
   * required.
   *
   * @param  {str} word The string to make indeterminate
   * @return {str}      The prefixed string
   */
  indeterminate(word) {
    if (!word) return word
    const initial = word[0].toLowerCase()
    if (vowels.includes(initial)) return `an ${word}`
    return `a ${word}`
  },
}
