jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const relented = require("./relented")

describe("opposed relented message", () => {
  describe("data", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Relented).withParticipants().setSummary("challenge summary")
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the relented message", () => {
      const result = relented.data(challenge.id)

      expect(result.content).toMatch("**relented** to the challenge")
    })
  })
})
