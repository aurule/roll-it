jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const withdrawn = require("./withdrawn")

describe("opposed challenge withdrawn message", () => {
  describe("data", () => {
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
      const result = withdrawn.data(challenge.id)

      expect(result.content).toMatch("withdrew their challenge")
    })
  })
})
