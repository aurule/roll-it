const { i18n, available_locales } = require("./index")

/**
 * Get the canonical version of the named string key for commands and normal options
 *
 * This string is the default which gets supplied to discord. It is then overwritten by strings in the
 * localization map.
 *
 * @param  {str} partial      Final key part. One of "description" or "name".
 * @param  {str} command_name Name of the command this string is for
 * @param  {str} option_name  Optional. Name of the option this string is for.
 * @return {str}              Canonical string for the named key
 */
function canonical(partial, command_name, option_name) {
  const key_parts = [`commands:${command_name}`]
  if (option_name) {
    key_parts.push("options")
    key_parts.push(option_name)
  }
  key_parts.push(partial)

  const key = key_parts.join(".")
  return i18n.t(key)
}

/**
 * Create a mapping of locale names to their strings for commands and normal options
 *
 * The result is suitable for passing to the `setNameLocalizations()` or `setDescriptionLocalizations()`
 * methods of a discord command or option builder.
 *
 * @see https://discord.com/developers/docs/reference#locales
 *
 * @param  {str} partial      Final key part. One of "description" or "name".
 * @param  {str} command_name Name of the command the strings are for
 * @param  {str} option_name  Optional. Name of the option the strings are for.
 * @return {obj}              Object whose keys are discord locale names, and values are that locale's string
 */
function mapped(partial, command_name, option_name) {
  const key_parts = [`commands:${command_name}`]
  if (option_name) {
    key_parts.push("options")
    key_parts.push(option_name)
  }
  key_parts.push(partial)

  const key = key_parts.join(".")

  const localizations = {}
  for (const locale_name of available_locales) {
    localizations[locale_name] = i18n.t(key, { lng: locale_name })
  }
  return localizations
}

const shared = {
  /**
   * Get the canonical version of the key for a shared option
   *
   * @param  {str} partial      Final key part. One of "description" or "name".
   * @param  {str} option_name  Name of the option the strings are for.
   * @return {str}              Canonical string for the named key
   */
  canonical: (partial, option_name) => {
    return i18n.t(`translation:options.${option_name}.${partial}`)
  },

  /**
   * Create a mapping of locale names to strings for a shared option
   *
   * @param  {str} partial      Final key part. One of "description" or "name".
   * @param  {str} option_name  Name of the option the strings are for.
   * @return {obj}              Object whose keys are discord locale names, and values are that locale's string
   */
  mapped: (partial, option_name) => {
    const localizations = {}
    for (const locale_name of available_locales) {
      localizations[locale_name] = i18n.t(`translation:options.${option_name}.${partial}`, {
        lng: locale_name,
      })
    }
    return localizations
  },
}

module.exports = {
  canonical,
  mapped,
  shared,
}
