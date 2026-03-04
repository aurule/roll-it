vitest.mock("../../util/message-builders")
vitest.mock("../../services/api")

import { Topic } from "./topic.js"

import { Interaction } from "../../../testing/interaction.js"

describe("/help topic", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("perform", () => {
    it("shows the named topic's help text", async () => {
      interaction.command_options = {
        topic: "about",
      }
      const cmd = new Topic(interaction)

      const result = await cmd.perform()

      expect(result).toMatch("About Roll It")
    })
  })

  describe("validate", () => {
    it("returns error with unknown topic", () => {
      interaction.command_options = {
        topic: "thingie",
      }
      const cmd = new Topic(interaction)

      const result = cmd.validate()

      expect(result).toMatch("No help is available")
    })
  })

  describe("help_data", () => {
    it("includes topic list", () => {
      const result = Topic.help_data({ locale: "en-US" })

      expect(result.topics.some((t) => t.includes("About Roll It"))).toBeTruthy()
    })
  })
})
