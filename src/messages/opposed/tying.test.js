jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const tying = require("./tying")

describe("opposed tying summary message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Tying)
      .withParticipants()
      .setSummary("test summary")
    challenge.addTie()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the tying message", () => {
      const result = tying.data(challenge.id)

      expect(result.content).toMatch("challenge is tied")
    })

    it("shows the summary", () => {
      const result = tying.data(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has an accept button", () => {
      const result = tying.data(challenge.id)

      expect(result).toHaveComponent("opposed_accept")
    })

    it("has a retest picker", () => {
      const result = tying.data(challenge.id)

      expect(result).toHaveComponent("opposed_retest_select")
    })

    it("has an retest button", () => {
      const result = tying.data(challenge.id)

      expect(result).toHaveComponent("opposed_retest")
    })
  })
})
