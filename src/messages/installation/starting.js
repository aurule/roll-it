import { Installation } from "../../db/installation.js"
import { i18n } from "../../locales/index.js"
import ChangeButton from "../../components/installation/change-button.js"
import CancelButton from "../../components/installation/cancel-button.js"
import * as build from "../../util/message-builders.js"
import { present } from "../../presenters/command-name-presenter.js"
import { sortedCommands } from "../../commands/index.js"

/**
 * Message shown upon starting an install process
 * @param  {number}         installation_id Internal ID of the installation record
 * @return {MessageBuilder}                 Message data object
 */
export function messageData(installation_id) {
  const install_db = new Installation()
  const install = install_db.getInstallation(installation_id)
  const locale = install.locale
  const data_t = i18n.getFixedT(locale, "translation")
  const t = i18n.getFixedT(locale, "install")

  const guild_commands = sortedCommands(locale).guild
  const global_commands = sortedCommands(locale).globals

  const system_titles = install.old_deets.systems.map((k) => `_${data_t(`systems.${k}.title`)}_`)
  const feature_titles = install.old_deets.features.map((k) => data_t(`features.${k}.title`))
  const command_names = guild_commands
    .filter((c) => install.old_deets.commands.includes(c.name))
    .map((c) => present(c, locale))
  const global_names = global_commands.map((c) => present(c, locale))

  const t_args = {
    systems: system_titles,
    features: feature_titles,
    commands: command_names,
    globals: global_names,
  }
  const components = [
    build.text(t("starting", t_args)),
    build.actions(CancelButton.data(locale), ChangeButton.data(locale)),
  ]

  return build.message(components, { withResponse: true })
}
