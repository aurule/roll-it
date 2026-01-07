const { ButtonStyle } = require("discord.js")
const { Installation } = require("../../db/installation")
const { i18n } = require("../../locales")
const { safe_locale } = require("../../locales/helpers")
const build = require("../../util/message-builders")
const { present } = require("../../presenters/command-name-presenter")
const cancelButton = require("../../components/installation/cancel-button")
const changeButton = require("../../components/installation/change-button")
const saveButton = require("../../components/installation/save-button")

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
function differ(olds, news, formatter = (item) => `${item}`) {
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
 */
module.exports = {
  name: "changes",
  data: (installation_id) => {
    const install_db = new Installation()
    const install = install_db.getInstallation(installation_id)
    const locale = install.locale

    const commands = require("../../commands")
    const cmd_locale = safe_locale(locale)
    const guild_commands = commands.sorted.guild.get(cmd_locale)
    const global_commands = commands.sorted.global.get(cmd_locale)

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
        cancelButton.data(locale),
        changeButton.data(locale).setStyle(ButtonStyle.Secondary),
        saveButton.data(locale),
      ),
    ]

    return build.message(components, { withResponse: true })
  },
  differ,
}
