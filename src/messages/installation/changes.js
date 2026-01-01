const { Installation } = require("../../db/installation")
const { i18n } = require("../../locales")
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
    // these need to use a safe internal locale, or have good fallback logic
    const guild_commands = require("../../commands").sorted.guild.get(locale)
    const global_commands = require("../../commands").sorted.global.get(locale)

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
