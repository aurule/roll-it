jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")

const cancelButton = require("./cancel-button")

describe("opposed retest cancel button", () => {
  describe("data", () => {
    it("has the accept tie label", () => {
      const result = cancelButton.data("en-US")

      expect(result.data.label).toMatch("Cancel")
    })
  })

  describe("execute", () => {
    let interaction
    let challenge
    let retest

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
      retest = challenge
        .attackerRetest("ability")
        .attachMessage(interaction.message.id)
        .cancelWith("ability")
      retest.attackerChop("rock")
      retest.defenderChop("paper")
      interaction.user.id = challenge.defender_uid
    })

    describe("authorization", () => {
      it("allows canceller", async () => {
        interaction.user.id = challenge.defender_uid

        await expect(cancelButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows retester", async () => {
        interaction.user.id = challenge.attacker_uid

        await expect(cancelButton.execute(interaction)).rejects.toThrow("is not allowed")
      })

      it("disallows other users", async () => {
        interaction.user.id = "asdf"

        await expect(cancelButton.execute(interaction)).rejects.toThrow("is not allowed")
      })
    })

    describe("validation", () => {
      it("errors on missing cancellation reason", async () => {
        retest.cancelWith("")

        await cancelButton.execute(interaction)

        expect(interaction.replyContent).toMatch("must choose how you're cancelling")
      })
    })

    it("sets test cancelled flag to true", async () => {
      await cancelButton.execute(interaction)

      expect(retest.record.cancelled).toBe(true)
    })

    it("updates test history string", async () => {
      await cancelButton.execute(interaction)

      expect(retest.record.history).toMatch("<@def> cancelled with")
    })

    it("cancelling with ability marks canceller's ability_used flag true", async () => {
      retest.cancelWith("ability")

      await cancelButton.execute(interaction)

      expect(challenge.defender.record.ability_used).toBe(true)
    })

    it("cancelling with other leaves canceller's ability_used flag alone", async () => {
      retest.cancelWith("other")

      await cancelButton.execute(interaction)

      expect(challenge.defender.record.ability_used).toBe(false)
    })

    it.skip("edits to show inert cancelling message", async () => {
      await cancelButton.execute(interaction)

      expect(interaction.replyContent).toMatch("<@def> cancelled with an ability")
    })

    it("with previously winning test, shows the winning message", async () => {
      retest.setLeader(challenge.defender)

      await cancelButton.execute(interaction)

      expect(interaction.replyContent).toMatch("<@def> leads")
    })

    it("with previously tied test, shows the tying message", async () => {
      await cancelButton.execute(interaction)

      expect(interaction.replyContent).toMatch("challenge is tied")
    })
  })
})
