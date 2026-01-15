import pino from "pino"

export function pickStream(env_name = process.env.NODE_ENV) {
  if (env_name == "development") {
    return pino.transport({
      target: "pino-pretty"
    })
  }
  if (env_name == "test") {
    return pino.transport({
      target: "dev-null"
    })
  }
  if (env_name == "ci") {
    return pino.transport({
      target: "dev-null"
    })
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

export const logger = pino(
  {
    level: default_levels[process.env.NODE_ENV],
  },
  pickStream(),
)
