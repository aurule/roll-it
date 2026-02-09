import { Collection } from "discord.js"

import { present, list } from "../presenters/command-name-presenter"
import { sorted, commands, sortedCommands } from "../commands/index.js"
import { systems } from "./systems.js"
import { i18n } from "../locales/index.js"
import { data as changesData } from "./help/changes.js"

/**
 * Collection of help topics
 * @type Collection<string, Function>
 */
export const helpTopics = new Collection()

export function register(name, data) {
  helpTopics.set(name, data)
}

register("about", (_locale) => {})

register("changes", changesData)

register("commands", (locale) => {
  return {
    commands: list(sortedCommands(locale).commands, locale)
  }
})

register("saved", (locale) => {
  return {
    savable: list(sortedCommands(locale).savable, locale)
  }
})

register("systems", (locale) => {
  const t = i18n.getFixedT(locale, "translation", "systems")

  return {
    systems: systems.map((system) => {
      const details = t(system.name, { returnObjects: true })
      details.commands = system.commands.required.map((command_name) => {
        const command = commands.get(command_name)
        return present(command, locale)
      })
      return t("listing", details)
    })
  }
})

register("teamwork", (locale) => {
  return {
    teamworkable: list(sortedCommands(locale).teamworkable, locale)
  }
})
