const fs = require("fs")
const path = require("path")
const { Collection } = require("discord.js")

const { Teamwork } = require("../db/teamwork")
const { teamworkTimeout } = require("../interactive/teamwork")
const { jsNoTests, noDotFiles } = require("../util/filters")
const { logger } = require("../util/logger")
const { i18n } = require("../locales")

const basename = path.basename(__filename)
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
    if (!teamwork_db.hasMessage(interaction.message.id)) {
      const t = i18n.getFixedT(interaction.locale, "interactive", "teamwork")
      interaction
        .whisper(t("concluded"))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: interaction.customId },
            `Could not whisper about concluded teamwork test from ${interaction.customId}`,
          ),
        )
      return
    }

    if (teamwork_db.isMessageExpired(interaction.message.id)) {
      const test = teamwork_db.findTestByMessage(interaction.message.id)
      const t = i18n.getFixedT(interaction.locale, "interactive", "teamwork")
      await teamworkTimeout(test.id)
      await interaction
        .whisper(t("concluded"))
        .catch((error) =>
          logger.warn(
            { err: error, user: interaction.user.id, component: interaction.customId },
            `Could not whisper about expired teamwork test from ${interaction.customId}`,
          ),
        )
      return
    }

    const component = components.get(interaction.customId)
    return component.execute(interaction)
  },
}
