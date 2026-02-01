import { Collection } from "discord.js"
import { available_locales } from "../locales/index.js"
import { comparator } from "../util/command-sorter.js"

import { Magic8Ball } from "./8ball.js"
import { SetupRollIt } from "./setup-roll-it.js"
import { Coin } from "./coin.js"
import { ReportThisRoll } from "./report-this-roll.js"
import { SaveThisRoll } from "./save-this-roll.js"

/**
 * Top-level collection of command objects
 *
 * Various keys are reserved for grouping commands. Otherwise, keys match the name of the bot's commands.
 *
 * @type {Collection}
 */
export const commands = new Collection()

export const all_choices = []

export const globals = new Collection()
export const guild = new Collection()
export const savable = new Collection()
export const teamworkable = new Collection()

function register(kommand) {
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

  // for each subcommand...
  //   add to commands with the key `${command.name} ${subc.name}`
  //   add to all_choices as `${command.name} ${subc.name}`

  if (kommand.savable) savable.set(kommand.name, kommand)
  if (kommand.teamworkable) teamworkable.set(kommand.name, kommand)
}

// Register all command classes
register(Magic8Ball)
register(Coin)
register(SetupRollIt)
register(ReportThisRoll)
register(SaveThisRoll)

// set up per-locale sorted collections
commands.sorted = new Collection()
globals.sorted = new Collection()
guild.sorted = new Collection()
savable.sorted = new Collection()
teamworkable.sorted = new Collection()

for (const locale of available_locales) {
  commands.sorted.set(locale, commands.toSorted(comparator(locale)))
  globals.sorted.set(locale, globals.toSorted(comparator(locale)))
  guild.sorted.set(locale, guild.toSorted(comparator(locale)))
  savable.sorted.set(locale, savable.toSorted(comparator(locale)))
  teamworkable.sorted.set(locale, teamworkable.toSorted(comparator(locale)))
}
