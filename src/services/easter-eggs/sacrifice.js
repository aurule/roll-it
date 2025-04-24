const { i18n } = require("../../locales")

/**
 * Methods to handle the "sacrifice" easter egg
 *
 * Commands can opt into this easter egg by implementing a check in their perform() method that calls
 * hasTrigger(). Then, the command should assess how favorable the results are to the user and call one of the
 * response methods. That response can be appended to the command's output, typically as a subtext line after
 * the main content.
 *
 * @example
 * ```js
 * perform(opts) {
 *   // ...
 *   if (sacrifice.hasTrigger(opts.description, opts.locale)) {
 *     const sac_response = judge(outcome, opts.locale)
 *     return `${presentedOutcome}\n-# ${sac_response}`
 *   }
 *   return presentedOutcome
 * }
 * judge(outcome, locale) {
 *   if (outcome > 6) return sacrifice.greate(locale)
 *   // ... etc
 * }
 * ```
 *
 * @type {Object}
 */
module.exports = {
  /**
   * Get whether a description string should trigger this easter egg
   *
   * @param  {str}     description String to test
   * @param  {str}     locale      Locale code
   * @return {Boolean}             True if the easter egg is triggered, false if not
   */
  hasTrigger(description, locale) {
    const triggers = i18n.t("easter-eggs.sacrifice.triggers", { lng: locale, returnObjects: true })
    const regex = new RegExp(triggers.join("|"), "iv")
    return regex.test(description)
  },

  /**
   * Get the "great sacrifice" message
   *
   * @param  {str} locale Locale code
   * @return {str}        Message string
   */
  great(locale) {
    return i18n.t("easter-eggs.sacrifice.great", { lng: locale })
  },

  /**
   * Get the "good sacrifice" message
   *
   * @param  {str} locale Locale code
   * @return {str}        Message string
   */
  good(locale) {
    return i18n.t("easter-eggs.sacrifice.good", { lng: locale })
  },

  /**
   * Get the "neutral sacrifice" message
   *
   * @param  {str} locale Locale code
   * @return {str}        Message string
   */
  neutral(locale) {
    return i18n.t("easter-eggs.sacrifice.neutral", { lng: locale })
  },

  /**
   * Get the "bad sacrifice" message
   *
   * @param  {str} locale Locale code
   * @return {str}        Message string
   */
  bad(locale) {
    return i18n.t("easter-eggs.sacrifice.bad", { lng: locale })
  },

  /**
   * Get the "awful sacrifice" message
   *
   * @param  {str} locale Locale code
   * @return {str}        Message string
   */
  awful(locale) {
    return i18n.t("easter-eggs.sacrifice.awful", { lng: locale })
  },
}
