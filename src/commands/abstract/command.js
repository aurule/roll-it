import { i18n } from "../../locales/index.js"
import { LocalizedSlashCommandBuilder } from "../../util/localized-command.js"
import { injectMention } from "../../util/formatters/inject-user.js"
import { CommandOptions } from "./command-options.js"

/**
 * Basic class to handle Discord slash commands
 *
 * This class handles simple slash commands which are not savable. Context
 * commands, savable commands, parents, and their subcommands each have a
 * separate class.
 */
export class Command {
  /**
   * The unique name of this command
   *
   * This name is included in Interaction objects and is used to look up the
   * command. It _must_ be unique among all top-level commands.
   *
   * Slash commands also use this string as their translation key.
   *
   * @type string
   */
  static name

  /**
   * Joi schema for the command's options
   *
   * This is not currently used outside of the saved roll system, but every
   * command should still have a schema.
   *
   * @type Joi.object
   */
  static schema

  /**
   * Whether this command is global, or scoped to specific guilds
   * @type {boolean}
   */
  static global = false

  /**
   * Command type code
   *
   * One of "menu" or "slash"
   * 
   * @type {string}
   */
  static type = "slash"

  /**
   * Discord Interaction object
   * @type Interaction
   */
  interaction

  /**
   * Internal options container
   * @type CommandOptions
   */
  options

  /**
   * Extracted locale code
   * @type string
   */
  locale

  /**
   * Whether the command's response should be ephemeral
   * @type boolean
   */
  secret = false

  /**
   * Translation function scoped to this command
   * @type i18n.t
   */
  t

  /**
   * Get a command builder using our name
   * @return {LocalizedSlashCommandBuilder} Builder object
   */
  static get builder() {
    return new LocalizedSlashCommandBuilder(this.name)
  }

  /**
   * Construct the data for this command
   * @return {SlashCommandBuilder} Command data
   */
  static data() {
    throw new Error("The function `data` is not implemented")
  }

  /**
   * Create a new Command object
   *
   * Subclasses should use their constructor to extract command option data.
   *
   * By default, only the "secret" boolean option is extracted and set.
   *
   * @param  {Interaction} interaction Discord interaction object
   * @return {Command}                 New Command object
   */
  constructor(interaction) {
    this.interaction = interaction
    this.options = new CommandOptions(interaction.options)
    this.locale = interaction.locale
    this.t = i18n.getFixedT(this.locale, "commands", this.constructor.name)

    this.saveOption("secret")
  }

  /**
   * Main invocation method
   *
   * This invokes validate() and then perform().
   *
   * @return {Promise} Message reply promise
   */
  async execute() {
    const error_message = this.validate()
    if (error_message) {
      return this.interaction.whisper(error_message)
    }

    const partial_message = this.perform()

    const full_text = injectMention(partial_message, this.interaction.user.id)
    return this.interaction.paginate({
      content: full_text,
      secret: this.secret,
    })
  }

  /**
   * Validate the option values
   *
   * If all is well, return undefined or some other falsy value. Returning a
   * string will send an error message to the user and abort execution
   * immediately.
   *
   * @return {string?} Error message to show. Omit to continue execution.
   */
  validate() {
    return undefined
  }

  /**
   * Do the command's actual work
   *
   * For most commands, this method is responsible for rolling dice and
   * formtting the output. The returned string should contain the
   * `{{userMention}}` template variable, which will be replaced with the
   * formatted mention string for the user who invoked the command.
   *
   * @return {string} Response string with user placeholder
   */
  perform() {
    throw new Error("The function `perform` is not implemented")
  }

  /**
   * Get data for this command's help text
   *
   * Many commands do not need additional help data. By default, the following
   * vars are available to the translated help text:
   *
   * - `cmd`: The translated name of the command
   * - `opts`: Object of translated option names keyed by option i18n name
   * - `sub`: Object of translated subcommand names, keyed by subcommand i18n name
   *
   * If the command's help text needs other data, add it here.
   *
   * @param  {object} opts Default help properties
   * @return {object}      New help properties to add
   */
  static help_data(opts) {
    return {}
  }

  /**
   * Save a user option value to an own property
   *
   * This works on the assumption that all of our option names map 1:1 with an
   * object property. If that option was given a value by the user, it is saved
   * to the corresponding property. If not, then the property's existing value
   * is unchanged. This makes it possible to assign default values at the class
   * or instance level while still respecting user inputs.
   *
   * @param  {string}                name Name of the option (and property) to save
   * @return {string|number|boolean}      The resolved value of the property. Either the user value or the default value.
   */
  saveOption(name) {
    const user_value = this.options.get(name)
    if (user_value) {
      this[name] = user_value
    }
    return this[name]
  }
}
