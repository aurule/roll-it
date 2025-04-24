const { i18n } = require("../../locales")

/**
 * Methods to handle the "hummingbird" easter egg
 *
 * Commands can opt into this easter egg by implementing a check in their perform() method that calls
 * hasTrigger() and qualified(). If it passes, the spotted() method can be called to get a response that can
 * be appended to the command's output, typically as a subtext line after the main content.
 *
 * @example
 * ```js
 * perform(opts) {
 *   // ...
 *   if (hummingbird.hasTrigger(opts.description, opts.locale) && hummingbird.qualified(outcome)) {
 *     const bird_response = hummingbird.spotted(opts.locale)
 *     return `${presentedOutcome}\n-# ${bird_response}`
 *   }
 *   return presentedOutcome
 * }
 * ```
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Get whether the description could allow a hummingbird
   *
   * @param  {str}  description Description string to check
   * @param  {str}  locale      Locale code for looking up description triggers
   * @return {bool}             True if the hummingbird is allowed, false if not
   */
  hasTrigger(description, locale) {
    const triggers = i18n.t("easter-eggs.hummingbird.triggers", {
      lng: locale,
      returnObjects: true,
    })
    const regex = new RegExp(triggers.join("|"), "iv")
    return regex.test(description)
  },

  /**
   * Get whether the successes allow a hummingbird
   *
   * @param  {int}  successes Successes to test
   * @return {bool}           True if the hummingbird is allowed, false if not
   */
  qualified(successes) {
    return successes == 11
  },

  /**
   * Get the hummingbird message
   *
   * @param  {str} locale Locale code
   * @return {str}        Message string
   */
  spotted(locale) {
    return i18n.t("easter-eggs.hummingbird.spotted", { lng: locale })
  },
}
