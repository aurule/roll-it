const pino = require("pino")

require("dotenv").config({ quiet: true })

function pickStream(env_name = process.env.NODE_ENV) {
  if (env_name == "development") {
    const pretty = require("pino-pretty")
    return pretty()
  }
  if (env_name == "test") {
    const devnull = require("dev-null")
    return devnull()
  }
  if (env_name == "ci") {
    const devnull = require("dev-null")
    return devnull()
  }
  if (env_name == "production") {
    // makes use of these envvars:
    // OTEL_EXPORTER_OTLP_LOGS_PROTOCOL
    // OTEL_EXPORTER_OTLP_LOGS_ENDPOINT
    // OTEL_RESOURCE_ATTRIBUTES
    return pino.transport({
      target: "pino-opentelemetry-transport",
    })
    // NOTE: Leaving the file config here for ease of reference
    // return pino.transport({
    //   target: "pino/file",
    //   options: {
    //     destination: "/home/qyf/qyf-bot/logs/qyf-bot.log",
    //     mkdir: true,
    //   }
    // })
  }
  throw new Error(`unknown environment "${env_name}"`)
}

const default_levels = {
  development: "info",
  test: "error",
  ci: "error",
  production: "warn",
}

module.exports = {
  logger: pino(
    {
      level: default_levels[process.env.NODE_ENV],
    },
    pickStream(),
  ),
  pickStream,
}
