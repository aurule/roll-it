import { Collection } from "discord.js"

import { present, list } from "../presenters/command-name-presenter.js"
import { commands, globals, sortedCommands } from "../commands/index.js"
import { systems } from "./systems.js"
import { i18n } from "../locales/index.js"
import { data as changesData } from "./help/changes.js"
import { api } from "../services/api.js"
import { findByCommands as findSystems } from "../services/system-helpers.js"

/**
 * Collection of help topics
 * @type Collection<string, Function>
 */
export const helpTopics = new Collection()

/**
 * Register a help topic function
 *
 * The data function must return an object of relevant data to inject into the
 * translated help string for the named topic.
 *
 * @param  {string}   name Name of the topic. Must match a translation key in help:topics.
 * @param  {function} data Help topic data function
 */
export function register(name, data) {
  helpTopics.set(name, data)
}

register("about", (_locale, _guildId) => { return {} })

register("changes", changesData)

register("commands", async (locale, guildId) => {
  const installed = new Set(api.getGuildCommands(guildId).map(c => c.name))
  for (const global_command of globals) {
    installed.add(global_command.name)
  }
  return {
    commands: list(sortedCommands(locale).commands, locale, installed)
  }
})

register("saved", (locale, guildId) => {
  const installed = new Set(api.getGuildCommands(guildId).map(c => c.name))
  for (const global_command of globals) {
    installed.add(global_command.name)
  }
  return {
    savable: list(sortedCommands(locale).savable, locale, installed)
  }
})

register("systems", (locale, guildId) => {
  const t = i18n.getFixedT(locale, "translation", "systems")
  const installed_commands = api.getGuildCommands(guildId).map(c => c.name)
  const installed_systems = new Set(findSystems(...installed_commands).map((s) => s.name))

  return {
    systems: systems.map((system) => {
      const details = t(system.name, { returnObjects: true })
      details.commands = system.commands.required.map((command_name) => {
        const command = commands.get(command_name)
        return present(command, locale)
      })
      details.context = installed_systems.has(system.name) ? "installed" : undefined
      return t("listing", details)
    })
  }
})

register("teamwork", (locale, guildId) => {
  const installed = new Set(api.getGuildCommands(guildId).map(c => c.name))
  for (const global_command of globals) {
    installed.add(global_command.name)
  }
  return {
    teamworkable: list(sortedCommands(locale).teamworkable, locale, installed)
  }
})
