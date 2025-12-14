const { Installation } = require("../../db/installation")
const { i18n } = require("../../locales")
const systems_button = require("../../components/installation/systems-button")
const features_button = require("../../components/installation/features-button")
const cancel_button = require("../../components/installation/cancel-button")
const build = require("../../util/message-builders")

/**
 * Message shown upon starting an install process
 */
module.exports = {
  state: "starting",
  data: (installation_id) => {
    const install_db = new Installation()
    const install = install_db.getInstallation(installation_id)
    const t = i18n.getFixedT(install.locale, "install")
    const globals = require("../../commands").global

    const t_args = {
      systems: install.old_deets.systems.map(s => s.name),
      features: install.old_deets.features.map(f => f.name),
      commands: install.old_deets.commands.map(c => c.name),
      globals: globals.map(g => g.name),
    }
    const components = [
      build.text(t("message", t_args)),
      build.actions(systems_button, features_button, cancel_button)
    ]

    return build.message(components, { withResponse: true })
  }
}
