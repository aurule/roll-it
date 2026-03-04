import { Command } from "./command.js"

/**
 * Class for commands which can be saved
 *
 * This covers the majority of dice rolling commands.
 */
export class SavableCommand extends Command {
  static savable = true

  /**
   * Array of option names which can be altered after saving
   *
   * Each _must_ be a numeric option. Used by `/saved grow` and `/saved roll`.
   * The first option name will be changed by default when the user fails to
   * pick a specific option.
   *
   * @type {string[]}
   */
  static changeable = []

  /**
   * Create a new SavableCommand
   *
   * Unlike simple commands, savable commands can be invoked with a set of saved
   * options.
   *
   * @param  {Interaction}     interaction Discord interaction object
   * @param  {CommandOptions?} options     Object of option overrides
   * @return {SavableCommand}              New SavableCommand object
   */
  constructor(interaction, options) {
    super(interaction)

    if (options) {
      this.options = options
    }
  }
}
