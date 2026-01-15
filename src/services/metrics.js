import { PostHog } from "posthog-node"

/**
 * Create the remote metrics client
 *
 * Outside of a production environment, this returns an object full of no-ops
 * so we don't spam ourselves.
 *
 * @return {PostHog} PostHog client instance
 */
function metricsClient() {
  if (process.env.NODE_ENV === "production") {
    return new PostHog(process.env.PH_KEY, {
      host: "https://us.i.posthog.com",
      enableExceptionAutocapture: true,
    })
  }

  return {
    shutdown() {},
    capture() {},
    captureException() {},
  }
}

export const client = metricsClient()

// Gracefully shut down the posthog handler
process.on("beforeExit", async (_code) => {
  await client.shutdown()
})

export function sendEvent(event, userId, custom_properties = {}) {
  return client.capture({
    distinctId: userId.toString(),
    event,
    properties: {
      $set: custom_properties,
    },
  })
}

export function sendError(err, custom_properties = {}) {
  return client.captureException(err, custom_properties)
}
