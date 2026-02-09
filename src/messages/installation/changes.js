import { ButtonStyle } from "discord.js"
import { Installation } from "../../db/installation.js"
import { i18n } from "../../locales/index.js"
import * as build from "../../util/message-builders.js"
import { present } from "../../presenters/command-name-presenter.js"
import CancelButton from "../../components/installation/cancel-button.js"
import ChangeButton from "../../components/installation/change-button.js"
import SaveButton from "../../components/installation/save-button.js"
import { sortedCommands } from "../../commands/index.js"

/**
 * Highlight changes between two arrays
 *
 * Added items (only found in `news`) are underlined using Discord's custom
 * notation (__double underscore__). Removed items (only found in `olds`) are
 * struck through using ~~standard tilde notation~~. Common items (present in
 * `olds` and `news`) are not marked.
 *
 * @param  {string[]} olds      Array of old items
 * @param  {string[]} news      Array of new items
 * @param  {Function} formatter Function to format the item
 * @return {string[]}           Array of (formatted) items, marked up
 */
export function differ(olds, news, formatter = (item) => `${item}`) {
  const old_set = new Set(olds)
  const new_set = new Set(news)
  const all_set = old_set.union(new_set)

  let outs = []
  for (const item of all_set) {
    const formatted = formatter(item)
    switch (true) {
      case old_set.has(item) && new_set.has(item):
        outs.push(formatted)
        break
      case old_set.has(item):
        outs.push(`~~${formatted}~~`)
        break
      default:
        outs.push(`__${formatted}__`)
    }
  }
  return outs
}

/**
 * Message shown upon selecting new things to install
 * @param  {number}         installation_id Internal ID of the installation record
 * @return {MessageBuilder}                 Message data object
 */
export function messageData(installation_id) {
  const install_db = new Installation()
  const install = install_db.getInstallation(installation_id)
  const locale = install.locale

  const guild_commands = sortedCommands(locale).guild
  const global_commands = sortedCommands(locale).globals

  const data_t = i18n.getFixedT(locale, "translation")
  const t = i18n.getFixedT(locale, "install")

  const system_titles = differ(
    install.old_deets.systems,
    install.new_deets.systems,
    (s) => `*${data_t(`systems.${s}.title`)}*`,
  )

  const feature_titles = differ(
    install.old_deets.features,
    install.new_deets.features,
    (f) => `${data_t(`features.${f}.title`)}`,
  )

  const old_commands = new Set(install.old_deets.commands)
  const new_commands = new Set(install.new_deets.commands)
  const all_commands = old_commands.union(new_commands)

  let added_commands = [] // technically added and remaining commands
  let removed_commands = []

  const relevant_commands = guild_commands.filter((cmd) => all_commands.has(cmd.name))
  for (const cmd of relevant_commands.values()) {
    const presented = present(cmd, locale)
    switch (true) {
      case old_commands.has(cmd.name) && new_commands.has(cmd.name):
        added_commands.push(presented)
        break
      case old_commands.has(cmd.name):
        removed_commands.push(`~~${presented}~~`)
        break
      default:
        added_commands.push(`__${presented}__`)
        break
    }
  }

  const global_names = global_commands.map((c) => present(c, locale))

  const t_args = {
    systems: system_titles,
    features: feature_titles,
    commands: [...added_commands, ...removed_commands],
    globals: global_names,
  }
  const components = [
    build.text(t("changes", t_args)),
    build.actions(
      CancelButton.data(locale),
      ChangeButton.data(locale).setStyle(ButtonStyle.Secondary),
      SaveButton.data(locale),
    ),
  ]

  return build.message(components, { withResponse: true })
}
