jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Challenge } = require("../../db/opposed/challenge")
const { Participant } = require("../../db/opposed/participant")
const cancelling = require("./cancelling")

describe("opposed cancelling a retest message", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
    challenge.attackerRetest("ability")
  })

  afterEach(() => {
    challenge.cleanup()
  })

  describe("data", () => {
    it("shows the retest reason", () => {
      const result = cancelling.data(challenge.id)

      expect(result.content).toMatch("retesting with an ability")
    })

    it("has a withdraw cancel button", () => {
      const result = cancelling.data(challenge.id)

      expect(result).toHaveComponent("opposed_withdraw_retest")
    })

    it("has a cancel button", () => {
      const result = cancelling.data(challenge.id)

      expect(result).toHaveComponent("opposed_cancel")
    })

    describe("with 'cancels' advantage", () => {
      beforeEach(() => {
        challenge.defender.setAdvantages([Participant.Advantages.Cancels])
      })

      it("shows cancel reason picker", () => {
        const result = cancelling.data(challenge.id)

        expect(result).toHaveComponent("opposed_cancel_select")
      })

      it("shows cancels disclaimer", () => {
        const result = cancelling.data(challenge.id)

        expect(result.content).toMatch("you will see this prompt for every retest")
      })
    })
  })

  describe("inert", () => {
    it("shows the retest reason", () => {
      const result = cancelling.inert(challenge.id)

      expect(result.content).toMatch("retesting with an ability")
    })

    it("has no components", () => {
      const result = cancelling.inert(challenge.id)

      expect(result.components).toEqual([{ components: [] }])
    })
  })
})
