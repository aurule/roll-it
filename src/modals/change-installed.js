const {
  StringSelectMenuBuilder
} = require("discord.js")

const { i18n } = require("../locales")
const { systemOptions } = require("../presenters/system-options-presenter")
const { systems, features } = require("../data")
const build = require("../util/modal-builders")
const { featureOptions } = require("../presenters/feature-options-presenter")

/**
 * Modal for changing a server's installed systems and features
 * @type {Object}
 */
module.exports = {
  name: "change-installed",
  /**
   * Create the modal's data
   * @param  {Installation} installation Installation record
   * @return {ModalBuilder}              Modal data object
   */
  data(installation) {
    const t = i18n.getFixedT(installation.locale, "install", "change-installed")

    const systemSelect = new StringSelectMenuBuilder({
      custom_id: "systems",
      placeholder: t("systems.placeholder"),
      options: systemOptions(installation.locale, installation.old_deets.systems),
      max_values: systems.size,
      required: false,
    })

    const featureSelect = new StringSelectMenuBuilder({
      custom_id: "features",
      placeholder: t("features.placeholder"),
      options: featureOptions(installation.locale, installation.old_deets.features),
      max_values: features.size,
      required: false,
    })

    const components = [
      build.text(t("prompt")),
      build.label(systemSelect, t("systems.label"), t("systems.description")),
      build.label(featureSelect, t("features.label")),
      build.text(t("afterward")),
    ]

    return build.modal(`${module.exports.name}_${installation.id}`, t("title"), components)
  },
  async submit(modal_interaction, installation_id) {
    const install_db = new Installation()

    // generate new_deets
    // if they're identical, just acknowledge the interaction
    // update the install's new_deets
    // send the changes message
  }
}
