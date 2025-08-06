jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const accepted = require("./accepted")

describe("opposed tie accepted message", () => {
  describe("data", () => {
    let challenge

    beforeEach(() => {
      challenge = new ChallengeFixture(Challenge.States.Accepted).setSummary("challenge summary")
    })

    afterEach(() => {
      challenge.cleanup()
    })

    it("shows the accepted message", () => {
      const result = accepted.data(challenge.id)

      expect(result.content).toMatch("ended in a tie")
    })

    it("includes the challenge summary", () => {
      const result = accepted.data(challenge.id)

      expect(result.content).toMatch("challenge summary")
    })
  })
})
