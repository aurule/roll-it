vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"

import { messageData } from "./withdrawn.js"

describe("opposed challenge withdrawn message", () => {
  describe("messageData", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Withdrawn)
        .withParticipants()
        .setSummary("challenge summary")
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the withdrawn message", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("withdrew their challenge")
    })
  })
})
