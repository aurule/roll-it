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
      // Format of `data` is [ { name: 'modifier', type: 4, value: 2 } ] or
      // [ { name: 'topic', type: 3, options: [ { name: 'topic', type: 3, value: 'about' } ] }]
      for (const raw of options.data) {
        if (raw.options) {
          if (raw.options.length > 1) throw new Error(`Too many options!`)
          this.data.set(raw.name, raw.options[0].value)
        } else {
          this.data.set(raw.name, raw.value)
        }
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

  /**
   * Serialize our data to a json-save object
   *
   * The internal options data is converted into an object which can be passed
   * to our constructor. Data keys become object property names and values are
   * assigned directly.
   *
   * @return {object} Object of option data
   */
  toJSON() {
    const opts_obj = {}

    for (const [key, value] of this.data.entries()) {
      opts_obj[key] = value
    }

    return opts_obj
  }
}
