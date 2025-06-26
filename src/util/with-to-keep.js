/**
 * Helper function to translate natural language `with advantage/disadvantage`
 */

/**
 * Convert "advantage" or "disadvantage" to "highest" or "lowest"
 *
 * Internally, Roll It uses the generic "keep" keyword instead of hard-coding advantage and disadvantage. This
 * helper translates that D&D specific wording to our internal representation.
 *
 * @param  {str} value The (dis)advantage string to convert
 * @return {str}       Converted string. One of "highest", "lowest", or "all".
 */
function with_to_keep(value) {
  switch (value) {
    case "advantage":
      return "highest"
    case "disadvantage":
      return "lowest"
    default:
      return "all"
  }
}

module.exports = {
  with_to_keep,
}
