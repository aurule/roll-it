vitest.mock("../../util/message-builders")

import { ChallengeFixture } from "../../../testing/challenge-fixture.js"
import { Challenge } from "../../db/opposed/challenge.js"

import { messageData } from "./relented.js"

describe("opposed relented message", () => {
  describe("messageData", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Relented)
        .withParticipants()
        .setSummary("challenge summary")
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the relented message", () => {
      const result = messageData(challenge.id)

      expect(result.content).toMatch("**relented** to the challenge")
    })
  })
})
