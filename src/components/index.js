const fs = require("fs")
const path = require("path")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const handlersDir = __dirname

/**
 * Array of component handlers
 *
 * @type {Handler[]}
 */
const handlers = []

const contents = fs
  .readdirSync(handlersDir)
  .filter(jsNoTests)
  .filter(noDotFiles)
  .filter((file) => {
    return file !== basename
  })

contents.forEach((mention_file) => {
  const handler = require(path.join(handlersDir, mention_file))
  handlers.push(handler)
})

module.exports = {
  handlers,
  /**
   * Handle a component interaction
   *
   * @param  {Interaction} interaction Message component interaction
   * @param  {Handler[]}   handlers    Array of component handler objects
   * @return {Promise}                 Promise resolving to the outcome of the handler, usually a Message object
   */
  async handle(interaction, handlers_override) {
    const our_handlers = handlers_override ?? handlers
    for (const handler of our_handlers) {
      if (handler.canHandle(interaction)) return handler.handle(interaction)
    }
    return false
  },
}
