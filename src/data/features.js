import { Collection } from "discord.js"

/**
 * Collection of features
 * @type {Collection}
 */
export const features = new Collection()

register("8ball", "8ball")
register("coinflip", "coin")
register("formulas", "formula")
register("tables", "table")

/**
 * Register a new feature
 *
 * @param  {string}    name           Name of the feature
 * @param  {...string} commands_names Names of the commands required to support the feature
 */
export function register(name, ...commands_names) {
  features.set(name, {
    name,
    commands: commands_names,
  })
}
