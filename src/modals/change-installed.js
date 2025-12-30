
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

    const modal = new ModalBuilder()
      .setCustomId(`${module.exports.name}_${installation.id}`)
      .setTitle(t("title"))

    // show prompt
    // system picker
    // feature picker
    // show afterward

    return modal
  }
}
