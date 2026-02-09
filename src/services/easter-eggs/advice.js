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
 */

import { randomInt } from "mathjs"

import { i18n } from "../../locales/index.js"

/**
 * Get whether to show a random advice message
 *
 * Has a 1 in 100 chance to appear on any given invocation
 *
 * @return {bool} True if a message should be shown, false if not
 */
export function showAdvice() {
  return randomInt(100) === 5
}

/**
 * Get an advice message
 *
 * Message string is chosen at random from whatever strings are available in the given locale.
 *
 * @param  {str} locale Locale code for the message
 * @return {str}        Advice message string
 */
export function message(locale) {
  const messages = i18n.t("easter-eggs.advice.messages", { returnObjects: true, lng: locale })
  return messages.at(randomInt(messages.length))
}
