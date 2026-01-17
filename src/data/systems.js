import { Collection } from "discord.js"

/**
 * Collection of supported systems and the commands needed for each
 *
 * @type {Collection<System>}
 */
export const systems = new Collection()

register(new System("curv").require("curv").recommend("formula", "d4", "d6", "d8", "d10", "d12", "d20", "d100").optional("table"))
register(new System("dnd35").require("dnd", "formula").recommend("d4", "d6", "d8", "d10", "d12", "d100").optional("table"))
register(new System("dnd5e").require("d20").recommend("formula", "d4", "d6", "d8", "d10", "d12", "d100").optional("table"))
register(new System("drh").require("drh"))
register(new System("fate").require("fate"))
register(new System("ffrpg").require("ffrpg", "d10", "formula").recommend("d100"))
register(new System("generic").require("d4", "d6", "d8", "d10", "d12", "d20", "d100", "formula").optional("table"))
register(new System("kob").require("kob").recommend("formula"))
register(new System("met").require("met").recommend("d10", "chop"))
register(new System("nwod").require("nwod", "d10"))
register(new System("pba").require("pba"))
register(new System("shadowrun").require("shadowrun").recommend("formula", "d6"))
register(new System("sra").require("sra").recommend("formula", "d6"))
register(new System("swn").require("d20", "swn").recommend("formula", "d100", "table", "d4", "d6", "d8"))
register(new System("wod20").require("wod20", "d10"))

/**
 * Register a system
 *
 * @param  {System} system System object
 */
export function register(system) {
  systems.set(system.name, system)
}

/**
 * System class
 */
export class System {
  /**
   * Internal ID of the system
   *
   * @type {string}
   */
  name

  /**
   * Array of commands necessary to support the system
   * @type {object}
   */
  commands = {
    required: [],
    recommended: [],
    optional: [],
  }

  /**
   * Create a new System object
   * @param  {string} name Name of the system
   * @return {System}      New system object
   */
  constructor(name) {
    this.name = name
  }

  /**
   * Set the system's required commands
   *
   * Required commands are the minimum necessary for the system to be usable.
   *
   * @param  {...string} command_names Names of the commands that must be present for the system to be supported
   * @return {System}                  This system object
   */
  require(...command_names) {
    this.commands.required = command_names
    return this
  }

  /**
   * Set the system's recommended commands
   *
   * Recommended commands are the rest of the commands that should be installed for the system to be usable.
   *
   * @param  {...string} command_names Names of the commands that should be present for the system to be supported
   * @return {System}                  This system object
   */
  recommend(...command_names) {
    this.commands.recommended = command_names
    return this
  }

  /**
   * Set the system's optional commands
   *
   * Optional commands add functionality to a system, but are not required for its use.
   *
   * @param  {...string} command_names Names of the commands that add to the system's functionality
   * @return {System}                  This system object
   */
  optional(...command_names) {
    this.commands.optional = command_names
    return this
  }
}
