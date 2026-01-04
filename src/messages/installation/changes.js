const { Installation } = require("../../db/installation")
const { i18n } = require("../../locales")
const { safe_locale } = require("../../locales/helpers")
const build = require("../../util/message-builders")
const { present } = require("../../presenters/command-name-presenter")
const cancelButton = require("../../components/installation/cancel-button")
const changeButton = require("../../components/installation/change-button")

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

    // changes should take this form:
    // ~~*removed system*~~, *remaining system*, __*added system*__
    // make a combined set from old and new
    // iterate that
    // if the thing appears in both, use neutral formatting
    // if it's only in old, use removed formatting
    // if it's only in new, use added formatting

    const global_names = global_commands.map(c => present(c, locale))

    const t_args = {
      systems: system_titles,
      features: feature_titles,
      commands: command_names,
      globals: global_names,
    }
    const components = [
      build.text(t("changes", t_args)),
      // build.actions(cancelButton.data(locale), changeButton.data(locale), saveButton.data(locale))
    ]

    return build.message(components, { withResponse: true })
  }
}
