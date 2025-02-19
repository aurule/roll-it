const { randomInt } = require("mathjs")

const { i18n } = require("../../locales")

/**
 * Methods to handle the "advice" easter egg
 *
 * Commands can opt into this easter egg by implementing a check in their perform() method that calls
 * showAdvice(). If it passes, the message() method can be called to get a response that can be appended to the
 * command's output, typically as a subtext line after the main content.
 *
 * @example
 * ```js
 * perform(opts) {
 *   // ...
 *   if (advice.showAdvice()) {
 *     const advice_response = advice.message(opts.locale)
 *     return `${presentedOutcome}\n-# ${advice_response}`
 *   }
 *   return presentedOutcome
 * }
 * ```
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Get whether to show a random advice message
   *
   * Has a 1 in 100 chance to appear on any given invocation
   *
   * @return {bool} True if a message should be shown, false if not
   */
  showAdvice() {
    return randomInt(100) === 5
  },

  /**
   * Get an advice message
   *
   * Message string is chosen at random from whatever strings are available in the given locale.
   *
   * @param  {str} locale Locale code for the message
   * @return {str}        Advice message string
   */
  message(locale) {
    const messages = i18n.t("easter-eggs.advice.messages", { returnObjects: true })
    return messages.at(randomInt(messages.length))
  }
}
