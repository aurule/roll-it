jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")

const withdrawRetestButton = require("./withdraw-retest-button")

describe("withdraw opposed retest button", () => {
  describe("data", () => {
    it("has a sensible id", () => {
      const button = withdrawRetestButton.data("en-US")

      expect(button.data.custom_id).toMatch("opposed_withdraw_retest")
    })

    it("has a label", () => {
      const button = withdrawRetestButton.data("en-US")

      expect(button.data.label).toMatch("Withdraw")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let retest

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture().withParticipants()
      retest = challenge
        .attackerRetest(OpTest.RetestReasons.Item)
        .attachMessage(interaction.message.id)
      challenge.attacker.abilityUsed()
      interaction.user.id = challenge.attacker.uid
      interaction.customId = "opposed_withdraw_retest"
    })

    describe("authorization", () => {
      it("allows retesting user", async () => {
        await expect(withdrawRetestButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows all others", async () => {
        interaction.user.id = "other"

        await expect(withdrawRetestButton.execute(interaction)).rejects.toThrow()
      })
    })

    it("sets retested flag to false", async () => {
      await withdrawRetestButton.execute(interaction)

      expect(retest.record.retested).toBe(false)
    })

    it("generates new test history", async () => {
      await withdrawRetestButton.execute(interaction)

      expect(retest.record.history).not.toMatch("retested")
    })

    describe("when restest was done with an ability", () => {
      beforeEach(() => {
        retest.retestReason("ability")
      })

      it("sets retester's ability_used flag to false", async () => {
        await withdrawRetestButton.execute(interaction)

        expect(challenge.attacker.record.ability_used).toBe(false)
      })
    })

    it("edits to show inert cancelling message", async () => {
      await withdrawRetestButton.execute(interaction)

      expect(interaction.replyContent).toMatch("withdrew their retest")
    })

    describe("when test had a leader", () => {
      beforeEach(() => {
        retest.setLeader(challenge.defender)
      })

      it("sets state to Winning", async () => {
        await withdrawRetestButton.execute(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Winning)
      })

      it("shows winning mmessage", async () => {
        await withdrawRetestButton.execute(interaction)

        expect(interaction.replyContent).toMatch("is currently winning")
      })
    })

    describe("when test was tied", () => {
      it("sets state to Tying", async () => {
        await withdrawRetestButton.execute(interaction)

        expect(challenge.record.state).toEqual(Challenge.States.Tying)
      })

      it("shows tying mmessage", async () => {
        await withdrawRetestButton.execute(interaction)

        expect(interaction.replyContent).toMatch("challenge is tied")
      })
    })
  })
})
