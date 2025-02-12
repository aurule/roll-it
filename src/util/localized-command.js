const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("discord.js")

const { canonical, mapped } = require("../locales/helpers")

/**
 * Command builder which automatically populates common localization data
 *
 * This depends on the commands localization data following a common format as used by the `mapped` and
 * `canonical` functions.
 *
 * In the `commands:` namespace,
 * command_name:
 *   name: Canonical Name / Command UID
 *   description: Canonical Description
 *   options:
 *     option_name:
 *       name: Canonical option name / option UID
 *       description: Canonical Description
 *
 * Commands created with this builder will automatically have their `description`, `name_localizations`, and
 * `description_localizations` populated with data from all available locale files.
 *
 * @class
 */
class LocalizedSlashCommandBuilder extends SlashCommandBuilder {
  constructor(command_name) {
    super()

    Object.defineProperty(this, "base_key", { value: "static", writable: true })

    this.base_key = command_name
    this.setName(this.base_key)
    this.setLocalizations()
  }

  setLocalizations() {
    this.setNameLocalizations(mapped("name", this.base_key))
    this.setDescription(canonical("description", this.base_key))
    this.setDescriptionLocalizations(mapped("description", this.base_key))
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
      .setNameLocalizations(mapped("name", this.base_key, option.name))
      .setDescription(canonical("description", this.base_key, option.name))
      .setDescriptionLocalizations(mapped("description", this.base_key, option.name))
  }

  /**
   * Inject a setLocalizedChoices method into string options
   *
   * @param  {SlashCommandOptionBuilder} option Option to modify
   * @return {SlashCommandOptionBuilder}        Option with new method
   */
  injectLocalizeChoices(option) {
    option.setLocalizedChoices = (...values) => {
      option.setChoices(
        values.map((value) => {
          return {
            name: canonical(`choices.${value}`, this.base_key, option.name),
            name_localizations: mapped(`choices.${value}`, this.base_key, option.name),
            value,
          }
        }),
      )
      return option
    }
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

    switch (option_type) {
      case "string":
        builder_method = "addStringOption"
        break
      case "integer":
        builder_method = "addIntegerOption"
        break
      case "boolean":
        builder_method = "addBooleanOption"
        break
      case "user":
        builder_method = "addUserOption"
        break
      case "attachment":
        builder_method = "addAttachmentOption"
        break
      default:
        throw new Error(`unknown option type "${option_type}"`)
    }

    this[builder_method]((option) => {
      option.setName(option_name)
      this.localizeOption(option)
      if (option_type === "string") this.injectLocalizeChoices(option)
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

  /**
   * Add a new user select option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedUserOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "user", optionFn)
  }

  /**
   * Add a new file select option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedAttachmentOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "attachment", optionFn)
  }
}

/**
 * Subcommand builder which automatically populates common localization data
 *
 * This depends on the commands localization data following a common format as used by the `mapped` and
 * `canonical` functions.
 *
 * In the `commands:` namespace,
 * command_name:
 *   subcommand_name:
 *     name: Canonical Name / Command UID
 *     description: Canonical Description
 *     options:
 *       option_name:
 *         name: Canonical option name / option UID
 *         description: Canonical Description
 *
 * Subcommands created with this builder will automatically have their `description`, `name_localizations`, and
 * `description_localizations` populated with data from all available locale files.
 *
 * @class
 */
class LocalizedSubcommandBuilder extends SlashCommandSubcommandBuilder {
  constructor(command_name, parent_name) {
    super()

    Object.defineProperty(this, "base_key", { value: "static", writable: true })

    this.base_key = `${parent_name}.${command_name}`

    this.setName(command_name)
    this.setLocalizations()
  }

  setLocalizations() {
    this.setNameLocalizations(mapped("name", this.base_key))
    this.setDescription(canonical("description", this.base_key))
    this.setDescriptionLocalizations(mapped("description", this.base_key))
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
      .setNameLocalizations(mapped("name", this.base_key, option.name))
      .setDescription(canonical("description", this.base_key, option.name))
      .setDescriptionLocalizations(mapped("description", this.base_key, option.name))
  }

  /**
   * Inject a setLocalizedChoices method into string options
   *
   * @param  {SlashCommandOptionBuilder} option Option to modify
   * @return {SlashCommandOptionBuilder}        Option with new method
   */
  injectLocalizeChoices(option) {
    option.setLocalizedChoices = (...values) => {
      option.setChoices(
        values.map((value) => {
          return {
            name: canonical(`choices.${value}`, this.base_key, option.name),
            name_localizations: mapped(`choices.${value}`, this.base_key, option.name),
            value,
          }
        }),
      )
      return option
    }
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

    switch (option_type) {
      case "string":
        builder_method = "addStringOption"
        break
      case "integer":
        builder_method = "addIntegerOption"
        break
      case "boolean":
        builder_method = "addBooleanOption"
        break
      case "user":
        builder_method = "addUserOption"
        break
      case "attachment":
        builder_method = "addAttachmentOption"
        break
      default:
        throw new Error(`unknown option type "${option_type}"`)
    }

    this[builder_method]((option) => {
      option.setName(option_name)
      this.localizeOption(option)
      if (option_type === "string") this.injectLocalizeChoices(option)
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

  /**
   * Add a new user select option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedUserOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "user", optionFn)
  }

  /**
   * Add a new file select option with localization data
   *
   * @param {str}            option_name Name to set for the option
   * @param {callable}       optionfn    Function to execute. Must take and return an option object.
   * @return {SlashCommandOptionBuilder} Option builder object
   */
  addLocalizedAttachmentOption(option_name, optionFn) {
    return this.addLocalizedOption(option_name, "attachment", optionFn)
  }
}

module.exports = {
  LocalizedSlashCommandBuilder,
  LocalizedSubcommandBuilder,
}
