module.exports = {
  /**
   * Format a positive or negative number as an addition operation
   *
   * @param  {int} number The number to format
   * @return {str}        A string with + num or - num, or empty if zero
   */
  operator(number) {
    if (number > 0) return ` + ${number}`
    if (number < 0) return ` - ${-1 * number}`
    return ""
  },
}
