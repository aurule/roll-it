jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const conceded = require("./conceded")

describe("opposed challenge conceded message", () => {
  describe("data", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Conceded).withParticipants().setSummary("challenge summary")
      challenge.addAttackerWin()
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the conceded message", () => {
      const result = conceded.data(challenge.id)

      expect(result.content).toMatch("<@atk> wins")
    })

    it("includes the challenge summary", () => {
      const result = conceded.data(challenge.id)

      expect(result.content).toMatch("challenge summary")
    })
  })
})
