import { Collection } from "discord.js"

/**
 * Class for handling command options
 */
export class CommandOptions {
  /**
   * Internal option data
   * @type Collection<string, string|number|boolean>
   */
  data

  /**
   * Create a new CommandOptions object
   *
   * This class can be instantiated from an Interaction's options object, or
   * from a saved object of options.
   *
   * @param  {ApiOptions|object} options Options data object
   * @return {CommandOptions}            New CommandOptions object
   */
  constructor(options) {
    this.data = new Collection()

    if (Array.isArray(options.data)) {
      // We have an interaction options object.
      // Format of `data` is [ { name: 'modifier', type: 4, value: 2 } ]
      for (const raw of options.data) {
        this.data.set(raw.name, raw.value)
      }
    } else {
      // We have an internal saved options object
      // Format is { modifier: 2 }
      for (const name in options) {
        this.data.set(name, options[name])
      }
    }
  }

  /**
   * Get an option by name
   * @param  {string}                name Name of the option to get
   * @return {string|number|boolean}      Option value
   */
  get(name) {
    return this.data.get(name)
  }
}
