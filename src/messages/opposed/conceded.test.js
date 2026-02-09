vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"

import { messageData } from "./conceded.js"

describe("opposed challenge conceded message", () => {
  describe("messageData", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Conceded)
        .withParticipants()
        .setSummary("challenge summary")
      challenge.addAttackerWin()
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the conceded message", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("<@atk> wins")
    })

    it("includes the challenge summary", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("challenge summary")
    })
  })
})
