const { PostHog } = require("posthog-node")

const client = new PostHog(
  process.env.PH_KEY,
  {
    host: "https://us.i.posthog.com",
    enableExceptionAutocapture: true,
  }
)

module.exports = {
  posthog: client,
}
