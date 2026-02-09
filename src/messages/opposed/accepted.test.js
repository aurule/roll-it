vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"
import { messageData } from "./accepted.js"

describe("opposed tie accepted message", () => {
  describe("messageData", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Accepted).setSummary("challenge summary")
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the accepted message", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("ended in a tie")
    })

    it("includes the challenge summary", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("challenge summary")
    })
  })
})
