const { i18n, available_locales } = require("../locales")

/**
 * Get the main name for a choice
 *
 * @param  {str} value Value for the choice
 * @return {str}       Choice name
 */
function canonicalChoiceName(value) {
  return i18n.t(`opposed:throws.${value}`)
}

/**
 * Get a map of locales to localized names for a given valiue
 *
 * @param  {str} value Value of the choice
 * @return {obj}       Localized names map
 */
function mappedChoiceNames(value) {
  const localizations = {}
  for (const locale_name of available_locales) {
    localizations[locale_name] = i18n.t(`opposed:throws.${value}`, { lng: locale_name })
  }
  return localizations
}

/**
 * Create a list of fully localized choice objects for a set of values
 *
 * @param  {...str} values Choice values
 * @return {obj[]}         Array of choice objects
 */
function localizedChoices(...values) {
  return values.map((value) => {
    return {
      name: canonicalChoiceName(value),
      name_localizations: mappedChoiceNames(value),
      value,
    }
  })
}

module.exports = {
  /**
   * Select menu options for a MET throw
   *
   * @return {obj[]} Array of choice objects
   */
  throwChoices: localizedChoices("rock", "bomb", "scissors", "rand", "rand-bomb"),

  /**
   * Select menu options for random MET throw results
   *
   * @type {obj[]} Array of choice objects
   */
  vsChoices: localizedChoices("rand", "rand-bomb", "none"),

  /**
   * Get component select menu options for a MET throw
   *
   * Discord uses a slightly different format for these than for the select menu of a command option. It's
   * infuriating.
   *
   * @param  {Boolean} bomb Whether to include bomb options
   * @return {obj[]}        Array of option objects
   */
  throwOptions(locale, bomb = false) {
    const t = i18n.getFixedT(locale, "opposed", "throws")
    const valid_options = bomb
      ? ["rock", "bomb", "scissors", "rand", "rand-bomb"]
      : ["rock", "paper", "scissors", "rand"]

    return valid_options.map((value) => {
      return {
        label: t(value),
        value,
      }
    })

    return module.exports
      .throwChoices(bomb)
      .map((choice) => ({ label: choice.name, value: choice.value }))
  },
}
