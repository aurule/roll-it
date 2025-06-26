const Pino = require("pino")

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
    const papertrail = require("pino-papertrail")
    return papertrail.createWriteStream(
      {
        host: "logs5.papertrailapp.com",
        port: 15191,
        echo: false,
      },
      "qyf-bot",
    )
    // NOTE: Leaving the file config here for ease of reference
    // return Pino.transport({
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
  logger: Pino(
    {
      level: default_levels[process.env.NODE_ENV],
    },
    pickStream(),
  ),
  pickStream,
}
