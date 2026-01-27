jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
import { Challenge } from "../../db/opposed/challenge.js"
const withdrawn = require("./withdrawn")

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
      const result = withdrawn.messageData(challenge.id)

      expect(result.content).toMatch("withdrew their challenge")
    })
  })
})
