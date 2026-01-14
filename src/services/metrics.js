const { PostHog } = require("posthog-node")

function metricsClient() {
  if (process.env.NODE_ENV === "production") {
    return new PostHog(process.env.PH_KEY, {
      host: "https://us.i.posthog.com",
      enableExceptionAutocapture: true,
    })
  }
  return {}
}

const client = metricsClient()

function sendEvent(event, userId, custom_properties = {}) {
  // no-op unless we're in production to avoid spam during testing
  if (process.env.NODE_ENV !== "production") return
  return client.capture({
    distinctId: userId.toString(),
    event,
    properties: {
      $set: custom_properties,
    },
  })
}

function sendError(err, custom_properties = {}) {
  // no-op unless we're in production to avoid spam during testing
  if (process.env.NODE_ENV !== "production") return
  return client.captureException(err, custom_properties)
}

module.exports = {
  posthog: client,
  sendError,
  sendEvent,
}
