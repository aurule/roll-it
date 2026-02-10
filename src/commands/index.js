import { Collection } from "discord.js"
import { safe_locale } from "../locales/helpers.js"
import { comparator } from "../util/command-sorter.js"

/**
 * Top-level collection of command objects
 *
 * Top-level commands are keyed by their static `name` property. This lets the
 * interaction handler look them up from the data passed by Discord.
 *
 * Subcommands are keyed by a combination of their parent name and own
 * name: `parent child`.
 *
 * @see interactionCreate.js
 *
 * @type {Collection<string, Command>}
 */
export const commands = new Collection()

/**
 * Array of select option autocomplete objects for every command and subcommand
 * @type {object[]}
 */
export const all_choices = []

/**
 * Collection of globally available commands
 * @type {Collection<string, Command>}
 */
export const globals = new Collection()

/**
 * Collection of commands that can be installed to a guild
 * @type {Collection<string, Command>}
 */
export const guild = new Collection()

/**
 * Collection of commands which can be saved
 * @type {Collection<string, SavableCommand>}
 */
export const savable = new Collection()

/**
 * Collection of commands which support interactive teamwork
 * @type {Collection<string, TeamworkableCommand>}
 */
export const teamworkable = new Collection()

/**
 * Collection of command data sorted by locale
 * @type {Collection}
 */
export const sorted = new Collection()

/**
 * Register a command class so it's callable
 *
 * This adds the passed class to various collections based on its properties.
 *
 * @param  {Command} kommand Command class to register
 */
export function registerCommand(kommand) {
  commands.set(kommand.name, kommand)
  all_choices.push({
    name: kommand.name,
    value: kommand.name,
  })
  if (kommand.global) {
    globals.set(kommand.name, kommand)
  } else {
    guild.set(kommand.name, kommand)
  }

  if (kommand.savable) savable.set(kommand.name, kommand)
  if (kommand.teamworkable) teamworkable.set(kommand.name, kommand)

  // duplicate the registration logic for subcommands using their compound key
  const subcommands = kommand.children ?? []
  for (const subc of subcommands) {
    const subc_key = `${kommand.name} ${subc.name}`
    commands.set(subc_key, subc)
    all_choices.push({
      name: subc_key,
      value: subc.name,
    })
    if (subc.savable) savable.set(subc_key, kommand)
    if (subc.teamworkable) teamworkable.set(subc_key, kommand)
  }
}

/**
 * Generate the sorted collections for a given locale
 *
 * Locale _must_ be one which exists in our translation files. Use safe_locale to be sure.
 *
 * @param  {string} locale Locale code to generate
 * @return {object}        Object of command collections sorted for the given locale
 */
export function buildSorted(locale) {
  const comparatorFn = comparator(locale)
  return {
    commands: commands.clone().sort(comparatorFn),
    globals: globals.clone().sort(comparatorFn),
    guild: guild.clone().sort(comparatorFn),
    savable: savable.clone().sort(comparatorFn),
    teamworkable: teamworkable.clone().sort(comparatorFn),
  }
}

/**
 * Get the sorted command collections for a given locale
 * @param  {string} locale Locale code to generate
 * @return {object}        Object of command collections sorted for the given locale
 */
export function sortedCommands(locale) {
  const real_locale = safe_locale(locale)
  return sorted.ensure(real_locale, buildSorted)
}
