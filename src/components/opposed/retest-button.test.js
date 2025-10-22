jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")
const { Participant } = require("../../db/opposed/participant")

const retestButton = require("./retest-button")

describe("retest result button", () => {
  describe("data", () => {
    it("has the retest label", () => {
      const result = retestButton.data("en-US")

      expect(result.data.label).toMatch("Retest")
    })
  })

  describe("canCancel", () => {
    it.concurrent.each([
      ["ability", false, false, true],
      ["ability", true, false, false],
      ["ability", false, true, true],
      ["ability", true, true, true],
      ["named", false, false, true],
      ["named", true, false, false],
      ["named", false, true, true],
      ["named", true, true, true],
      ["item", false, false, false],
      ["item", true, false, false],
      ["item", false, true, true],
      ["item", true, true, true],
    ])(
      "reason with %s\tability_used %p\tcancels %p \treturns %p",
      (reason, ability_used, cancels, expected) => {
        const challenge = new ChallengeFixture(Challenge.States.Winning).withParticipants()
        const retest = challenge.attackerRetest(reason)
        challenge.defender.abilityUsed(ability_used)
        if (cancels) {
          challenge.defender.setAdvantages(["cancels"])
        }

        const result = retestButton.canCancel(retest.record)

        expect(result).toBe(expected)
      },
    )
  })

  describe("execute", () => {
    let interaction
    let challenge
    let rps_test

    beforeEach(() => {
      interaction = new Interaction()
      challenge = new ChallengeFixture(Challenge.States.Winning)
        .withParticipants()
        .attachMessage(interaction.message.id)
      rps_test = challenge.defenderRetest(OpTest.RetestReasons.Power).setLeader(challenge.attacker)
      interaction.user.id = challenge.defender_uid
    })

    describe("authorization", () => {
      it("allows attacker", async () => {
        interaction.user.id = challenge.attacker_uid

        await expect(retestButton.execute(interaction)).resolves.not.toThrow()
      })

      it("allows defender", async () => {
        interaction.user.id = challenge.defender_uid

        await expect(retestButton.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows other users", async () => {
        interaction.user.id = "asdf"

        await expect(retestButton.execute(interaction)).rejects.toThrow("is not allowed")
      })
    })

    it("shows error with no retest reason", async () => {
      rps_test.retestReason(null)

      await retestButton.execute(interaction)

      expect(interaction.replyContent).toMatch("must select a reason")
    })

    it("shows error when retester is different from retest reason picker", async () => {
      rps_test.retester(challenge.attacker)

      await retestButton.execute(interaction)

      expect(interaction.replyContent).toMatch("also chosen a retest")
    })

    it("edits winning message to be inert", async () => {
      await retestButton.execute(interaction)

      expect(interaction.replyContent).toMatch("<@atk> is currently winning")
    })

    it("edits tying message to be inert", async () => {
      challenge.setState(Challenge.States.Tying)

      await retestButton.execute(interaction)

      expect(interaction.replyContent).toMatch("challenge is tied")
    })

    it("marks test retested flag true", async () => {
      await retestButton.execute(interaction)

      expect(rps_test.record.retested).toBe(true)
    })

    it("generates new test history", async () => {
      await retestButton.execute(interaction)

      expect(rps_test.record.history).toMatch("<@def> retested")
    })

    it("when reason is ability, marks retester's ability_used flag true", async () => {
      rps_test.retestReason(OpTest.RetestReasons.Ability)

      await retestButton.execute(interaction)

      expect(challenge.defender.record.ability_used).toBe(true)
    })

    it("when reason is named ability, marks retester's ability_used flag true", async () => {
      rps_test.retestReason(OpTest.RetestReasons.Named)

      await retestButton.execute(interaction)

      expect(challenge.defender.record.ability_used).toBe(true)
    })

    describe("when canceller can cancel", () => {
      it("sets challenge state to Cancelling", async () => {
        challenge.attacker.setAdvantages([Participant.Advantages.Cancels])

        await retestButton.execute(interaction)

        expect(challenge.record.state).toMatch(Challenge.States.Cancelling)
      })

      it("without cancels advantage, sets cancelled_with to ability", async () => {
        rps_test.retestReason(OpTest.RetestReasons.Ability)

        await retestButton.execute(interaction)

        expect(rps_test.record.cancelled_with).toMatch("ability")
      })

      it("shows cancelling message", async () => {
        challenge.attacker.setAdvantages([Participant.Advantages.Cancels])

        await retestButton.execute(interaction)

        expect(interaction.replyContent).toMatch("<@atk> may cancel the retest")
      })
    })

    describe("when canceller cannot cancel", () => {
      it("sets challenge state to Throwing", async () => {
        await retestButton.execute(interaction)

        expect(challenge.record.state).toMatch(Challenge.States.Throwing)
      })

      it("shows throwing message", async () => {
        await retestButton.execute(interaction)

        expect(interaction.replyContent).toMatch("choose what you will throw")
      })
    })
  })
})
