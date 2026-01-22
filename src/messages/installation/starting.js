const { Installation } = require("../../db/installation")
import { i18n } from "../../locales/index.js"
const change_button = require("../../components/installation/change-button")
const cancel_button = require("../../components/installation/cancel-button")
const build = require("../../util/message-builders")
const { present } = require("../../presenters/command-name-presenter")
const { safe_locale } = require("../../locales/helpers")

/**
 * Message shown upon starting an install process
 */
module.exports = {
  name: "starting",
  data: (installation_id) => {
    const install_db = new Installation()
    const install = install_db.getInstallation(installation_id)
    const locale = install.locale
    const data_t = i18n.getFixedT(locale, "translation")
    const t = i18n.getFixedT(locale, "install")

    const commands = require("../../commands")
    const cmd_locale = safe_locale(locale)
    const guild_commands = commands.sorted.guild.get(cmd_locale)
    const global_commands = commands.sorted.global.get(cmd_locale)

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
      build.actions(cancel_button.data(locale), change_button.data(locale)),
    ]

    return build.message(components, { withResponse: true })
  },
}
