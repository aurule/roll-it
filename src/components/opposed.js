const fs = require("fs")
const path = require("path")
const { Collection, userMention } = require("discord.js")

const { Opposed }  = require("../db/opposed")
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
  return customId.replaceAll(num_regex, '')
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
    // if (!opposed_db.hasMessage(interaction.message.id)) {
    //   const t = i18n.getFixedT(interaction.locale, "interactive", "opposed")
    //   interaction
    //     .whisper(t("concluded"))
    //     .catch((error) =>
    //       logger.warn(
    //         { err: error, user: interaction.user.id, component: interaction.customId },
    //         `Could not whisper about concluded opposed challenge from ${interaction.customId}`,
    //       ),
    //     )
    //   return
    // }

    // if (opposed_db.isMessageExpired(interaction.message.id)) {
    //   const challenge = challenge_db.findChallengeByMessage(interaction.message.id)
    //   const t = i18n.getFixedT(interaction.locale, "interactive", "challenge")
    //   await opposedTimeout(challenge.id)
    //   await interaction
    //     .whisper(t("concluded"))
    //     .catch((error) =>
    //       logger.warn(
    //         { err: error, user: interaction.user.id, component: interaction.customId },
    //         `Could not whisper about expired opposed challenge from ${interaction.customId}`,
    //       ),
    //     )
    //   return
    // }

    // TODO handle case where message is associated with a (re)test that is finished, but the test itself is ongoing

    const component = components.get(sanitize_id(interaction.customId))
    try {
      return component.execute(interaction)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logger.info({
          user: interaction.user,
          component: interaction.customId,
          detail: "unauthorized component interaction",
        })
        return interaction
          .whisper(i18n.t("opposed.unauthorized", {
            ns: "interactive",
            lng: interaction.locale,
            participants: err.allowed_uids.map(userMention),
          }))
          .catch(err => {
            logger.error({
              err,
              user: interaction.user,
              component: interaction.customId,
            })
          })
      } else {
        logger.error({
          err,
          user: interaction.user,
          component: interaction.customId,
        })
      }
    }
  },
}
