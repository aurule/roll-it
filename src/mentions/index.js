const fs = require("fs")
const path = require("path")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const handlersDir = __dirname

/**
 * Array of message mention handlers
 *
 * @type {Handler[]}
 */
const handlers = []

/**
 * Standard mention handler
 *
 * This is meant to be a fallback option if no other handler can take a mention. It implements some easter
 * eggs for fun.
 *
 * @type {Handler}
 */
const fallbackHandler = require("./fallback")

const contents = fs
  .readdirSync(handlersDir)
  .filter(jsNoTests)
  .filter(noDotFiles)
  .filter((file) => {
    return file !== basename && file !== "fallback.js"
  })

contents.forEach((mention_file) => {
  const handler = require(path.join(handlersDir, mention_file))
  handlers.push(handler)
})

module.exports = {
  handlers,
  fallbackHandler,
  /**
   * Handle a message mention
   *
   * This can come from someone replying to a message from Roll It, or by mentioning Roll It explicitly within
   * a message's text.
   *
   * @param  {Message} message             Message mentioning the bot user
   * @param  {Handler[]} handlers_override Array of mention handler objects
   * @return {Promise}                     Promise resolving to the outcome of the handler, usually a Message object
   */
  async handle(message, handlers_override) {
    const our_handlers = handlers_override ?? handlers
    for (const handler of our_handlers) {
      if (handler.canHandle(message)) return handler.handle(message)
    }
    return fallbackHandler.handle(message)
  },
}
