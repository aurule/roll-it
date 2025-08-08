jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const winning = require("./winning")

describe("opposed winning summary message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Winning)
      .withParticipants()
      .setSummary("test summary")
    challenge.addAttackerWin()
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the winning message", () => {
      const result = winning.data(challenge.id)

      expect(result.content).toMatch("is currently winning")
    })

    it("shows the summary", () => {
      const result = winning.data(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("mentions the winner", () => {
      const result = winning.data(challenge.id)

      expect(result.content).toMatch("<@atk>")
    })

    it("shows the summary", () => {
      const result = winning.data(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has a concede button", () => {
      const result = winning.data(challenge.id)

      expect(result).toHaveComponent("opposed_concede")
    })

    it("has a retest picker", () => {
      const result = winning.data(challenge.id)

      expect(result).toHaveComponent("opposed_retest_select")
    })

    it("has an retest button", () => {
      const result = winning.data(challenge.id)

      expect(result).toHaveComponent("opposed_retest")
    })
  })

  describe("inert", () => {
    it("shows the headline", () => {
      const result = winning.inert(challenge.id)

      expect(result.content).toMatch("is currently winning")
    })

    it("shows the summary", () => {
      const result = winning.data(challenge.id)

      expect(result.content).toMatch("test summary")
    })

    it("has no components", () => {
      const result = winning.inert(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
