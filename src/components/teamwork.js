const fs = require("fs")
const path = require("path")
const { Collection, userMention } = require("discord.js")

const { Teamwork } = require("../db/teamwork")
const { teamworkTimeout } = require("../interactive/teamwork")
const { jsNoTests, noDotFiles } = require("../util/filters")
const { logger } = require("../util/logger")
const { i18n } = require("../locales")
const { UnauthorizedError } = require("../errors/unauthorized-error")

const componentsDir = path.join(__dirname, "teamwork")

const components = new Collection()

const contents = fs.readdirSync(componentsDir).filter(jsNoTests).filter(noDotFiles)

contents.forEach((mention_file) => {
  const handler = require(path.join(componentsDir, mention_file))
  components.set(handler.name, handler)
})

module.exports = {
  /**
   * Collection of component objects related to teamwork activities
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
   * This ensures the test is active and then dispatches handling to the appropriate component object.
   *
   * @param  {Interaction} interaction Discord component interaction
   * @return {Promise}                 Promise from the component
   */
  async handle(interaction) {
    const teamwork_db = new Teamwork()

    // ensure the component's message still exists in the database
    if (!teamwork_db.hasMessage(interaction.message.id)) {
      return interaction.ensure("whisper", i18n.t("concluded", { lng: interaction.locale, ns: "teamwork" }), {
        component: interaction.customId,
        message: interaction.message,
        detail: "could not whisper about missing teamwork test from message",
      })
    }

    /*
     * handle case where
     * - message exists
     * - teamwork test is past its expiry time
     * - teamwork test is not yet marked as concluded
     */
    if (teamwork_db.isMessageExpired(interaction.message.id)) {
      const teamwork_test = teamwork_db.findTestByMessage(interaction.message.id)
      await teamworkTimeout(teamwork_test.id)
      return interaction.ensure("whisper", i18n.t("concluded", { lng: interaction.locale, ns: "teamwork" }), {
        test: teamwork_test,
        component: interaction.customId,
        message: interaction.message,
        detail: "could not whisper about expired teamwork test",
      })
    }

    const component = components.get(interaction.customId)
    try {
      return component.execute(interaction)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logger.info({
          user: interaction.user,
          component: component.name,
          detail: "unauthorized component interaction",
        })
        return interaction
          .whisper(
            i18n.t("opposed.unauthorized", {
              ns: "interactive",
              lng: interaction.locale,
              participants: err.allowed_uids.map(userMention),
            }),
          )
          .catch((err) => {
            logger.error({
              err,
              user: interaction.user,
              component: component.name,
            })
          })
      } else {
        logger.error({
          err,
          user: interaction.user,
          component: component.name,
        })
      }
    }
  },
}
