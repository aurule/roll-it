import { Collection } from "discord.js"
import { available_locales } from "../locales/index.js"
import { comparator } from "../util/command-sorter.js"

import { Coin } from "./coin.js"
import { D10 } from "./d10.js"
import { D100 } from "./d100.js"
import { D12 } from "./d12.js"
import { D20 } from "./d20.js"
import { D4 } from "./d4.js"
import { D6 } from "./d6.js"
import { D8 } from "./d8.js"
import { Drh } from "./drh.js"
import { Fate } from "./fate.js"
import { Ffrpg } from "./ffrpg.js"
import { Formula } from "./formula.js"
import { Kob } from "./kob.js"
import { Magic8Ball } from "./8ball.js"
import { Pba } from "./pba.js"
import { ReportThisRoll } from "./report-this-roll.js"
import { Roll } from "./roll.js"
import { SaveThisRoll } from "./save-this-roll.js"
import { SetupRollIt } from "./setup-roll-it.js"
import { Sra } from "./sra.js"
import { Swn } from "./swn.js"
import { Dnd } from "./dnd.js"

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

  if (kommand.savable) savable.set(kommand.name, kommand)
  if (kommand.teamworkable) teamworkable.set(kommand.name, kommand)

  // duplicate the registration logic for subcommands using their compound key
  const subcommands = kommand.children ?? []
  for (const subc in subcommands) {
    const subc_key = `${kommand.name} ${subc.name}`
    commands.set(subc_key, kommand)
    all_choices.push({
      name: subc_key,
      value: kommand.name,
    })
    if (subc.savable) savable.set(subc_key, kommand)
    if (subc.teamworkable) teamworkable.set(subc_key, kommand)
  }
}

// Register all command classes
register(Coin)
register(D10)
register(D100)
register(D12)
register(D20)
register(D4)
register(D6)
register(D8)
register(Dnd)
register(Drh)
register(Fate)
register(Ffrpg)
register(Formula)
register(Kob)
register(Magic8Ball)
register(Pba)
register(ReportThisRoll)
register(Roll)
register(SaveThisRoll)
register(SetupRollIt)
register(Sra)
register(Swn)

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
