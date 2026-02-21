vitest.mock("../../util/message-builders")

import { Feedback } from "./feedback.js"

import { Interaction } from "../../../testing/interaction.js"
import { Feedback as FeedbackDB } from "../../db/feedback.js"
import { UserBans } from "../../db/bans.js"

describe("/help feedback", () => {
  let interaction

  beforeEach(() => {
    interaction = new Interaction()
  })

  describe("perform", () => {
    it("creates a feedback record", () => {
      interaction.command_options = {
        message: "yeehaw"
      }
      const cmd = new Feedback(interaction)
      const feedbacks = new FeedbackDB()
      const old_total = feedbacks.count()

      cmd.perform()

      expect(feedbacks.count()).toBeGreaterThan(old_total)
    })
  })

  describe("validate", () => {
    it("rejects banned users", () => {
      const bans = new UserBans(interaction.user.id)
      bans.create("testing")
      const cmd = new Feedback(interaction)

      const result = cmd.validate()

      expect(result).toMatch("not allowed")
    })
  })
})
