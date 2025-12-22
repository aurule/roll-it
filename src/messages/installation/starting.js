const { Installation } = require("../../db/installation")
const { i18n } = require("../../locales")
const systems_button = require("../../components/installation/systems-button")
const features_button = require("../../components/installation/features-button")
const cancel_button = require("../../components/installation/cancel-button")
const build = require("../../util/message-builders")
const { present } = require("../../presenters/command-name-presenter")

/**
 * Message shown upon starting an install process
 */
module.exports = {
  state: "starting",
  data: (installation_id) => {
    const install_db = new Installation()
    const install = install_db.getInstallation(installation_id)
    const locale = install.locale
    const commands = require("../../commands")
    const data_t = i18n.getFixedT(locale, "translation")
    const t = i18n.getFixedT(locale, "install", "starting")

    const system_titles = install.old_deets.systems.map(k => data_t(`systems.${k}.title`))
    const feature_titles = install.old_deets.features.map(k => data_t(`features.${k}.title`))
    const command_names = commands.guild.filter(c => install.old_deets.commands.includes(c.name)).map(c => present(c, locale))
    const global_names = commands.global.map(c => present(c, locale))

    const t_args = {
      systems: system_titles,
      features: feature_titles,
      commands: command_names,
      globals: global_names,
    }
    const components = [
      build.text(t("message", t_args)),
      build.actions(systems_button.data(locale), features_button.data(locale), cancel_button.data(locale))
    ]

    return build.message(components, { withResponse: true })
  }
}
