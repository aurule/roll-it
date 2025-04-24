const fs = require("fs")
const path = require("path")

const { jsNoTests, noDotFiles } = require("../util/filters")

const basename = path.basename(__filename)
const handlersDir = __dirname

const handlers = []
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
  async handle(message) {
    for (const handler of handlers) {
      if (handler.canHandle(message)) return handler.handle(message)
    }
    return fallbackHandler.handle(message)
  },
}
