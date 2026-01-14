const fs = require("fs")
const path = require("path")
const { Collection, userMention } = require("discord.js")

const { Installation } = require("../db/installation")
const { jsNoTests, noDotFiles } = require("../util/filters")
const { logger } = require("../util/logger")
const { i18n } = require("../locales")
const { UnauthorizedError } = require("../errors/unauthorized-error")
const { sendError } = require("../services/metrics")

const componentsDir = path.join(__dirname, "installation")

const components = new Collection()

const contents = fs.readdirSync(componentsDir).filter(jsNoTests).filter(noDotFiles)

contents.forEach((mention_file) => {
  const handler = require(path.join(componentsDir, mention_file))
  components.set(handler.name, handler)
})

module.exports = {
  /**
   * Collection of component objects related to installation activities
   *
   * @type Collection
   */
  components,

  /**
   * Get whether this handler accepts an interaction
   *
   * To be handled here, the interaction must have a customId which appears in our components collection.
   *
   * @param  {Interaction} interaction Discord component interaction
   * @return {boolean}                 True if the interaction can be handled, false if not
   */
  canHandle(interaction) {
    return components.has(interaction.customId)
  },

  /**
   * Handle an interaction
   *
   * This ensures the installation is active and then dispatches handling to the appropriate component object.
   *
   * @param  {Interaction} interaction Discord component interaction
   * @return {Promise}                 Promise from the component
   */
  async handle(interaction) {
    const install_db = new Installation()
    const message_id = interaction.message.id
    const component_name = interaction.customId

    const component = components.get(component_name)
    const installation = install_db.findInstallationByMessage(message_id)

    // fail unless installation exists, is current, and is not finished
    if (installation === undefined || installation.expired || installation.finished) {
      return interaction.ensure(
        "whisper",
        i18n.t("finished", { lng: interaction.locale, ns: "install" }),
        {
          user: interaction.user.id,
          component: component_name,
          installation,
          detail: `Could not whisper about invalid install from ${component_name}`,
        },
      )
    }

    return component.execute(interaction).catch((err) => {
      if (err instanceof UnauthorizedError) {
        logger.info({
          user: interaction.user,
          component: component_name,
          detail: "unauthorized component interaction",
        })
        return interaction
          .whisper(
            i18n.t("unauthorized", {
              ns: "opposed",
              lng: interaction.locale,
              participants: err.allowed_uids.map(userMention),
            }),
          )
          .catch((err) => {
            logger.warn({
              err,
              user: interaction.user,
              component: component_name,
            })
          })
      } else {
        sendError(err, {
          user: interaction.user,
          component: component_name,
        })
        logger.error({
          err,
          user: interaction.user,
          component: component_name,
        })
      }
    })
  },
}
