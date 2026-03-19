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

/**
 * Capture user info
 * @param  {User} user Discord user object
 */
export function sendUser(user) {
  return client.capture({
    distinctId: user.id.toString(),
    event: "$set",
    properties: {
      $set: {
        name: user.username,
      },
    },
  })
}

/**
 * Capture an analytics event
 * @param  {string}    event             Event name
 * @param  {Snowflake} userId            User's Discord ID
 * @param  {object}    custom_properties Additional data to store about the event
 */
export function sendEvent(event, userId, custom_properties = {}) {
  return client.capture({
    distinctId: userId.toString(),
    event,
    properties: custom_properties,
  })
}

/**
 * Capture an error
 *
 * This should only be used for errors caused by our own code, _not_ errors from Discord's API.
 *
 * @param  {Error}  err               Error object to capture
 * @param  {object} custom_properties Additional error info to store
 */
export function sendError(err, custom_properties = {}) {
  return client.captureException(err, custom_properties)
}
