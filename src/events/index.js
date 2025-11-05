const fs = require("node:fs")
const path = require("node:path")
const { performance } = require("node:perf_hooks")
const v8 = require("node:v8")

const { jsNoTests } = require("../util/filters")
const { metrics } = require("../db/stats")
const { logger } = require("../util/logger")

const basename = path.basename(__filename)
const eventsDir = __dirname

module.exports = {
  /**
   * Register event handlers to the given client
   *
   * @param  {Client} client Discord.js client object
   */
  register(client) {
    const eventFiles = fs
      .readdirSync(eventsDir)
      .filter(jsNoTests)
      .filter((file) => {
        return file !== basename
      })
    for (const file of eventFiles) {
      const eventFilePath = path.join(eventsDir, file)
      const event = require(eventFilePath)
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
      } else {
        client.on(event.name, (...args) => {
          const context = JSON.stringify(event.logContext(...args), (_key, value) => {
            if (typeof value === "bigint") {
              return value.toString()
            }
            return value
          })

          const timing_data = {
            event: event.name,
            serialized: v8.serialize(args).toString("hex"),
            context,
            began: performance.now(),
            finished: 0,
          }
          try {
            return event.execute(...args)
          } finally {
            if (!event.logMe) return
            timing_data.finished = performance.now()
            logger.debug(timing_data)
            metrics.logTiming(timing_data)
          }
        })
      }
      logger.debug(
        {
          handler: event.name,
          frequency: event.once ? "once" : "all",
        },
        `Registered event handler ${event.name}`,
      )
    }
  },
}
