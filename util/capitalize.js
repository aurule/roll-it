module.exports = {
  /**
   * Super simple helper to turn the first letter of a word upper case
   *
   * @param  {str} word Word to capitalize
   * @return {str}      Word with its first letter capitalized
   */
  capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1, word.length)
  },
}
