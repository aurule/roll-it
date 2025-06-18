const fs = require("fs")
const path = require("path")
const { Collection, userMention } = require("discord.js")

const { Opposed } = require("../db/opposed")
const { opposedTimeout } = require("../interactive/opposed")
const { jsNoTests, noDotFiles } = require("../util/filters")
const { logger } = require("../util/logger")
const { i18n } = require("../locales")

const basename = path.basename(__filename)
const componentsDir = path.join(__dirname, "opposed")

const components = new Collection()

const contents = fs.readdirSync(componentsDir).filter(jsNoTests).filter(noDotFiles)

contents.forEach((mention_file) => {
  const handler = require(path.join(componentsDir, mention_file))
  components.set(handler.name, handler)
})

const num_regex = /_\d+/gi

function sanitize_id(customId) {
  return customId.replaceAll(num_regex, "")
}

module.exports = {
  sanitize_id,

  /**
   * Collection of component objects related to met-opposed activities
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
    return components.has(sanitize_id(interaction.customId))
  },

  /**
   * Handle an interaction
   *
   * This ensures the challenge (and possibly test) is active and then dispatches handling to the appropriate
   * component object.
   *
   * @param  {Interaction} interaction Discord component interaction
   * @return {Promise}                 Promise from the component
   */
  async handle(interaction) {
    const opposed_db = new Opposed()
    const message_id = interaction.message.id
    const component_name = interaction.customId

    // component's message is not recorded
    if (!opposed_db.hasMessage(message_id)) {
      const t = i18n.getFixedT(interaction.locale, "interactive", "opposed")
      return interaction.ensure("whisper", t("concluded"), {
        user: interaction.user.id,
        component: interaction.customId,
        detail: `Could not whisper about concluded opposed challenge from ${component_name}`,
      })
    }

    // message belongs to a finished challenge
    if (opposed_db.challengeFromMessageIsFinalized(message_id)) {
      const t = i18n.getFixedT(interaction.locale, "interactive", "opposed")
      return interaction.ensure("whisper", t("concluded"), {
        user: interaction.user.id,
        component: interaction.customId,
        detail: `Could not whisper about concluded opposed challenge from ${component_name}`,
      })
    }

    // message belongs to a test other than the most recent one
    if (!opposed_db.messageIsForLatestTest(message_id)) {
      const t = i18n.getFixedT(interaction.locale, "interactive", "opposed")
      return interaction.ensure("whisper", t("outdated"), {
        user: interaction.user.id,
        component: interaction.customId,
        detail: `Could not whisper about outdated message from ${component_name}`,
      })
    }

    const component = components.get(sanitize_id(component_name))
    try {
      return component.execute(interaction)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logger.info({
          user: interaction.user,
          component: component_name,
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
              component: component_name,
            })
          })
      } else {
        logger.error({
          err,
          user: interaction.user,
          component: component_name,
        })
      }
    }
  },
}
