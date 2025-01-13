const { SlashCommandBuilder } = require("discord.js")

const { canonical, mapped } = require("../locales/helpers")

/**
 * Command builder which automatically populates common localization data
 *
 * This depends on the commands localization data following a common format as used by the `mapped` and
 * `canonical` functions.
 *
 * In the `commands:` namespace,
 * command_name:
 *   name: Canonical Name / Command ID
 *   description: Canonical Description
 *   options:
 *     option_name:
 *       name: Canonical option name / option ID
 *       description: Canonical Description
 *
 * Commands created with this builder will automatically have their `description`, `name_localizations`, and
 * `description_localizations` populated with data from the available locale files.
 *
 * @class
 */
class LocalizedSlashCommandBuilder extends SlashCommandBuilder {
  constructor(command_name) {
    super()

    this.setName(command_name)
    this.setNameLocalizations(mapped("name", command_name))
    this.setDescription(canonical("description", command_name))
    this.setDescriptionLocalizations(mapped("description", command_name))

    return this
  }

  /**
   * Add localization data to an option
   *
   * This method sets the  `description`, `name_localizations`, and `description_localizations` fields on the
   * passed option.
   *
   * @param  {SlashCommandOptionBuilder} option Option builder class
   * @return {SlashCommandOptionBuilder}        Option with populated localization data
   */
  localizeOption(option) {
    return option
      .setNameLocalizations(mapped("name", this.name, option.name))
      .setDescription(canonical("description", this.name, option.name))
      .setDescriptionLocalizations(mapped("description", this.name, option.name))
  }

  /**
   * Add a new option and populate localization data
   *
   * This is an internal helper to enable the creation of the various `addLocalized*Option` methods.
   *
   * @param {str}            option_name Name to set for the option
   * @param {str}            option_type Type of option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedOption(option_name, option_type, optionfn) {
    let builder_method

    switch(option_type) {
      case "string":
        builder_method = "addStringOption"
        break
      case "integer":
        builder_method = "addIntegerOption"
        break
      case "boolean":
        builder_method = "addBooleanOption"
        break
      default:
        throw new Error(`unknown option type "${option_type}"`)
    }

    this[builder_method]((option) => {
      option.setName(option_name)
      this.localizeOption(option)
      if (optionfn) optionfn(option)
      return option
    })

    return this
  }

  /**
   * Add a new string option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedStringOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "string", optionFn)
  }

  /**
   * Add a new integer option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedIntegerOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "integer", optionFn)
  }

  /**
   * Add a new boolean option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedBooleanOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "boolean", optionFn)
  }
}

module.exports = {
  LocalizedSlashCommandBuilder
}
