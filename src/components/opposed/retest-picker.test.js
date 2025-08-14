jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")

const retestPicker = require("./retest-picker")

describe("opposed retest reason picker", () => {
  let challenge

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
  })

  describe("data", () => {
    it("has a descriptive placeholder", () => {
      const selector = retestPicker.data(challenge.record)

      expect(selector.data.placeholder).toMatch("How are you retesting")
    })

    it.concurrent.each(Object.entries(OpTest.RetestReasons).map(e => [e[1]]))("includes the %s option", (advantage) => {
      const challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
      const selector = retestPicker.data(challenge.record)

      const option_names = selector.options.map((o) => o.data.value)
      expect(option_names).toContain(advantage)
    })

    it("requires one value", () => {
      const selector = retestPicker.data(challenge.record)

      expect(selector.data.min_values).toEqual(1)
      expect(selector.data.max_values).toEqual(1)
    })
  })

  describe("execute", () => {
    let interaction
    let old_test

    beforeEach(() => {
      interaction = new Interaction()
      interaction.values = ["ability"]
      interaction.user.id = challenge.defender.uid
      old_test = challenge.addTest()
      challenge.attachMessage(interaction.message.id)
    })

    describe("authorization", () => {
      it("allows attacker", async () => {
        interaction.user.id = challenge.attacker.uid

        await expect(retestPicker.execute(interaction)).resolves.not.toThrow()
      })

      it("allows defender", async () => {
        interaction.user.id = challenge.defender.uid

        await expect(retestPicker.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows other users", async () => {
        interaction.user.id = "other"

        await expect(retestPicker.execute(interaction)).rejects.toThrow()
      })
    })

    describe("with ability", () => {
      describe("when ability is valid", () => {
        it("saves retest creason", async () => {
          await retestPicker.execute(interaction)

          expect(old_test.record.retest_reason).toEqual(OpTest.RetestReasons.Ability)
        })
      })

      describe("when ability is already used", () => {
        it("replies with an error message", async () => {
          challenge.defender.abilityUsed()

          await retestPicker.execute(interaction)

          expect(interaction.replyContent).toMatch("already used an ability")
        })
      })
    })

    describe("with non-ability reason", () => {
      it("saves retest creason", async () => {
          interaction.values = ["item"]

          await retestPicker.execute(interaction)

          expect(old_test.record.retest_reason).toEqual(OpTest.RetestReasons.Item)
        })
    })

    it("saves current user as retester", async () => {
      await retestPicker.execute(interaction)

      expect(old_test.record.retester_id).toEqual(challenge.defender.id)
    })

    it("saves other participant as canceller", async () => {
      await retestPicker.execute(interaction)

      expect(old_test.record.canceller_id).toEqual(challenge.attacker.id)
    })
  })
})
