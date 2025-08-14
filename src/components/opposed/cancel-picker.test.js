jest.mock("../../util/message-builders")

const { ChallengeFixture } = require("../../../testing/challenge-fixture")
const { Interaction } = require("../../../testing/interaction")
const { Challenge } = require("../../db/opposed/challenge")
const { OpTest } = require("../../db/opposed/optest")

const cancelPicker = require("./cancel-picker")

describe("opposed test cancel reason picker", () => {
  let challenge
  let cancelling_test

  beforeEach(() => {
    challenge = new ChallengeFixture(Challenge.States.Cancelling).withParticipants()
    cancelling_test = challenge.attackerRetest()
  })

  describe("data", () => {
    it("has a descriptive placeholder", () => {
      const selector = cancelPicker.data(challenge.record)

      expect(selector.data.placeholder).toMatch("How are you cancelling")
    })

    it.each([["ability"], ["other"]])("includes the %s option", (advantage) => {
      const selector = cancelPicker.data(challenge.record)

      const option_names = selector.options.map((o) => o.data.value)
      expect(option_names).toContain(advantage)
    })

    it("requires one value", () => {
      const selector = cancelPicker.data(challenge.record)

      expect(selector.data.min_values).toEqual(1)
      expect(selector.data.max_values).toEqual(1)
    })
  })

  describe("execute", () => {
    let interaction

    beforeEach(() => {
      interaction = new Interaction()
      interaction.values = ["ability"]
      interaction.user.id = challenge.defender.uid
      cancelling_test.attachMessage(interaction.message.id)

      const selector = cancelPicker.data(challenge.record)
      interaction.customId = selector.data.custom_id
    })

    describe("authorization", () => {
      it("allows cancelling user", async () => {
        await expect(cancelPicker.execute(interaction)).resolves.not.toThrow()
      })

      it("disallows attacking user", async () => {
        interaction.user.id = challenge.attacker.uid

        await expect(cancelPicker.execute(interaction)).rejects.toThrow()
      })
    })

    it("saves cancel creason", async () => {
      await cancelPicker.execute(interaction)

      expect(cancelling_test.record.cancelled_with).toEqual(OpTest.CancelReasons.Ability)
    })
  })
})
