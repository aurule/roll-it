import { Collection } from "discord.js"
import { available_locales } from "../locales/index.js"
import { comparator } from "../util/command-sorter.js"

import { Magic8Ball } from "./8ball.js"
import { SetupRollIt } from "./setup-roll-it.js"
import { Coin } from "./coin.js"
import { ReportThisRoll } from "./report-this-roll.js"
import { SaveThisRoll } from "./save-this-roll.js"
import { D10 } from "./d10.js"
import { D100 } from "./d100.js"
import { D12 } from "./d12.js"
import { D4 } from "./d4.js"
import { D6 } from "./d6.js"
import { D20 } from "./d20.js"
import { D8 } from "./d8.js"
import { DRH } from "./drh.js"
import { Fate } from "./fate.js"
import { Ffrpg } from "./ffrpg.js"
import { Formula } from "./formula.js"

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
register(D10)
register(D100)
register(D12)
register(D4)
register(D6)
register(D8)
register(D20)
register(DRH)
register(Fate)
register(Ffrpg)
register(Formula)

// set up per-locale sorted collections
commands.sorted = new Collection()
globals.sorted = new Collection()
guild.sorted = new Collection()
savable.sorted = new Collection()
teamworkable.sorted = new Collection()

for (const locale of available_locales) {
  commands.sorted.set(locale, commands.clone().sort(comparator(locale)))
  globals.sorted.set(locale, globals.clone().sort(comparator(locale)))
  guild.sorted.set(locale, guild.clone().sort(comparator(locale)))
  savable.sorted.set(locale, savable.clone().sort(comparator(locale)))
  teamworkable.sorted.set(locale, teamworkable.clone().sort(comparator(locale)))
}
