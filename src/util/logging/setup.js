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
    return pino.transport({
      target: "./opentelemetry-transport.js",
    })
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
